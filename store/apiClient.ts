import { makeAutoObservable } from 'mobx';
import {
  LemmyHttp,
  Login,
  LoginResponse,
  GetPersonDetailsResponse
} from 'lemmy-js-client';
import ApiService from '../services/apiService';
import { postStore } from './postStore';
import { profileStore } from './profileStore';
import { commentsStore } from "./commentsStore";

/**
 * !!! TODO: !!!
 * split user, comment, feed logic into own stores
 */

export const Score = {
  Upvote: 1,
  Downvote: -1,
  Neutral: 0,
} as const

class ApiClient {
  public api: ApiService;

  public isLoggedIn = false;

  public loginDetails: LoginResponse
  public postStore = postStore;
  public profileStore = profileStore;
  public commentsStore = commentsStore;

  constructor() {
    makeAutoObservable(this);
  }

  setClient(client: LemmyHttp) {
    this.api = new ApiService(client);
    this.postStore.setClient(this.api)
    this.profileStore.setClient(this.api)
    this.commentsStore.setClient(this.api)
  }

  async login(form: Login) {
    try {
      const auth = await this.api.login(form);
      this.setLoginDetails(auth)
      this.profileStore.setUsername(form.username_or_email);
      this.setLoginState(true);
      return auth;
    } catch (e) {
      console.error(e)
    }
  }

  setLoginState(state: boolean) {
    this.isLoggedIn = state;
  }

  setLoginDetails(details: LoginResponse) {
    this.loginDetails = details;
  }

  async getGeneralData() {
    if (!this.loginDetails.jwt) return;
    const { my_user: user } = await this.api.getGeneralData({ auth: this.loginDetails.jwt })
    return this.profileStore.setProfile({ person_view: user.local_user_view } as unknown as GetPersonDetailsResponse)
  }
}

export const apiClient = new ApiClient();
