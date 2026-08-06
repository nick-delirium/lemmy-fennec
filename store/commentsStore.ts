import {
  CommentId,
  CommentResponse,
  CommentSortType,
  CommentView,
  CreateComment,
  GetCommentsResponse,
  ListingType,
  LoginResponse,
  PostId,
} from "lemmy-js-client";
import {
  action,
  computed,
  makeObservable,
  observable,
  observableDeep,
  observableRef,
} from "mobx";

import { asyncStorageHandler, dataKeys } from "../asyncStorage";
import { Score } from "./apiClient";
import {
  CommentNode,
  FlatComment,
  buildCommentTree,
  flattenCommentTree,
} from "./commentTree";
import DataClass from "./dataClass";
import { ListingTypeMap } from "./postStore";

export type { CommentNode, FlatComment } from "./commentTree";
export { MAX_INDENT_DEPTH } from "./commentTree";

interface Filters {
  max_depth: number;
  saved_only: boolean;
  sort: CommentSortType;
  type_: ListingType;
}

/** lemmy's FETCH_LIMIT_MAX — requests above this are rejected outright. */
const FETCH_LIMIT_MAX = 50;
const PAGE_LIMIT = 40;

export const CommentSortTypeMap = {
  Hot: "Hot",
  Top: "Top",
  New: "New",
  Old: "Old",
} as const;

interface ReplyView {
  title: string;
  community: string;
  published: string;
  author: string;
  content: string;
  postId: number;
  parent_id?: number;
  language_id?: number;
  isEdit?: boolean;
}

class CommentsStore extends DataClass {
  public comments: CommentView[] = [];
  public commentTree: CommentNode[] = [];
  public replyTo: ReplyView | null = null;
  public page = 1;
  /**
   * Ids of collapsed comments. Lives here rather than in row state because the
   * list recycles rows — collapsing a thread and scrolling away used to reopen
   * it. Replaced wholesale on every change so it can be an observable ref.
   */
  public collapsed: ReadonlySet<CommentId> = new Set();
  public filters: Filters = {
    max_depth: 2,
    saved_only: false,
    sort: CommentSortTypeMap.Hot,
    type_: ListingTypeMap.All,
  };

  constructor() {
    super();

    // setFilters has always written these, but nothing read them back, so the
    // comment sort reset to Hot on every launch
    asyncStorageHandler.readData(dataKeys.commentFilters).then((filters) => {
      if (filters) {
        try {
          this.setFilters(JSON.parse(filters));
        } catch (e) {
          console.warn("bad stored comment filters", e);
        }
      }
    });

    makeObservable(this, {
      comments: observableDeep,
      filters: observableDeep,
      replyTo: observable,
      commentTree: observableDeep,
      collapsed: observableRef,
      visibleComments: computed,
      page: observable,
      setPage: action,
      setFilters: action,
      setComments: action,
      buildTree: action,
      addComment: action,
      isLoading: observable,
      setIsLoading: action,
      setClient: action,
      updateCommentById: action,
      updateTreeCommentRating: action,
      toggleCollapsed: action,
    });
  }

  /**
   * The tree, depth-first, with collapsed subtrees omitted. Feeds a single
   * FlatList so windowing counts comments rather than top-level threads.
   */
  get visibleComments(): FlatComment[] {
    return flattenCommentTree(this.commentTree, this.collapsed);
  }

  toggleCollapsed(commentId: CommentId) {
    const next = new Set(this.collapsed);
    if (!next.delete(commentId)) next.add(commentId);
    this.collapsed = next;
  }

  setPage(page: number) {
    this.page = page;
  }

  setReplyTo(comment: ReplyView | null) {
    this.replyTo = comment;
  }

  setFilters(filters: Partial<Filters>) {
    this.filters = { ...this.filters, ...filters };
    void asyncStorageHandler.setData(
      dataKeys.commentFilters,
      JSON.stringify(this.filters),
    );
  }

  async getComments(
    postId: PostId | null,
    parentId?: number,
    singleComment?: boolean,
  ) {
    const additionalFilters = parentId
      ? {
          parent_id: parentId,
          max_depth: 8,
          // lemmy rejects anything above FETCH_LIMIT_MAX; this was 999
          limit: FETCH_LIMIT_MAX,
        }
      : {
          limit: PAGE_LIMIT,
          max_depth: 2,
        };
    await this.fetchData<GetCommentsResponse>(
      () =>
        this.api.getComments({
          ...this.filters,
          ...additionalFilters,
          post_id: postId,
        }),
      ({ comments }) => {
        if (parentId && !singleComment) {
          // removing parent
          comments = comments.filter((c) => c.comment.id !== parentId);
          const tree = buildCommentTree(comments);
          this.updateTreeCommentRating(this.commentTree, parentId, tree);
          this.concatComments(comments);
        } else {
          this.setComments(comments);
        }
      },
      (e) => console.error(e),
      false,
      "get comments",
    );
  }

