import ApiService from "../services/apiService";
import { debugStore } from "./debugStore";
import { ToastAndroid } from "react-native";

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
    console.log("fetching", label, +new Date());
    if (!isUnimportant) this.setIsLoading(true);
    try {
      const data = await fetcher();
      onSuccess(data);
    } catch (e) {
      ToastAndroid.show("Network error", ToastAndroid.SHORT);
      debugStore.addError(`${label} --- ${e.name}: ${e.message}; ${e.stack}`);
      onError(e);
    } finally {
      if (!isUnimportant) this.setIsLoading(false);
    }
  }
}
