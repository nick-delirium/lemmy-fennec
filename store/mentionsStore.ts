import {
  CommentReplyResponse,
  CommentReplyView,
  GetPersonMentionsResponse,
  GetRepliesResponse,
  GetUnreadCountResponse,
  PersonMentionView,
  PrivateMessageView,
  PrivateMessagesResponse,
} from "lemmy-js-client";
import { action, makeObservable, observable } from "mobx";

import DataClass from "./dataClass";

interface Unreads {
  replies: number;
  mentions: number;
  messages: number;
}

class MentionsStore extends DataClass {
  unreadsCount = 0;
  unreads: Unreads = {
    replies: 0,
    mentions: 0,
    messages: 0,
  };
  page = 1;
  mentionsPage = 1;
  messagesPage = 1;
  replies: CommentReplyView[] = [];
  mentions: PersonMentionView[] = [];
  messages: PrivateMessageView[] = [];

  constructor() {
    super();
    makeObservable(this, {
      unreadsCount: observable,
      replies: observable,
      page: observable,
      unreads: observable,
      mentions: observable,
      messages: observable,
      messagesPage: observable,
      mentionsPage: observable,
      setMentionsPage: action,
      setMessagesPage: action,
      setMessages: action,
      setUnreads: action,
      setMentions: action,
      setUnreadsCount: action,
      setReplies: action,
      setPage: action,
      isLoading: observable,
      setIsLoading: action,
    });
  }

  setUnreads(unreads: Unreads) {
    this.unreads = unreads;
  }

  setMessages(messages: PrivateMessageView[]) {
    this.messages = messages;
  }

  setMessagesPage(page: number) {
    this.messagesPage = page;
  }

  setPage(page: number) {
    this.page = page;
  }

  setMentionsPage(page: number) {
    this.mentionsPage = page;
  }

  setReplies(replies: CommentReplyView[]) {
    this.replies = replies;
  }

  setMentions(mentions: PersonMentionView[]) {
    this.mentions = mentions;
  }

  setUnreadsCount(count: number) {
    this.unreadsCount = count;
  }

  async fetchUnreads() {
    await this.fetchData<GetUnreadCountResponse>(
      () => this.api.getUnreads(),
      ({ mentions, replies, private_messages }) => {
        this.setUnreadsCount(mentions + replies + private_messages);
        this.setUnreads({ mentions, replies, messages: private_messages });
      },
      (error) => console.log(error),
      false,
      "fetch unreads count"
    );
  }

  async getReplies() {
    await this.fetchData<GetRepliesResponse>(
      () =>
        this.api.getReplies({
          sort: "New",
          limit: 30,
          page: this.page,
        }),
      ({ replies }) => this.setReplies(replies),
      (error) => console.log(error),
      false,
      "fetch comment replies"
    );
  }

  async getMessages() {
    await this.fetchData<PrivateMessagesResponse>(
      () =>
        this.api.getMessages({
          limit: 30,
          page: this.page,
          unread_only: false,
        }),
      ({ private_messages }) => {
        this.setMessages(private_messages);
      },
      (error) => console.log(error),
      false,
      "fetch private messages"
    );
  }

  async getMentions() {
    await this.fetchData<GetPersonMentionsResponse>(
      () =>
        this.api.getMentions({
          sort: "New",
          limit: 30,
          page: this.mentionsPage,
        }),
      ({ mentions }) => {
        this.setMentions(mentions);
      },
      (error) => console.log(error),
      false,
      "fetch user mentions"
    );
  }

  async markReplyRead(replyId: number) {
    await this.fetchData<CommentReplyResponse>(
      () =>
        this.api.markReplyRead({
          comment_reply_id: replyId,
          read: true,
        }),
      () => {
        this.setReplies(
          this.replies.map((r) =>
            r.comment_reply.id === replyId ? { ...r, read: true } : r
          )
        );
      },
      (error) => console.log(error),
      false,
      "mark reply read"
    );
  }

  async markAllRepliesRead() {
    await this.fetchData<GetRepliesResponse>(
      () => this.api.markAllRead(),
      ({ replies }) => this.setReplies(replies),
      (error) => console.log(error),
      false,
      "mark all replies read"
    );
  }
}

export const mentionsStore = new MentionsStore();
