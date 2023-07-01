import { makeObservable, observable, action } from "mobx";
import DataClass from "./dataClass";
import {
  GetPersonDetails,
  GetPersonDetailsResponse,
  LocalUserView,
  LoginResponse,
  SaveUserSettings,
} from "lemmy-js-client";
import { asyncStorageHandler, dataKeys } from "../asyncStorage";

class ProfileStore extends DataClass {
  public userProfile: GetPersonDetailsResponse | null = null;
  public localUser: LocalUserView | null = null;
  public username: string | null = null;
  public readOnScroll = false;
  public unblurNsfw = false;
  public leftHanded = false;
  public collapseParentComment = false;

  constructor() {
    super();
    makeObservable(this, {
      userProfile: observable.deep,
      isLoading: observable,
      username: observable,
      collapseParentComment: observable,
      localUser: observable,
      readOnScroll: observable,
      leftHanded: observable,
      unblurNsfw: observable,
      setLeftHanded: action,
      setReadOnScroll: action,
      setProfile: action,
      setCollapseParentComment: action,
      setUsername: action,
      setClient: action,
      setIsLoading: action,
      setLocalUser: action,
      setBlurNsfw: action,
    });
    asyncStorageHandler.readData(dataKeys.readScroll).then((value) => {
      this.readOnScroll = value === "1";
    });
    asyncStorageHandler.readData(dataKeys.blurNsfw).then((value) => {
      this.unblurNsfw = value === "1";
    });
    asyncStorageHandler.readData(dataKeys.leftHanded).then((value) => {
      this.leftHanded = value === "1";
    });
    asyncStorageHandler.readData(dataKeys.collapseParent).then((value) => {
      this.collapseParentComment = value === "1";
    });
  }

  setCollapseParentComment(collapseParentComment: boolean) {
    this.collapseParentComment = collapseParentComment;
    void asyncStorageHandler.setData(
      dataKeys.collapseParent,
      collapseParentComment ? "1" : "0"
    );
  }

  setLeftHanded(leftHanded: boolean) {
    this.leftHanded = leftHanded;
    void asyncStorageHandler.setData(
      dataKeys.leftHanded,
      leftHanded ? "1" : "0"
    );
  }

  setBlurNsfw(unblurNsfw: boolean) {
    this.unblurNsfw = unblurNsfw;
    void asyncStorageHandler.setData(dataKeys.blurNsfw, unblurNsfw ? "1" : "0");
  }

  setReadOnScroll(readOnScroll: boolean) {
    console.log(readOnScroll);
    this.readOnScroll = readOnScroll;
    void asyncStorageHandler.setData(
      dataKeys.readScroll,
      readOnScroll ? "1" : "0"
    );
  }

  getReadOnScroll() {
    return this.readOnScroll;
  }

  setLocalUser(localUser: LocalUserView) {
    this.localUser = localUser;
  }

  async getProfile(loginDetails: LoginResponse, form: GetPersonDetails) {
    await this.fetchData<GetPersonDetailsResponse>(
      () =>
        this.api.getProfile({
          ...form,
          auth: loginDetails?.jwt,
        }),
      (profile) => this.setProfile(profile),
      (e) => console.error(e)
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
          display_name: this.localUser.person.display_name,
          show_avatars: this.localUser.local_user.show_avatars,
          bot_account: false,
          show_bot_accounts: this.localUser.local_user.show_bot_accounts,
          show_scores: this.localUser.local_user.show_scores,
          show_new_post_notifs: this.localUser.local_user.show_new_post_notifs,
          email: this.localUser.local_user.email,
          bio: this.localUser.person.bio,
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
}

export const profileStore = new ProfileStore();
