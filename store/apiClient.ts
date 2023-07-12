import { makeAutoObservable } from "mobx";
import { LemmyHttp, Login, LoginResponse } from "lemmy-js-client";
import ApiService from "../services/apiService";
import { postStore } from "./postStore";
import { profileStore } from "./profileStore";
import { commentsStore } from "./commentsStore";
import { searchStore } from "./searchStore";
import { communityStore } from "./communityStore";
import { asyncStorageHandler, dataKeys } from "../asyncStorage";
import { debugStore } from "./debugStore";
import { mentionsStore } from "./mentionsStore";

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
  public isLoading = false;
  public loginDetails: LoginResponse;
  public postStore = postStore;
  public profileStore = profileStore;
  public commentsStore = commentsStore;
  public searchStore = searchStore;
  public communityStore = communityStore;
  public mentionsStore = mentionsStore;
  public currentInstance = "";

  constructor() {
    makeAutoObservable(this);
    Promise.all([
      asyncStorageHandler.readData(dataKeys.instance),
      asyncStorageHandler.readSecureData(dataKeys.login),
      asyncStorageHandler.readData(dataKeys.username),
    ])
      .then((values) => {
        const [possibleInstance, possibleUser, possibleUsername] = values;
        this.currentInstance = possibleInstance ?? "https://lemmy.ml";
        if (possibleInstance && possibleUser && possibleUsername) {
          const auth: LoginResponse = JSON.parse(possibleUser);
          const client: LemmyHttp = new LemmyHttp(possibleInstance);
          this.setClient(client);
          this.setLoginDetails(auth);
          this.setLoginState(true);
          this.profileStore.setUsername(possibleUsername);
          void this.getGeneralData();
        } else {
          const client: LemmyHttp = new LemmyHttp(
            possibleInstance || "https://lemmy.ml"
          );
          this.setClient(client);
        }
      })
      .catch((e) => {
        // save it somewhere for future
        console.error(e);
        const client: LemmyHttp = new LemmyHttp("https://lemmy.ml");
        this.setClient(client);
      });
  }

  setIsLoading(state: boolean) {
    this.isLoading = state;
  }

  setClient(client: LemmyHttp) {
    this.api = new ApiService(client);
    this.postStore.setClient(this.api);
    this.profileStore.setClient(this.api);
    this.commentsStore.setClient(this.api);
    this.searchStore.setClient(this.api);
    this.communityStore.setClient(this.api);
    this.mentionsStore.setClient(this.api);
  }

  async login(form: Login) {
    this.setIsLoading(true);
    try {
      const auth = await this.api.login(form);
      this.setLoginDetails(auth);
      this.profileStore.setUsername(form.username_or_email);
      this.setLoginState(true);
      return auth;
    } catch (e) {
      debugStore.addError(
        typeof e === "string"
          ? `login ${e}`
          : `login --- ${e.name}: ${e.message}; ${e.stack}`
      );
      throw e;
    } finally {
      this.setIsLoading(false);
    }
  }

  setLoginState(state: boolean) {
    this.isLoggedIn = state;
  }

  setLoginDetails(details: LoginResponse) {
    this.loginDetails = details;
  }

  async getGeneralData() {
    if (!this.loginDetails?.jwt) return;
    // extract this two to filter out posts;
    // community_blocks: Array<CommunityBlockView>;
    // person_blocks: Array<PersonBlockView>;
    try {
      const { my_user: user } = await this.api.getGeneralData({
        auth: this.loginDetails.jwt,
      });
      return this.profileStore.setLocalUser(user.local_user_view);
    } catch (e) {
      debugStore.addError(
        typeof e === "string"
          ? `get site data ${e}`
          : `get site data --- ${e.name}: ${e.message}; ${e.stack}`
      );
    }
  }
}

export const apiClient = new ApiClient();
