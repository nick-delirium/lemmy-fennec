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
  CommunityId, SavePost,
} from 'lemmy-js-client';
import { Score } from "./apiClient";
import { asyncStorageHandler, dataKeys } from "../asyncStorage";

interface Filters {
  type: ListingType
  sort: SortType
  saved_only: boolean
  community?: CommunityId
  page: number
  limit: number
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
} as const

export const ListingTypeMap = {
  All: 'All',
  Local: 'Local',
  Subscribed: 'Subscribed',
} as const

const defaultFilters: Filters = {
  type: ListingTypeMap.Local,
  sort: SortTypeMap.New,
  saved_only: false,
  community: null,
  page: 1,
  limit: 25,
}

class PostStore extends DataClass {
  public posts: PostView[] = [];
  public filters: Filters = defaultFilters
  public singlePost: PostView | null = null;

  constructor() {
    super();

    // todo add settings page with this things...
    // + default sort and type
    asyncStorageHandler.readData(dataKeys.postsLimit).then((limit) => {
      if (limit) {
        this.setFilters({ limit: parseInt(limit, 10) })
      }
    })
    asyncStorageHandler.readData(dataKeys.filters).then((filters) => {
      if (filters) {
        this.setFilters(JSON.parse(filters))
      }
    })

    makeObservable(this, {
      posts: observable.deep,
      filters: observable.deep,
      isLoading: observable,
      updatePostById: action,
      setPosts: action,
      setClient: action,
      setIsLoading: action,
      concatPosts: action,
      setFilters: action,
    });
  }

  setFilters(filters: Partial<Filters>) {
    this.filters =  Object.assign(this.filters, filters)
    void asyncStorageHandler.setData(dataKeys.filters, JSON.stringify(this.filters))
  }

  setSinglePost(post: PostView) {
    this.singlePost = post
  }

  resetFilters() {
    this.filters = defaultFilters
  }

  async getPosts(loginDetails?: LoginResponse) {
    await this.fetchData<GetPostsResponse>(
      () => this.api.getPosts({ ...this.filters, auth: loginDetails ? loginDetails.jwt : undefined }),
      ({ posts }) => this.setPosts(posts),
      (e) => console.error(e)
    )
  }

  async nextPage(loginDetails?: LoginResponse) {
    this.setFilters({ page: this.filters.page + 1 })
    await this.fetchData<GetPostsResponse>(
      () => this.api.getPosts({ ...this.filters, auth: loginDetails ? loginDetails.jwt : undefined }),
      ({ posts }) => this.concatPosts(posts),
      (e) => console.error(e)
    )
  }

  concatPosts(posts: PostView[]) {
    this.posts = this.posts.concat(posts)
  }

  async ratePost(postId: PostId, loginDetails, score: typeof Score[keyof typeof Score]) {
    await this.fetchData<PostResponse>(
      () => this.api.ratePost({ auth: loginDetails?.jwt, post_id: postId, score }),
      ({ post_view }) => this.updatePostById(postId, post_view),
      (e) => console.error(e),
      true,
    )
  }

  async savePost(form: SavePost) {
    await this.fetchData<PostResponse>(
      () => this.api.savePost(form),
      ({ post_view }) => this.updatePostById(form.post_id, post_view),
      (e) => console.error(e),
      true
    )
  }

  updatePostById(postId: PostId, updatedPost: PostView) {
    this.posts = this.posts.map((post) => {
      if (post.post.id === postId) {
        return updatedPost;
      }
      return post;
    });
  }

  setPosts(posts: PostView[]) {
    this.posts = posts;
  }
}

export const postStore = new PostStore();
