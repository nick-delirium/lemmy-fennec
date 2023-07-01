import { makeAutoObservable } from "mobx";
class DebugStore {
  errors: string[] = [];
  warnings: string[] = [];
  debugLog: string[] = [];

  constructor() {
    makeAutoObservable(this);
  }

  addError(error: string) {
    if (this.errors.length > 200) this.errors.shift();
    this.errors.push(error);
  }
}

export const debugStore = new DebugStore();
