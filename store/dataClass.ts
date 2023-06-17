import ApiService from "../services/apiService";

export default class DataClass {
  public api: ApiService;
  public isLoading: boolean = false;

  setIsLoading(state: boolean) {
    this.isLoading = state;
  }

  setClient(client: ApiService) {
    this.api = client
  }

  async fetchData<T>(
    fetcher: () => Promise<T>,
    onSuccess: (data: T) => void,
    onError: (error: any) => void,
    isUnimportant?: boolean
  ) {
    if (this.isLoading) return;
    if (!isUnimportant) this.setIsLoading(true);
    try {
      const data = await fetcher();
      onSuccess(data);
    } catch (e) {
      onError(e);
    } finally {
      if (!isUnimportant) this.setIsLoading(false);
    }
  }
}