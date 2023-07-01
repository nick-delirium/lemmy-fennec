import { makeObservable, observable, action } from "mobx";
import DataClass from "./dataClass";
import {
  CommunityView,
  GetCommunityResponse,
  LoginResponse,
  ListCommunitiesResponse,
  CommunityResponse,
} from "lemmy-js-client";

class CommunityStore extends DataClass {
  communityId = 0;
  community: CommunityView | null = null;
  followedCommunities: CommunityView[] = [];
  page = 1;

  constructor() {
    super();
    makeObservable(this, {
      communityId: observable,
      isLoading: observable,
      community: observable,
      followedCommunities: observable,
      page: observable,
      setCommunityId: action,
      setCommunity: action,
      setIsLoading: action,
      setFollowedCommunities: action,
      setPage: action,
    });
  }

  setPage(page: number) {
    this.page = page;
  }

  setFollowedCommunities(communities: CommunityView[]) {
    this.followedCommunities = communities;
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

  async getFollowedCommunities(auth?: LoginResponse) {
    await this.fetchData<ListCommunitiesResponse>(
      () =>
        this.api.getCommunities({
          auth: auth?.jwt,
          type_: "Subscribed",
          limit: 30,
          page: this.page,
          sort: "TopAll",
        }),
      (data) => {
        this.setFollowedCommunities(data.communities);
      },
      (error) => console.log(error)
    );
  }

  nextPage = (auth?: LoginResponse) => {
    this.setPage(this.page + 1);
    void this.getFollowedCommunities(auth);
  };

  prevPage = (auth?: LoginResponse) => {
    if (this.page > 1) {
      this.setPage(this.page - 1);
    }
    void this.getFollowedCommunities(auth);
  };

  async followCommunity(id: number, follow: boolean, auth: LoginResponse) {
    await this.fetchData<CommunityResponse>(
      () =>
        this.api.followCommunity({ auth: auth?.jwt, community_id: id, follow }),
      (data) => this.setCommunity(data.community_view),
      (error) => console.log(error)
    );
  }
}

export const communityStore = new CommunityStore();
