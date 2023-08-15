import { ToastAndroid } from "react-native";

import ApiService from "../services/apiService";
import { debugStore } from "./debugStore";

export default class DataClass {
  public api: ApiService;
  public isLoading: boolean = false;

  setIsLoading(state: boolean) {
    this.isLoading = state;
  }

  setClient(client: ApiService) {
    this.api = client;
  }

  async fetchData<T>(
    fetcher: () => Promise<T>,
    onSuccess: (data: T) => void,
    onError: (error: any) => void,
    isUnimportant?: boolean,
    label?: string
  ) {
    if (this.isLoading) return;
    console.log(new Date().getTime(), "fetching", label);
    if (!isUnimportant) this.setIsLoading(true);
    try {
      const data = await fetcher();
      onSuccess(data);
    } catch (e) {
      const errStr = `Network${
        typeof e === "string" ? "error: " + e : "error"
      }`;
      ToastAndroid.show(errStr, ToastAndroid.SHORT);
      debugStore.addError(
        typeof e === "string"
          ? `${label} ${e}`
          : `${label} --- ${e.name}: ${e.message}; ${e.stack}`
      );
      onError(e);
    } finally {
      if (!isUnimportant) this.setIsLoading(false);
    }
  }
}
