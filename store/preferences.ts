import { makeAutoObservable } from "mobx";

import { asyncStorageHandler, dataKeys } from "../asyncStorage";
import { commonColors } from "../commonStyles";

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
  public swapVotingButtons = false;
  public collapseParentComment = false;
  public compactPostLayout = false;
  public hapticsOff = false;
  public paginatedFeed = false;
  public ignoredInstances: string[] = [];
  public lowTrafficMode = false;
  public disableDynamicHeaders = false;
  public altUpvote = false;

  constructor() {
    makeAutoObservable(this);
    void this.restore();
  }

  /** One multiGet rather than 13 separate reads on the startup path. */
  private async restore() {
    const stored = await asyncStorageHandler.readMany([
      dataKeys.readScroll,
      dataKeys.blurNsfw,
      dataKeys.leftHanded,
      dataKeys.collapseParent,
      dataKeys.compactPostLayout,
      dataKeys.paginatedFeed,
      dataKeys.theme,
      dataKeys.hapticsOff,
      dataKeys.ignoredInstances,
      dataKeys.votingButtons,
      dataKeys.lowTraffic,
      dataKeys.dynamicHeaders,
      dataKeys.altUpvote,
    ]);

    this.setReadOnScroll(stored[dataKeys.readScroll] === "1");
    this.setBlurNsfw(stored[dataKeys.blurNsfw] === "1");
    this.setLeftHanded(stored[dataKeys.leftHanded] === "1");
    this.setCollapseParentComment(stored[dataKeys.collapseParent] === "1");
    this.setPostLayout(stored[dataKeys.compactPostLayout] === "1");
    this.setPaginatedFeed(stored[dataKeys.paginatedFeed] === "1");
    this.setHapticsOff(stored[dataKeys.hapticsOff] === "1");
    this.setSwapVotingButtons(stored[dataKeys.votingButtons] === "1");
    this.setLowTrafficMode(stored[dataKeys.lowTraffic] === "1");
    this.setDisableDynamicHeaders(stored[dataKeys.dynamicHeaders] === "1");
    this.setAltUpvote(stored[dataKeys.altUpvote] === "1");

    switch (stored[dataKeys.theme]) {
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

    const ignored = stored[dataKeys.ignoredInstances];
    if (ignored) this.setIgnoredInstances(ignored.split(","));
  }

  setAltUpvote(altUpvote: boolean) {
    this.altUpvote = altUpvote;
    void asyncStorageHandler.setData(dataKeys.altUpvote, altUpvote ? "1" : "0");
  }

  get voteColors() {
    return this.altUpvote
      ? {
          upvote: commonColors.upvoteAlt,
          downvote: commonColors.downvoteAlt,
        }
      : {
          upvote: commonColors.upvote,
          downvote: commonColors.downvote,
        };
  }

  setDisableDynamicHeaders(disableDynamicHeaders: boolean) {
    this.disableDynamicHeaders = disableDynamicHeaders;
    void asyncStorageHandler.setData(
      dataKeys.dynamicHeaders,
      disableDynamicHeaders ? "1" : "0",
    );
  }

  setLowTrafficMode(lowTrafficMode: boolean) {
    this.lowTrafficMode = lowTrafficMode;
    void asyncStorageHandler.setData(
      dataKeys.lowTraffic,
      lowTrafficMode ? "1" : "0",
    );
  }

  setSwapVotingButtons(swapVotingButtons: boolean) {
    this.swapVotingButtons = swapVotingButtons;
    void asyncStorageHandler.setData(
      dataKeys.votingButtons,
      swapVotingButtons ? "1" : "0",
    );
  }

  setIgnoredInstances(instances: string[]) {
    // a blank entry (trailing comma in the settings field) would match every
    // actor_id via String.includes and hide the whole feed
    this.ignoredInstances = instances
      .map((instance) => instance.trim())
      .filter(Boolean);
    void asyncStorageHandler.setData(
      dataKeys.ignoredInstances,
      this.ignoredInstances.join(", "),
    );
  }

  getIgnoredInstances() {
    return this.ignoredInstances;
  }

  setPaginatedFeed(paginatedFeed: boolean) {
    this.paginatedFeed = paginatedFeed;
    void asyncStorageHandler.setData(
      dataKeys.paginatedFeed,
      paginatedFeed ? "1" : "0",
    );
  }

  setHapticsOff(hapticsOff: boolean) {
    this.hapticsOff = hapticsOff;
    void asyncStorageHandler.setData(
      dataKeys.hapticsOff,
      hapticsOff ? "1" : "0",
    );
  }

  setTheme(theme: Theme) {
    this.theme = theme;
    void asyncStorageHandler.setData(dataKeys.theme, theme.toString());
  }

  setPostLayout(compactPostLayout: boolean) {
    this.compactPostLayout = compactPostLayout;
    void asyncStorageHandler.setData(
      dataKeys.compactPostLayout,
      compactPostLayout ? "1" : "0",
    );
  }

  setCollapseParentComment(collapseParentComment: boolean) {
    this.collapseParentComment = collapseParentComment;
    void asyncStorageHandler.setData(
      dataKeys.collapseParent,
      collapseParentComment ? "1" : "0",
    );
  }

  setLeftHanded(leftHanded: boolean) {
    this.leftHanded = leftHanded;
    void asyncStorageHandler.setData(
      dataKeys.leftHanded,
      leftHanded ? "1" : "0",
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
      readOnScroll ? "1" : "0",
    );
  }

  getReadOnScroll() {
    return this.readOnScroll;
  }
}

export const preferences = new Preferences();
