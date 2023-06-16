import { makeAutoObservable, observable } from 'mobx';
import {
  LemmyHttp,
  GetPosts,
  PostView,
  PostId,
  Login,
  LoginResponse,
  GetPersonDetailsResponse
} from 'lemmy-js-client';
import ApiService from '../services/apiService';

/**
 * !!! TODO: !!!
 * split post, user, comment, feed logic into own stores
 */

export const Score = {
  Upvote: 1,
  Downvote: -1,
  Neutral: 0,
} as const

class ApiClient {
  public api: ApiService;

  public isLoggedIn = false;
  private username: string;
  public isFeedFetching = false;

  private loginDetails: LoginResponse
  public userProfile: GetPersonDetailsResponse;
  public posts: PostView[] = [];

  constructor() {
    makeAutoObservable(this, { posts: observable.deep });
  }

  setClient(client: LemmyHttp) {
    this.api = new ApiService(client);
  }

  async login(form: Login) {
    try {
      const auth = await this.api.login(form);
      this.setLoginDetails(auth)
      this.setUsername(form.username_or_email);
      this.setLoginState(true);
      return auth;
    } catch (e) {
      console.error(e)
    }
  }

  setUsername(username: string) {
    this.username = username;
  }

  setLoginState(state: boolean) {
    this.isLoggedIn = state;
  }

  setLoginDetails(details: LoginResponse) {
    this.loginDetails = details;
  }

  setPosts(posts: PostView[]) {
    this.posts = posts;
  }

  async getPosts(filters: GetPosts) {
    this.setFeedFetching(true)
    try {
      const { posts } = await this.api.getPosts(
        { ...filters, auth: this.loginDetails ? this.loginDetails.jwt : undefined });
      this.setPosts(posts);
    } catch (e) {
      console.error(e)
    } finally {
      this.setFeedFetching(false);
    }
  }

  async ratePost(postId: PostId, score: typeof Score[keyof typeof Score]) {
    try {
      const { post_view } = await this.api.ratePost({ auth: this.loginDetails?.jwt, post_id: postId, score });
      this.updatePostById(postId, post_view);
    } catch (e) {
      console.error(e)
    }
  }

  updatePostById(postId: PostId, updatedPost: PostView) {
    this.posts = this.posts.map((post) => {
      if (post.post.id === postId) {
        return updatedPost;
      }
      return post;
    });
  }

  setFeedFetching(state: boolean) {
    this.isFeedFetching = state;
  }

  async getProfile() {
    try {
      this.userProfile = await this.api.getProfile({ auth: this.loginDetails.jwt, username: this.username });
      return this.userProfile;
    } catch (e) {
      console.error(e)
    }
  }
}

export const apiClient = new ApiClient();
