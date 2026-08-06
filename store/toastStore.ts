import { makeAutoObservable } from "mobx";

const VISIBLE_FOR_MS = 2500;

/** Backs the iOS toast overlay; on Android the native ToastAndroid is used. */
class ToastStore {
  public message: string | null = null;
  private timeout: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  show(message: string) {
    this.message = message;
    if (this.timeout) clearTimeout(this.timeout);
    this.timeout = setTimeout(() => this.hide(), VISIBLE_FOR_MS);
  }

  hide() {
    this.message = null;
    if (this.timeout) {
      clearTimeout(this.timeout);
      this.timeout = null;
    }
  }
}

export const toastStore = new ToastStore();
