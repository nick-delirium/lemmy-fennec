import { makeAutoObservable } from "mobx";
import { LemmyHttp, Login, LoginResponse } from "lemmy-js-client";
import ApiService from "../services/apiService";
import { postStore } from "./postStore";
import { profileStore } from "./profileStore";
import { commentsStore } from "./commentsStore";
import { searchStore } from "./searchStore";
import { communityStore } from "./communityStore";
import { asyncStorageHandler, dataKeys } from "../asyncStorage";

/**
 * !!! TODO: !!!
 * split user, comment, feed logic into own stores
 */

export const Score = {
  Upvote: 1,
  Downvote: -1,
  Neutral: 0,
} as const;

class ApiClient {
  public api: ApiService;

  public isLoggedIn = false;

  public loginDetails: LoginResponse;
  public postStore = postStore;
  public profileStore = profileStore;
  public commentsStore = commentsStore;
  public searchStore = searchStore;
  public communityStore = communityStore;

  constructor() {
    makeAutoObservable(this);
    Promise.all([
      asyncStorageHandler.readData(dataKeys.instance),
      asyncStorageHandler.readSecureData(dataKeys.login),
      asyncStorageHandler.readData(dataKeys.username),
    ]).then((values) => {
      const [possibleInstance, possibleUser, possibleUsername] = values;
      if (possibleInstance && possibleUser && possibleUsername) {
        const auth: LoginResponse = JSON.parse(possibleUser);
        const client: LemmyHttp = new LemmyHttp(possibleInstance);
        this.setClient(client);
        this.setLoginDetails(auth);
        this.setLoginState(true);
        this.profileStore.setUsername(possibleUsername);
        void this.getGeneralData();
      } else {
        const client: LemmyHttp = new LemmyHttp("https://lemmy.ml");
        this.setClient(client);
      }
    });
  }

  setClient(client: LemmyHttp) {
    this.api = new ApiService(client);
    this.postStore.setClient(this.api);
    this.profileStore.setClient(this.api);
    this.commentsStore.setClient(this.api);
    this.searchStore.setClient(this.api);
    this.communityStore.setClient(this.api);
  }

  async login(form: Login) {
    try {
      const auth = await this.api.login(form);
      this.setLoginDetails(auth);
      this.profileStore.setUsername(form.username_or_email);
      this.setLoginState(true);
      return auth;
    } catch (e) {
      console.error(e);
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
    // extract this two to filter out posts;
    // community_blocks: Array<CommunityBlockView>;
    // person_blocks: Array<PersonBlockView>;
    const { my_user: user } = await this.api.getGeneralData({
      auth: this.loginDetails.jwt,
    });
    return this.profileStore.setLocalUser(user.local_user_view);
  }
}

export const apiClient = new ApiClient();
