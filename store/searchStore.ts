import {
  ListingType,
  LoginResponse,
  SearchResponse,
  SearchType,
} from "lemmy-js-client";
import { action, makeObservable, observable } from "mobx";

import DataClass from "./dataClass";
import { ListingTypeMap } from "./postStore";

export const SearchTypeMap = {
  All: "All",
  Comments: "Comments",
  Posts: "Posts",
  Communities: "Communities",
  Users: "Users",
  Url: "Url",
} as const;

class SearchStore extends DataClass {
  public searchQuery: string = "";
  public page: number = 1;
  public limit: number = 12;
  public type: SearchType = SearchTypeMap.All;
  public listingType: ListingType = ListingTypeMap.All;

  constructor() {
    super();
    makeObservable(this, {
      searchQuery: observable,
      page: observable,
      listingType: observable,
      type: observable,
      isLoading: observable,
      limit: observable,
      setListingType: action,
      setSearchType: action,
      setPage: action,
      setIsLoading: action,
      setSearchQuery: action,
    });
  }

  setLimit(limit: number) {
    this.limit = limit;
  }

  setListingType(type: ListingType) {
    this.listingType = type;
  }

  setSearchType(type: SearchType) {
    this.type = type;
  }

  setPage(page: number) {
    this.page = page;
  }

  setSearchQuery(query: string) {
    this.searchQuery = query;
  }

  async fetchSearch(): Promise<SearchResponse> {
    let results = null;
    await this.fetchData<SearchResponse>(
      () =>
        this.api.search({
          q: this.searchQuery,
          limit: this.limit,
          page: this.page,
          listing_type: this.listingType,
          sort: "TopAll",
          type_: this.type,
        }),
      (data) => {
        results = data;
      },
      (e) => console.error(e)
    );
    return results;
  }
}

export const searchStore = new SearchStore();
