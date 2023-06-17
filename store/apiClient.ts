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

  constructor() {
    makeAutoObservable(this);
  }

  setClient(client: LemmyHttp) {
    this.api = new ApiService(client);
    this.postStore.setClient(this.api)
    this.profileStore.setClient(this.api)
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
}

export const apiClient = new ApiClient();
