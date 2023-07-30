import { makeObservable, observable, action } from "mobx";
import DataClass from "./dataClass";
import {
  BlockPersonResponse,
  CommunityBlockView,
  CommunityModeratorView,
  GetPersonDetails,
  GetPersonDetailsResponse,
  LocalUserView,
  LoginResponse,
  PersonBlockView,
  SaveUserSettings,
  SortType,
} from "lemmy-js-client";

class ProfileStore extends DataClass {
  public userProfile: GetPersonDetailsResponse | null = null;
  public localUser: LocalUserView | null = null;
  public moderatedCommunities: CommunityModeratorView[] = [];
  public username: string | null = null;
  public blockedPeople: PersonBlockView[] = [];
  public blockedCommunities: CommunityBlockView[] = [];
  public profilePage = 1;
  public profileSort: SortType = "New";

  constructor() {
    super();
    makeObservable(this, {
      userProfile: observable.deep,
      isLoading: observable,
      username: observable,
      blockedPeople: observable,
      blockedCommunities: observable,
      localUser: observable,
      profileSort: observable,
      profilePage: observable,
      moderatedCommunities: observable,
      setProfile: action,
      setModeratedCommunities: action,
      setUsername: action,
      setClient: action,
      setIsLoading: action,
      setLocalUser: action,
      setProfilePage: action,
      setProfileSort: action,
      setBlocks: action,
    });
  }

  setModeratedCommunities(communities: CommunityModeratorView[]) {
    this.moderatedCommunities = communities;
  }

  setBlocks(people: PersonBlockView[], communities: CommunityBlockView[]) {
    this.blockedPeople = people;
    this.blockedCommunities = communities;
  }

  setProfilePage(page: number) {
    this.profilePage = page;
  }

  setProfileSort(sort: SortType) {
    this.profileSort = sort;
  }

  setLocalUser(localUser: LocalUserView) {
    this.localUser = localUser;
  }

  async getProfile(loginDetails: LoginResponse, form: GetPersonDetails) {
    await this.fetchData<GetPersonDetailsResponse>(
      () =>
        this.api.getProfile({
          ...form,
          page: this.profilePage,
          sort: this.profileSort,
          auth: loginDetails?.jwt,
        }),
      (profile) => this.setProfile(profile),
      (e) => console.error(e),
      false,
      "get profile _" + form.person_id
    );
  }

  setProfile(profile: GetPersonDetailsResponse) {
    this.userProfile = profile;
  }

  setUsername(username: string) {
    this.username = username;
  }

  async updateSettings(form: SaveUserSettings) {
    const currentSettings = this.localUser.local_user;
    const newSettings = { ...currentSettings, ...form };
    await this.fetchData<any>(
      // had to improvise because of client bug
      () =>
        this.api.saveUserSettings({
          show_nsfw: form.show_nsfw || this.localUser.local_user.show_nsfw,
          show_read_posts:
            form.show_read_posts || this.localUser.local_user.show_read_posts,
          default_listing_type: this.localUser.local_user.default_listing_type,
          default_sort_type: this.localUser.local_user.default_sort_type,
          theme: this.localUser.local_user.theme,
          interface_language: this.localUser.local_user.interface_language,
          discussion_languages: [],
          avatar: this.localUser.person.avatar,
          banner: this.localUser.person.banner,
          display_name: form.display_name || this.localUser.person.display_name,
          show_avatars: this.localUser.local_user.show_avatars,
          bot_account: false,
          show_bot_accounts: this.localUser.local_user.show_bot_accounts,
          show_scores: this.localUser.local_user.show_scores,
          show_new_post_notifs: this.localUser.local_user.show_new_post_notifs,
          email: form.email || this.localUser.local_user.email,
          bio: form.bio || this.localUser.person.bio,
          send_notifications_to_email:
            this.localUser.local_user.send_notifications_to_email,
          matrix_user_id: this.localUser.person.matrix_user_id,
          auth: form.auth,
        }),
      () => {
        const currentUser = this.localUser;
        this.setLocalUser({ ...currentUser, local_user: newSettings });
      },
      (e) => console.error(e)
    );
  }

  async blockPerson(id: number, blocked: boolean, auth: string) {
    await this.fetchData<BlockPersonResponse>(
      () =>
        this.api.blockPerson({
          person_id: id,
          block: blocked,
          auth,
        }),
      ({ person_view }) => {
        if (!blocked) {
          this.setBlocks(
            this.blockedPeople.filter((p) => p.target.id !== id),
            this.blockedCommunities
          );
        }
        console.log(blocked, this.userProfile.person_view.person.id === id);
        if (this.userProfile.person_view.person.id === id) {
          this.setProfile({
            ...this.userProfile,
            person_view: {
              ...this.userProfile.person_view,
              ...person_view,
            },
          });
          this.setBlocks(
            // @ts-ignore
            [...this.blockedPeople, { person: {}, target: person_view.person }],
            this.blockedCommunities
          );
        }
      },
      (e) => console.error(e),
      true,
      "block person _" + id
    );
  }
}

export const profileStore = new ProfileStore();
