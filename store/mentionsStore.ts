import { makeObservable, observable, action } from "mobx";
import DataClass from "./dataClass";
import {
  CommentReplyResponse,
  CommentReplyView,
  GetRepliesResponse,
  GetUnreadCountResponse,
  MarkAllAsRead,
} from "lemmy-js-client";

class MentionsStore extends DataClass {
  unreadsCount = 0;
  page = 1;
  replies: CommentReplyView[] = [];

  constructor() {
    super();
    makeObservable(this, {
      unreadsCount: observable,
      replies: observable,
      page: observable,
      setUnreadsCount: action,
      setReplies: action,
      setPage: action,
      isLoading: observable,
      setIsLoading: action,
    });
  }

  setPage(page: number) {
    this.page = page;
  }

  setReplies(replies: CommentReplyView[]) {
    this.replies = replies;
  }

  setUnreadsCount(count: number) {
    this.unreadsCount = count;
  }

  async fetchUnreads(auth: string) {
    await this.fetchData<GetUnreadCountResponse>(
      () => this.api.getUnreads({ auth }),
      ({ mentions, replies, private_messages }) => {
        this.setUnreadsCount(mentions + replies + private_messages);
      },
      (error) => console.log(error),
      false,
      "unreads count"
    );
  }

  async getReplies(auth: string) {
    await this.fetchData<GetRepliesResponse>(
      () =>
        this.api.getReplies({
          auth,
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

  async markReplyRead(auth: string, replyId: number) {
    await this.fetchData<CommentReplyResponse>(
      () =>
        this.api.markReplyRead({
          auth,
          comment_reply_id: replyId,
          read: true,
        }),
      () => {
        this.setReplies(
          this.replies.map((r) =>
            r.comment_reply.id === replyId ? { ...r, read: true } : r
          )
        );
        void this.fetchUnreads(auth);
      },
      (error) => console.log(error),
      false,
      "mark reply read"
    );
  }

  async markAllRepliesRead(auth: string) {
    await this.fetchData<GetRepliesResponse>(
      () => this.api.markAllRead({ auth }),
      ({ replies }) => this.setReplies(replies),
      (error) => console.log(error),
      false,
      "mark all replies read"
    );
  }
}

export const mentionsStore = new MentionsStore();
