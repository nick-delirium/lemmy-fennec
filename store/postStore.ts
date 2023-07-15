import { makeObservable, observable, action } from "mobx";
import DataClass from "./dataClass";
import {
  PostView,
  PostId,
  GetPostsResponse,
  LoginResponse,
  PostResponse,
  ListingType,
  SortType,
  CommunityId,
  SavePost,
  MarkPostAsRead,
  DeletePost,
  RemovePost,
  LockPost,
  BanFromCommunity,
  BanFromCommunityResponse,
  FeaturePost,
} from "lemmy-js-client";
import { Score } from "./apiClient";
import { asyncStorageHandler, dataKeys } from "../asyncStorage";

interface Filters {
  type_: ListingType;
  sort: SortType;
  saved_only: boolean;
  community?: CommunityId;
  limit: number;
}

export const SortTypeMap = {
  Active: "Active",
  Hot: "Hot",
  New: "New",
  Old: "Old",
  TopDay: "TopDay",
  TopWeek: "TopWeek",
  TopMonth: "TopMonth",
  TopYear: "TopYear",
  TopAll: "TopAll",
  MostComments: "MostComments",
  NewComments: "NewComments",
} as const;

export const ListingTypeMap = {
  All: "All",
  Local: "Local",
  Subscribed: "Subscribed",
} as const;

const defaultFilters: Filters = {
  type_: ListingTypeMap.Local,
  sort: SortTypeMap.New,
  saved_only: false,
  limit: 15,
};

class PostStore extends DataClass {
  public posts: PostView[] = [];
  public communityPosts: PostView[] = [];
  public filters: Filters = defaultFilters;
  public page = 1;
  public commPage = 1;
  // hack for autoscroll
  public feedKey = 0;
  public singlePost: PostView | null = null;

  constructor() {
    super();

    // todo add settings page with this things...
    // + default sort and type
    asyncStorageHandler.readData(dataKeys.postsLimit).then((limit) => {
      if (limit) {
        this.setFilters({ limit: parseInt(limit, 10) });
      }
    });
    asyncStorageHandler.readData(dataKeys.filters).then((filters) => {
      if (filters) {
        this.setFilters(JSON.parse(filters));
      }
    });

    makeObservable(this, {
      posts: observable.deep,
      page: observable,
      commPage: observable,
      singlePost: observable,
      filters: observable.deep,
      isLoading: observable,
      feedKey: observable,
      communityPosts: observable.deep,
      updatePostById: action,
      setPosts: action,
      setPage: action,
      setCommPage: action,
      setClient: action,
      setIsLoading: action,
      concatPosts: action,
      concatCommunityPosts: action,
      setFilters: action,
      bumpFeedKey: action,
      setSinglePost: action,
      setCommunityPosts: action,
    });
  }

  setPage(page: number) {
    this.page = page;
  }

  setCommPage(page: number) {
    this.commPage = page;
  }

  setCommunityPosts(posts: PostView[]) {
    this.communityPosts = posts;
  }

  bumpFeedKey() {
    this.feedKey += 1;
  }

  setFilters(filters: Partial<Filters>) {
    this.filters = Object.assign(this.filters, filters);
    void asyncStorageHandler.setData(
      dataKeys.filters,
      JSON.stringify(this.filters)
    );
  }

  setSinglePost(post: PostView) {
    this.singlePost = post;
  }

  resetFilters() {
    this.filters = defaultFilters;
  }

  async getPosts(
    loginDetails?: LoginResponse,
    communityId?: number,
    communityName?: string
  ) {
    const filters =
      communityId || communityName
        ? {
            ...this.filters,
            community_id: communityId,
            community_name: communityName,
            type_: ListingTypeMap.All,
          }
        : this.filters;
    await this.fetchData<GetPostsResponse>(
      () => {
        return this.api.getPosts({
          ...filters,
          page: 1,
          auth: loginDetails ? loginDetails?.jwt : undefined,
        });
      },
      (result) => {
        if (communityId || communityName) {
          this.setCommunityPosts(result.posts);
        } else {
          this.setPosts(result.posts);
        }
      },
      (e) => console.error(e),
      false,
      "get posts"
    );
  }

  async getSinglePost(postId: PostId, loginDetails?: LoginResponse) {
    await this.fetchData<PostResponse>(
      () =>
        this.api.getSinglePost({
          id: postId,
          auth: loginDetails ? loginDetails.jwt : undefined,
        }),
      ({ post_view }) => {
        this.setSinglePost(post_view);
      },
      (e) => console.error(e),
      false,
      "single post"
    );
  }

  async changePage(page, loginDetails?: LoginResponse, communityId?: number) {
    if (communityId) {
      this.setCommPage(page);
    } else {
      this.setPage(page);
    }
    await this.fetchData<GetPostsResponse>(
      () =>
        this.api.getPosts({
          ...this.filters,
          page: communityId ? this.commPage : this.page,
          community_id: communityId,
          auth: loginDetails ? loginDetails.jwt : undefined,
        }),
      ({ posts }) => {
        if (communityId) {
          this.setCommunityPosts(posts);
        } else {
          this.setPosts(posts);
        }
      },
      (e) => console.error(e),
      false,
      "change page posts, page: " + page
    );
  }

