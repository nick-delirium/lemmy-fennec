import ApiService from "../services/apiService";
import { showToast } from "../utils/toast";
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
    label?: string,
  ) {
    // `isLoading` drives the loading spinners, so only the requests that own it
    // may bail out on it. Background work (votes, mark-as-read) used to be
    // dropped here whenever any other request happened to be in flight, which
    // silently discarded the action after the UI had already applied it.
    if (!isUnimportant) {
      if (this.isLoading) return;
      this.setIsLoading(true);
    }
    console.log(new Date().getTime(), "fetching", label);
    try {
      const data = await fetcher();
      onSuccess(data);
    } catch (e) {
      const errStr = `Network ${
        typeof e === "string" ? "error: " + e : "error"
      }`;
      showToast(errStr);
      debugStore.addError(
        typeof e === "string"
          ? `${label} ${e}`
          : `${label} --- ${e?.name}: ${e?.message}; ${e?.stack}`,
      );
      onError(e);
    } finally {
      if (!isUnimportant) this.setIsLoading(false);
    }
  }
}
