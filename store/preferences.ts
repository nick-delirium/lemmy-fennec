import { makeAutoObservable } from "mobx";
import { asyncStorageHandler, dataKeys } from "../asyncStorage";

export enum Theme {
  System,
  Light,
  Dark,
  Amoled,
}

export const ThemeMap = {
  [Theme.System]: "System",
  [Theme.Light]: "Light",
  [Theme.Dark]: "Dark",
  [Theme.Amoled]: "Amoled",
};

export class Preferences {
  public theme = Theme.System;
  public readOnScroll = false;
  public unblurNsfw = false;
  public leftHanded = false;
  public collapseParentComment = false;
  public compactPostLayout = false;
  public hapticsOff = false;

  constructor() {
    makeAutoObservable(this);
    asyncStorageHandler.readData(dataKeys.readScroll).then((value) => {
      this.setReadOnScroll(value === "1");
    });
    asyncStorageHandler.readData(dataKeys.blurNsfw).then((value) => {
      this.setBlurNsfw(value === "1");
    });
    asyncStorageHandler.readData(dataKeys.leftHanded).then((value) => {
      this.setLeftHanded(value === "1");
    });
    asyncStorageHandler.readData(dataKeys.collapseParent).then((value) => {
      this.setCollapseParentComment(value === "1");
    });
    asyncStorageHandler.readData(dataKeys.compactPostLayout).then((value) => {
      this.setPostLayout(value === "1");
    });
    asyncStorageHandler.readData(dataKeys.theme).then((value) => {
      switch (value) {
        case "1":
          this.setTheme(Theme.Light);
          break;
        case "2":
          this.setTheme(Theme.Dark);
          break;
        case "3":
          this.setTheme(Theme.Amoled);
          break;
        case "0":
        default:
          this.setTheme(Theme.System);
          break;
      }
    });
    asyncStorageHandler.readData(dataKeys.hapticsOff).then((value) => {
      this.setHapticsOff(value === "1");
    });
  }

  setHapticsOff(hapticsOff: boolean) {
    this.hapticsOff = hapticsOff;
  }

  setTheme(theme: Theme) {
    this.theme = theme;
    void asyncStorageHandler.setData(dataKeys.theme, theme.toString());
  }

  setPostLayout(compactPostLayout: boolean) {
    this.compactPostLayout = compactPostLayout;
    void asyncStorageHandler.setData(
      dataKeys.compactPostLayout,
      compactPostLayout ? "1" : "0"
    );
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
    this.readOnScroll = readOnScroll;
    void asyncStorageHandler.setData(
      dataKeys.readScroll,
      readOnScroll ? "1" : "0"
    );
  }

  getReadOnScroll() {
    return this.readOnScroll;
  }
}

export const preferences = new Preferences();
