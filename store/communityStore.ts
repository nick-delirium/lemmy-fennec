import { makeObservable, observable, action } from "mobx";
import DataClass from "./dataClass";
import {
  CommunityView,
  GetCommunityResponse,
  LoginResponse,
} from "lemmy-js-client";

class CommunityStore extends DataClass {
  communityId = 0;
  community: CommunityView | null = null;

  constructor() {
    super();
    makeObservable(this, {
      communityId: observable,
      isLoading: observable,
      community: observable,
      setCommunityId: action,
      setCommunity: action,
      setIsLoading: action,
    });
  }

  setCommunityId(id: number) {
    this.communityId = id;
  }

  setCommunity(community: CommunityView) {
    this.community = community;
  }

  async getCommunity(id: number, auth?: LoginResponse) {
    await this.fetchData<GetCommunityResponse>(
      () => this.api.fetchCommunity({ auth: auth?.jwt, id }),
      (data) => this.setCommunity(data.community_view),
      (error) => console.log(error)
    );
  }
}

export const communityStore = new CommunityStore();
