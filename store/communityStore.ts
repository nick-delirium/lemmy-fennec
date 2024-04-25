import {
  BlockCommunityResponse,
  Community,
  CommunityResponse,
  CommunityView,
  GetCommunityResponse,
  LoginResponse,
} from "lemmy-js-client";
import { action, makeObservable, observable } from "mobx";

import { asyncStorageHandler, dataKeys } from "../asyncStorage";
import DataClass from "./dataClass";

class CommunityStore extends DataClass {
  communityId = 0;
  community: CommunityView | null = null;
  followedCommunities: Community[] = [];
  favoriteCommunities: Community[] = [];

  constructor() {
    super();
    makeObservable(this, {
      communityId: observable,
      isLoading: observable,
      community: observable,
      followedCommunities: observable,
      favoriteCommunities: observable,
      setFavoriteCommunities: action,
      setCommunityId: action,
      setCommunity: action,
      setIsLoading: action,
      setFollowedCommunities: action,
    });

    asyncStorageHandler.readData(dataKeys.favCommunities).then((value) => {
      if (value) {
        let comms: CommunityView[] | Community[] = JSON.parse(value);
        // @ts-ignore
        if (comms[0]?.community?.id) {
          comms = (comms as CommunityView[]).map((c) => c.community);
        }
        this.setFavoriteCommunities(comms as Community[]);
      }
    });
  }

  setFavoriteCommunities(communities: Community[]) {
    communities.forEach((c) => {
      c.description = "";
    });
    this.favoriteCommunities = communities;
    void asyncStorageHandler.setData(
      dataKeys.favCommunities,
      JSON.stringify(communities)
    );
  }

  get regularFollowedCommunities() {
    return this.followedCommunities.filter(
      (c) => this.favoriteCommunities.findIndex((f) => f.id === c.id) === -1
    );
  }

  addToFavorites(community: Community) {
    const communities = [...this.favoriteCommunities];
    communities.push(community);
    this.setFavoriteCommunities(communities);
  }

  removeFromFavorites(community: Community) {
    const communities = [...this.favoriteCommunities];
    const index = communities.findIndex((c) => c.id === community.id);
    if (index > -1) {
      communities.splice(index, 1);
    }
    this.setFavoriteCommunities(communities);
  }

  setFollowedCommunities(communities: Community[]) {
    this.followedCommunities = communities;
  }

  setCommunityId(id: number) {
    this.communityId = id;
  }

  setCommunity(community: CommunityView) {
    this.community = community;
  }

  async getCommunity(id?: number, name?: string) {
    await this.fetchData<GetCommunityResponse>(
      () => this.api.fetchCommunity({ id, name }),
      (data) => this.setCommunity(data.community_view),
      (error) => console.log(error)
    );
  }

  async followCommunity(id: number, follow: boolean) {
    await this.fetchData<CommunityResponse>(
      () => this.api.followCommunity({ community_id: id, follow }),
      (data) => this.setCommunity(data.community_view),
      (error) => console.log(error),
      true,
      "follow community"
    );
  }

  async blockCommunity(id: number, block: boolean) {
    await this.fetchData<BlockCommunityResponse>(
      () => this.api.blockCommunity({ community_id: id, block }),
      (data) => this.setCommunity(data.community_view),
      (error) => console.log(error),
      true,
      "block community"
    );
  }
}

export const communityStore = new CommunityStore();
