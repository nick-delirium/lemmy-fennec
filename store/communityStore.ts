import { makeObservable, observable, action, computed } from "mobx";
import DataClass from "./dataClass";
import {
  CommunityView,
  GetCommunityResponse,
  LoginResponse,
  ListCommunitiesResponse,
  CommunityResponse,
} from "lemmy-js-client";
import { asyncStorageHandler, dataKeys } from "../asyncStorage";

class CommunityStore extends DataClass {
  communityId = 0;
  community: CommunityView | null = null;
  followedCommunities: CommunityView[] = [];
  favoriteCommunities: CommunityView[] = [];
  page = 1;

  constructor() {
    super();
    makeObservable(this, {
      communityId: observable,
      isLoading: observable,
      community: observable,
      followedCommunities: observable,
      favoriteCommunities: observable,
      page: observable,
      setFavoriteCommunities: action,
      setCommunityId: action,
      setCommunity: action,
      setIsLoading: action,
      setFollowedCommunities: action,
      setPage: action,
    });

    asyncStorageHandler.readData(dataKeys.favCommunities).then((value) => {
      if (value) {
        this.setFavoriteCommunities(JSON.parse(value));
      }
    });
  }

  setFavoriteCommunities(communities: CommunityView[]) {
    communities.forEach((c) => {
      c.community.description = "";
    });
    this.favoriteCommunities = communities;
    void asyncStorageHandler.setData(
      dataKeys.favCommunities,
      JSON.stringify(communities)
    );
  }

  get regularFollowedCommunities() {
    return this.followedCommunities.filter(
      (c) =>
        this.favoriteCommunities.findIndex(
          (f) => f.community.id === c.community.id
        ) === -1
    );
  }

  addToFavorites(community: CommunityView) {
    const communities = [...this.favoriteCommunities];
    communities.push(community);
    this.setFavoriteCommunities(communities);
  }

  removeFromFavorites(community: CommunityView) {
    const communities = [...this.favoriteCommunities];
    const index = communities.findIndex(
      (c) => c.community.id === community.community.id
    );
    if (index > -1) {
      communities.splice(index, 1);
    }
    this.setFavoriteCommunities(communities);
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

  async getCommunity(auth?: LoginResponse, id?: number, name?: string) {
    await this.fetchData<GetCommunityResponse>(
      () => this.api.fetchCommunity({ auth: auth?.jwt, id, name }),
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
          show_nsfw: true,
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
      (error) => console.log(error),
      true,
      "follow community"
    );
  }
}

export const communityStore = new CommunityStore();
