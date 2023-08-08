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

export const ReportMode = {
  Off: 0,
  Post: 1,
  Comment: 2,
};

export interface Account {
  login: string;
  /** contains .jwt key */
  auth: string;
  instance: string;
  avatar?: string;
}

class ApiClient {
  public api: ApiService;

  public accounts: Account[] = [];
  public activeJWT = "";
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
  public showPrompt = false;
  public promptActions = {
    onConfirm: (text?: string) => null,
    onCancel: () => {
      this.setShowPrompt(false);
      this.setReportMode(ReportMode.Off, null);
    },
  };
  public reportMode = ReportMode.Off;
  public reportedItemId: number | null = null;

  constructor() {
    makeAutoObservable(this);
    asyncStorageHandler
      .readSecureData(dataKeys.accounts)
      .then((accounts) => {
        if (accounts) {
          this.setAccounts(JSON.parse(accounts), true);
        }
      })
      .finally(() => {
        this.init();
      });
  }

  setAccounts(accounts: Account[], coldRun?: boolean) {
    this.accounts = accounts;
    if (coldRun) return;
    void asyncStorageHandler.setSecureData(
      dataKeys.accounts,
      JSON.stringify(accounts)
    );
  }

  init() {
    Promise.all([
      asyncStorageHandler.readData(dataKeys.instance),
      asyncStorageHandler.readSecureData(dataKeys.login),
      asyncStorageHandler.readData(dataKeys.username),
    ])
      .then((values) => {
        const [possibleInstance, possibleJWT, possibleUsername] = values;
        this.currentInstance = possibleInstance ?? "https://lemmy.ml";
        if (possibleInstance && possibleJWT && possibleUsername) {
          this.createLoggedClient(
            possibleJWT,
            possibleInstance,
            possibleUsername
          );
        } else {
          const client: LemmyHttp = new LemmyHttp(
            possibleInstance || "https://lemmy.ml",
            {
              fetchFunction: undefined,
              headers: {
                "User-Agent": `Arctius Android 0.1.1`,
              },
            }
          );
          this.setClient(client);
        }
      })
      .catch((e) => {
        // save it somewhere for future
        console.error(e);
        this.currentInstance = "https://lemmy.ml";
        const client: LemmyHttp = new LemmyHttp("https://lemmy.ml", {
          fetchFunction: undefined,
          headers: {
            "User-Agent": `Arctius Android 0.1.1`,
          },
        });
        this.setClient(client);
      });
  }

  createLoggedClient(jwt: string, instance: string, username: string) {
    const auth: LoginResponse = JSON.parse(jwt);
    const client: LemmyHttp = new LemmyHttp(instance, {
      fetchFunction: undefined,
      headers: {
        "User-Agent": `Arctius Android 0.2.0`,
      },
    });
    this.setClient(client);
    this.setLoginDetails(auth);
    this.setLoginState(true);
    this.profileStore.setUsername(username);
    if (this.accounts.length === 0) {
      this.setAccounts([
        {
          login: username,
          auth: jwt,
          instance: instance,
        },
      ]);
    }
    void this.getGeneralData();
  }

  setActiveJWT(jwt: string) {
    this.activeJWT = jwt;
  }

  getCurrentInstance() {
    return this.currentInstance;
  }

  setPromptActions(actions: {
    onConfirm: (text: string) => void;
    onCancel: () => void;
  }) {
    this.promptActions = actions;
  }

  setShowPrompt(state: boolean) {
    this.showPrompt = state;
    if (state === false) {
      this.reportMode = ReportMode.Off;
      this.reportedItemId = null;
      this.promptActions = {
        onConfirm: () => null,
        onCancel: () => {
          this.setShowPrompt(false);
          this.setReportMode(ReportMode.Off, null);
        },
      };
    }
  }

  setReportMode(
    mode: (typeof ReportMode)[keyof typeof ReportMode],
    itemId: number | null
  ) {
    this.reportMode = mode;
    this.reportedItemId = mode === ReportMode.Off ? null : itemId;
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
    this.setIsLoading(true);
    try {
      const { my_user: user } = await this.api.getGeneralData({
        auth: this.loginDetails.jwt,
      });
      const { community_blocks, person_blocks, follows } = user;
      if (user.moderates.length > 0) {
        this.profileStore.setModeratedCommunities(user.moderates);
      }
      apiClient.communityStore.setFollowedCommunities(
        follows.map((c) => c.community)
      );
      this.profileStore.setBlocks(person_blocks, community_blocks);
      const localAccountInd = this.accounts.findIndex(
        (a) => JSON.parse(a.auth).jwt === this.loginDetails.jwt
      );
      if (localAccountInd !== -1) {
        if (
          this.accounts[localAccountInd]?.avatar !==
          user.local_user_view.person.avatar
        ) {
          const newAccounts = this.accounts.map((a, i) => {
            if (i === localAccountInd) {
              return {
                ...a,
                avatar: user.local_user_view.person.avatar,
              };
            }
            return a;
          });
          this.setAccounts(newAccounts);
        }
      }
      this.setActiveJWT(this.loginDetails.jwt);
      return this.profileStore.setLocalUser(user.local_user_view);
    } catch (e) {
      debugStore.addError(
        typeof e === "string"
          ? `get site data ${e}`
          : `get site data --- ${e.name}: ${e.message}; ${e.stack}`
      );
    } finally {
      this.setIsLoading(false);
    }
  }
}

export const apiClient = new ApiClient();
