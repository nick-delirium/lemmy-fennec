import {
  BanFromCommunity,
  BanFromCommunityResponse,
  CommunityId,
  DeletePost,
  FeaturePost,
  GetPostsResponse,
  ListingType,
  LockPost,
  LoginResponse,
  MarkPostAsRead,
  PostId,
  PostResponse,
  PostView,
  RemovePost,
  SavePost,
  SortType,
  SuccessResponse,
} from "lemmy-js-client";
import { action, makeObservable, observable } from "mobx";

import { asyncStorageHandler, dataKeys } from "../asyncStorage";
import { Score } from "./apiClient";
import DataClass from "./dataClass";
import { preferences } from "./preferences";

/**
 * !!!TODO!!!
 * split this mess somehow, maybe move some parts of the state into
 * components where possible,
 * or split into multiple stores that will extend basic feed class
 * */

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
  TopSixHour: "TopSixHour",
  TopTwelveHour: "TopTwelveHour",
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
  public savedPosts: PostView[] = [];
  public filters: Filters = defaultFilters;
  public page = 1;
  public commPage = 1;
  public savedPostsPage = 1;
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
      savedPostsPage: observable,
      savedPosts: observable.deep,
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
      setSavedPosts: action,
      setSavedPostsPage: action,
      setSinglePost: action,
      concatSavedPosts: action,
      setCommunityPosts: action,
    });
  }

  setSavedPosts(posts: PostView[]) {
    this.savedPosts = posts;
  }

  setSavedPostsPage(page: number) {
    this.savedPostsPage = page;
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

  async getPosts(communityId?: number, communityName?: string) {
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
        });
      },
      (result) => {
        const ignoredInsts = preferences.getIgnoredInstances();
        const len = ignoredInsts.length;
        if (len > 0) {
          result.posts = result.posts.filter((post) => {
            // https://lemmy.zone/c/communityname
            const inst = post.community.actor_id;
            let includePost = true;
            for (let i = 0; i < len; i++) {
              const ignoredInst = ignoredInsts[i];
              if (inst.includes(ignoredInst)) {
                includePost = false;
              }
            }
            return includePost;
          });
        }
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

  async getSinglePost(postId: PostId) {
    await this.fetchData<PostResponse>(
      () =>
        this.api.getSinglePost({
          id: postId,
        }),
      ({ post_view }) => {
        this.setSinglePost(post_view);
      },
      (e) => console.error(e),
      false,
      "single post"
    );
  }

  async changePage(page, communityId?: number) {
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

  async nextPage(communityId?: number) {
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
        }),
      ({ posts }) => {
        const ignoredInsts = preferences.getIgnoredInstances();
        const len = ignoredInsts.length;
        if (len > 0) {
          posts = posts.filter((post) => {
            // https://lemmy.zone/c/communityname
            const inst = post.community.actor_id;
            let includePost = true;
            for (let i = 0; i < len; i++) {
              const ignoredInst = ignoredInsts[i];
              if (inst.includes(ignoredInst)) {
                includePost = false;
              }
            }
            return includePost;
          });
        }
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
    score: (typeof Score)[keyof typeof Score],
    communityPost?: boolean
  ) {
    // updating local state before request because they're hella slow rn
    this.updatePostById(postId, { my_vote: score }, communityPost);

    await this.fetchData<PostResponse>(
      () =>
        this.api.ratePost({
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
    console.log(form);
    await this.fetchData<SuccessResponse>(
      () => this.api.markPostRead(form),
      ({ success }) =>
        this.updatePostById(form.post_ids[0], { read: success }, communityPost),
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

  async getSavedPosts() {
    await this.fetchData<GetPostsResponse>(
      () =>
        this.api.getPosts({
          saved_only: true,
          page: 1,
          limit: 20,
          type_: "All",
          sort: "New",
        }),
      ({ posts }) => {
        console.log("result", this.savedPostsPage, posts.length);
        this.setSavedPosts(posts);
      },
      (e) => console.error(e),
      false,
      "get saved posts"
    );
  }

  async changeSavedPage(page: number, concat?: boolean) {
    this.setSavedPostsPage(page);
    await this.fetchData<GetPostsResponse>(
      () =>
        this.api.getPosts({
          saved_only: true,
          page: this.savedPostsPage,
          limit: 20,
          type_: "All",
          sort: "New",
        }),
      ({ posts }) => {
        if (concat) this.concatSavedPosts(posts);
        else this.setSavedPosts(posts);
      },
      (e) => console.error(e),
      false,
      "change saved posts page: " + page
    );
  }

  concatSavedPosts(posts: PostView[]) {
    const uniquePosts = posts.filter(
      (p) => this.savedPosts.findIndex((p2) => p2.post.id === p.post.id) === -1
    );
    this.savedPosts = this.savedPosts.concat(uniquePosts);
  }
}

export const postStore = new PostStore();