  async nextPage(loginDetails?: LoginResponse, communityId?: number) {
    if (communityId) {
      this.setCommPage(this.commPage + 1);
    } else {
      this.setPage(this.page + 1);
    }
    await this.fetchData<GetPostsResponse>(
      () =>
        this.api.getPosts({
          ...this.filters,
          page: communityId ? this.commPage : this.page,
          community_id: communityId,
          auth: loginDetails ? loginDetails.jwt : undefined,
        }),
      ({ posts }) => {
        if (communityId) {
          this.concatCommunityPosts(posts);
        } else {
          this.concatPosts(posts);
        }
      },
      (e) => console.error(e),
      false,
      "next page posts"
    );
  }

  concatPosts(posts: PostView[]) {
    const uniquePosts = posts.filter(
      (p) => this.posts.findIndex((p2) => p2.post.id === p.post.id) === -1
    );
    this.posts = this.posts.concat(uniquePosts);
  }

  concatCommunityPosts(posts: PostView[]) {
    const uniquePosts = posts.filter(
      (p) =>
        this.communityPosts.findIndex((p2) => p2.post.id === p.post.id) === -1
    );
    this.communityPosts = this.communityPosts.concat(uniquePosts);
  }

  async ratePost(
    postId: PostId,
    loginDetails,
    score: (typeof Score)[keyof typeof Score],
    communityPost?: boolean
  ) {
    // updating local state before request because they're hella slow rn
    this.updatePostById(postId, { my_vote: score }, communityPost);

    await this.fetchData<PostResponse>(
      () =>
        this.api.ratePost({
          auth: loginDetails?.jwt,
          post_id: postId,
          score: score,
        }),
      ({ post_view }) => {
        this.updatePostById(postId, post_view);
        if (this.singlePost) this.setSinglePost(post_view);
      },
      (e) => console.error(e),
      true,
      "rate post"
    );
  }

  async savePost(
    form: SavePost,
    isSinglePost?: boolean,
    useCommunity?: boolean
  ) {
    await this.fetchData<PostResponse>(
      () => this.api.savePost(form),
      ({ post_view }) => {
        if (isSinglePost) {
          this.setSinglePost(post_view);
        } else {
          this.updatePostById(form.post_id, post_view, useCommunity);
        }
      },
      (e) => console.error(e),
      false,
      "save post"
    );
  }

  updatePostById(
    postId: PostId,
    updatedPost: Partial<PostView>,
    communityPost?: boolean
  ) {
    if (communityPost) {
      this.communityPosts = this.communityPosts.map((post) => {
        if (post.post.id === postId) {
          return { ...post, ...updatedPost };
        }
        return post;
      });
    } else {
      this.posts = this.posts.map((post) => {
        if (post.post.id === postId) {
          return { ...post, ...updatedPost };
        }
        return post;
      });
    }
  }

  setPosts(posts: PostView[]) {
    this.posts = posts;
  }

  async markPostRead(form: MarkPostAsRead, communityPost?: boolean) {
    await this.fetchData<PostResponse>(
      () => this.api.markPostRead(form),
      ({ post_view }) =>
        this.updatePostById(
          form.post_id,
          { read: post_view.read },
          communityPost
        ),
      (e) => console.error(e),
      true,
      "mark post read"
    );
  }

  async deletePost(form: DeletePost) {
    await this.fetchData<PostResponse>(
      () => this.api.deletePost(form),
      () => null,
      (e) => console.error(e),
      false,
      "delete post"
    );
  }

  async modRemovePost(
    form: RemovePost,
    isSinglePost?: boolean,
    useCommunity?: boolean
  ) {
    await this.fetchData<PostResponse>(
      () => this.api.removePost(form),
      ({ post_view }) => {
        if (isSinglePost) this.setSinglePost(post_view);
        else {
          this.updatePostById(post_view.post.id, post_view, useCommunity);
        }
      },
      (e) => console.error(e),
      false,
      "mod remove post"
    );
  }

  async modLockPost(
    form: LockPost,
    isSinglePost?: boolean,
    useCommunity?: boolean
  ) {
    await this.fetchData<PostResponse>(
      () => this.api.lockPost(form),
      ({ post_view }) => {
        if (isSinglePost) this.setSinglePost(post_view);
        else this.updatePostById(post_view.post.id, post_view, useCommunity);
      },
      (e) => console.error(e),
      false,
      "mod lock post"
    );
  }

  async modBanCommunityUser(form: BanFromCommunity) {
    await this.fetchData<BanFromCommunityResponse>(
      () => this.api.banCommunityUser(form),
      () => true,
      (e) => console.error(e),
      false,
      "mod ban community user"
    );
  }

  async modFeaturePost(
    form: FeaturePost,
    isSinglePost?: boolean,
    useCommunity?: boolean
  ) {
    await this.fetchData<PostResponse>(
      () => this.api.featurePost(form),
      ({ post_view }) => {
        console.log(
          "result",
          post_view.post.featured_community,
          post_view.post.featured_local
        );
        if (isSinglePost) this.setSinglePost(post_view);
        else this.updatePostById(post_view.post.id, post_view, useCommunity);
      },
      (e) => console.error(e),
      false,
      "mod feature post"
    );
  }
}

export const postStore = new PostStore();
