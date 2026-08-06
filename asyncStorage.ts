import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";

export const dataKeys = {
  instance: "fennec-instance",
  login: "fennec-login",
  username: "fennec-username",
  postsLimit: "fennec-settings-posts-limit",
  filters: "fennec-filters",
  commentFilters: "fennec-comment-filters",
  readScroll: "fennec-read-scroll",
  blurNsfw: "fennec-blur-nsfw",
  leftHanded: "fennec-left-handed",
  collapseParent: "fennec-collapse-parent",
  compactPostLayout: "fennec-compact-post-layout",
  theme: "fennec-theme",
  hapticsOff: "fennec-haptics-off",
  favCommunities: "fennec-fav-communities",
  paginatedFeed: "fennec-paginated-feed",
  ignoredInstances: "fennec-ignored-instances",
  votingButtons: "fennec-voting-buttons",
  accounts: "fennec-accounts",
  lowTraffic: "fennec-low-traffic",
  dynamicHeaders: "fennec-dynamic-headers",
  altUpvote: "fennec-alt-upvote",
} as const;

type Keys = keyof typeof dataKeys;
type DataValues = (typeof dataKeys)[Keys];

class AsyncStoragehandler {
  readData = async (key: DataValues): Promise<string | null> => {
    try {
      const value = await AsyncStorage.getItem(key);
      if (value !== null) {
        return value;
      } else return null;
    } catch (e) {
      console.error("regular data read:", e);
    }
  };

  /** One bridge round-trip instead of one per key. */
  readMany = async (
    keys: readonly DataValues[],
  ): Promise<Record<string, string | null>> => {
    try {
      const pairs = await AsyncStorage.multiGet(keys as string[]);
      return Object.fromEntries(pairs);
    } catch (e) {
      console.error("regular data multi read:", e);
      return {};
    }
  };

  setData = async (key: DataValues, value: string) => {
    try {
      await AsyncStorage.setItem(key, value);
    } catch (e) {
      console.error("regular data write:", e);
    }
  };

  setSecureData = async (key, value) => {
    try {
      await SecureStore.setItemAsync(key, value);
    } catch (e) {
      console.error("secure data write:", e);
    }
  };

  readSecureData = async (key: string): Promise<string | null> => {
    try {
      const value = await SecureStore.getItemAsync(key);
      if (value !== null) {
        return value;
      } else return null;
    } catch (e) {
      console.error("secure data read:", e);
    }
  };

  purge() {
    void AsyncStorage.clear();
  }

  logout() {
    void SecureStore.deleteItemAsync(dataKeys.login);
    void AsyncStorage.removeItem(dataKeys.username);
  }
}

export const asyncStorageHandler = new AsyncStoragehandler();