  async nextPage(postId: PostId | null) {
    if (this.isLoading || this.comments.length < 5) return;
    // only advance once the page is actually in hand — incrementing up front
    // left a permanent gap in the thread whenever the request failed
    const nextPage = this.page + 1;

    await this.fetchData<GetCommentsResponse>(
      () =>
        this.api.getComments({
          ...this.filters,
          post_id: postId,
          limit: PAGE_LIMIT,
          page: nextPage,
        }),
      ({ comments }) => {
        const uniqueComments = comments.filter(
          (c) =>
            this.comments.findIndex((c2) => c2.comment.id === c.comment.id) ===
            -1,
        );
        if (uniqueComments.length > 0) {
          this.setPage(nextPage);
          this.setComments(this.comments.concat(uniqueComments));
        }
      },
      (e) => console.error(e),
      false,
      "get comments next page: " + nextPage,
    );
  }

  setComments(comments: CommentView[]) {
    this.comments = comments;
    // drop collapse state for comments that are no longer loaded — that keeps it
    // across pagination but clears it when the thread is torn down
    if (this.collapsed.size > 0) {
      const present = new Set(comments.map((c) => c.comment.id));
      this.collapsed = new Set(
        [...this.collapsed].filter((id) => present.has(id)),
      );
    }
    // easier for rendering
    this.buildTree(comments);
  }

  concatComments(comments: CommentView[]) {
    this.comments = this.comments.concat(comments);
  }

  buildTree(comments: CommentView[]) {
    this.commentTree = buildCommentTree(comments);
  }

  addComment(comment: CommentNode) {
    const tree = this.commentTree;
    tree.unshift(comment);
    this.commentTree = tree;
  }

  async rateComment(
    commentId: CommentId,
    score: (typeof Score)[keyof typeof Score],
  ) {
    // update local comment rating because api is slow
    this.updateTreeCommentRating(this.commentTree, commentId, undefined, score);
    await this.fetchData(
      () =>
        this.api.rateComment({
          comment_id: commentId,
          score,
        }),
      ({ comment_view }) => {
        this.updateCommentById(commentId, comment_view);
        this.updateTreeCommentRating(
          this.commentTree,
          commentId,
          undefined,
          score,
          comment_view.counts,
        );
      },
      (e) => console.error(e),
      true,
      "rateComment",
    );
  }

  updateCommentById(commentId: CommentId, updatedComment: CommentView) {
    this.comments = this.comments.map((c) => {
      if (c.comment.id === commentId) return updatedComment;
      return c;
    });
  }

  // any better solution? No idea... (¬_¬)
  updateTreeCommentRating(
    commentTree: CommentNode[],
    commentId: number,
    children?: CommentNode[],
    vote?: (typeof Score)[keyof typeof Score],
    counts?: CommentNode["counts"],
  ): boolean {
    for (const commentNode of commentTree) {
      if (commentNode.comment.id === commentId) {
        if (children !== undefined) {
          commentNode.children = children.concat(commentNode.children);
        }
        if (vote !== undefined) commentNode.my_vote = vote;
        if (counts !== undefined) commentNode.counts = counts;
        this.commentTree = commentTree;
        return true;
      }
      if (
        this.updateTreeCommentRating(
          commentNode.children,
          commentId,
          children,
          vote,
          counts,
        )
      ) {
        this.commentTree = commentTree;
        return true;
      }
    }
    return false;
  }

  async createComment(form: CreateComment, isRoot?: boolean) {
    // post_id || parent_id
    await this.fetchData<CommentResponse>(
      () => this.api.createComment({ ...form }),
      ({ comment_view }) => {
        if (!isRoot) {
          this.updateTreeCommentRating(this.commentTree, form.parent_id, [
            {
              ...comment_view,
              children: [],
            },
          ]);
        } else {
          this.addComment({ ...comment_view, children: [] });
        }
      },
      (e) => console.error(e),
      false,
      "createComment request",
    );
  }
}

export const commentsStore = new CommentsStore();

// maybe use this for future? Looks better
// updateCommentByPath(
//   level: number,
//   commentTree: CommentNode[],
//   // 0.123.123.123
//   commentPath: string,
//   newChildren?: CommentNode[],
//   vote?: (typeof Score)[keyof typeof Score],
// counts?: CommentNode["counts"]
// ) {
//   const pathParts = commentPath.split(".");
//   const itemPath = pathParts.slice(0, level + 1).join(".");
//   const itemIndex = commentTree.findIndex(
//     (cn) => cn.comment.path === itemPath
//   );
//   if (itemIndex !== -1) {
//     if (itemPath !== commentPath) {
//       commentTree[itemIndex].children = this.updateCommentByPath(
//         level + 1,
//         commentTree[itemIndex].children,
//         commentPath,
//         newChildren,
//         vote,
//         counts
//       );
//       return commentTree;
//     } else {
//       const item = { ...commentTree[itemIndex] };
//       console.log("found", item.my_vote, "->", vote);
//       const newItem = Object.assign(item, {
//         children: newChildren
//           ? item.children.concat(newChildren)
//           : item.children,
//         my_vote: vote ? vote : item.my_vote,
//         counts: counts ? counts : item.counts,
//       });
//       commentTree[itemIndex] = newItem;
//       console.log(
//         "changed",
//         commentTree[itemIndex].my_vote,
//         vote,
//         newItem.my_vote,
//         item.my_vote
//       );
//       return commentTree;
//     }
//   }
// }
