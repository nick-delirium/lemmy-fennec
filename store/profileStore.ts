import { makeObservable, observable, action } from "mobx";
import DataClass from "./dataClass";
import {
  GetPersonDetailsResponse,
  LoginResponse,
} from "lemmy-js-client";

class ProfileStore extends DataClass {
  public userProfile: GetPersonDetailsResponse | null = null;
  public username: string | null = null;

  constructor() {
    super();
    makeObservable(this, {
      userProfile: observable.deep,
      isLoading: observable,
      username: observable,
      setProfile: action,
      setUsername: action,
      setClient: action,
      setIsLoading: action,
    });
  }

  // need to change to GetSiteResponse for own user
  async getProfile(loginDetails: LoginResponse, otherUser?: string) {
    await this.fetchData<GetPersonDetailsResponse>(
      () => this.api.getProfile({ auth: loginDetails.jwt, username: otherUser ? otherUser : this.username }),
      (profile) => this.setProfile(profile),
      (e) => console.error(e)
    )
  }

  setProfile(profile: GetPersonDetailsResponse) {
    this.userProfile = profile;
  }

  setUsername(username: string) {
    this.username = username;
  }
}

export const profileStore = new ProfileStore();