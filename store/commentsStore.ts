import { makeObservable, observable, action } from "mobx";
import DataClass from "./dataClass";
import {
  PostId,
  LoginResponse,
  ListingType,
  CommentSortType,
  CommentId,
  CommentView,
  GetCommentsResponse,
  CreateComment,
  CommentResponse,
} from "lemmy-js-client";
import { Score } from "./apiClient";
import { asyncStorageHandler, dataKeys } from "../asyncStorage";
import { ListingTypeMap } from "./postStore";

interface Filters {
  max_depth: number;
  saved_only: boolean;
  sort: CommentSortType;
  type_: ListingType;
}

export const CommentSortTypeMap = {
  Hot: "Hot",
  Top: "Top",
  New: "New",
  Old: "Old",
} as const;

// basically making it easier to recursively render comments
// is there any better way to do this?
export interface CommentNode extends CommentView {
  children: CommentNode[];
}

// !!!TODO!!!
// grab sub comments and build subtrees (build tree and insert into children array)

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
  public filters: Filters = {
    max_depth: 2,
    saved_only: false,
    sort: CommentSortTypeMap.Hot,
    type_: ListingTypeMap.All,
  };

  constructor() {
    super();
    makeObservable(this, {
      comments: observable.deep,
      filters: observable.deep,
      replyTo: observable,
      commentTree: observable.deep,
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
    });
  }

  setPage(page: number) {
    this.page = page;
  }

  setReplyTo(comment: ReplyView | null) {
    this.replyTo = comment;
  }

  setFilters(filters: Partial<Filters>) {
    this.filters = Object.assign(this.filters, filters);
    void asyncStorageHandler.setData(
      dataKeys.commentFilters,
      JSON.stringify(this.filters)
    );
  }

  async getComments(
    postId: PostId | null,
    loginDetails?: LoginResponse,
    parentId?: number,
    singleComment?: boolean
  ) {
    const additionalFilters = parentId
      ? {
          parent_id: parentId,
          max_depth: 8,
          limit: 999,
        }
      : {
          limit: 40,
          max_depth: 2,
        };
    await this.fetchData<GetCommentsResponse>(
      () =>
        this.api.getComments({
          ...this.filters,
          ...additionalFilters,
          auth: loginDetails?.jwt,
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
      "get comments"
    );
  }

  async nextPage(postId: PostId | null, loginDetails?: LoginResponse) {
    if (this.isLoading || this.comments.length < 5) return;
    this.setPage(this.page + 1);

    await this.fetchData<GetCommentsResponse>(
      () =>
        this.api.getComments({
          ...this.filters,
          auth: loginDetails?.jwt,
          post_id: postId,
          limit: 40,
          page: this.page,
        }),
      ({ comments }) => {
        const uniqueComments = comments.filter(
          (c) =>
            this.comments.findIndex((c2) => c2.comment.id === c.comment.id) ===
            -1
        );
        if (uniqueComments.length > 0) {
          const newComments = this.comments.concat(uniqueComments);
          this.setComments(newComments);
        }
      },
      (e) => console.error(e),
      false,
      "get comments next page: " + this.page
    );
  }

  setComments(comments: CommentView[]) {
    this.comments = comments;
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
    loginDetails: LoginResponse,
    score: (typeof Score)[keyof typeof Score]
  ) {
    if (!loginDetails.jwt) return;
    // update local comment rating because api is slow
    this.updateTreeCommentRating(this.commentTree, commentId, undefined, score);
    await this.fetchData(
      () =>
        this.api.rateComment({
          comment_id: commentId,
          score,
          auth: loginDetails.jwt,
        }),
      ({ comment_view }) => {
        this.updateCommentById(commentId, comment_view);
        this.updateTreeCommentRating(
          this.commentTree,
          commentId,
          undefined,
          score,
          comment_view.counts
        );
      },
      (e) => console.error(e),
      true,
      "rateComment"
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
    counts?: CommentNode["counts"]
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
          counts
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
      "createComment request"
    );
  }
}

// yeah I really had no better idea. PRs welcome!
function buildCommentTree(comments: CommentView[]) {
  const commentMap: { [key: CommentId]: CommentNode } = {};
  const commentTree: CommentNode[] = [];
  for (const comment of comments) {
    commentMap[comment.comment.path] = { ...comment, children: [] };
  }

  // Iterating over comments to build the tree structure
  for (const comment of comments) {
    const commentNode = commentMap[comment.comment.path];
    if (!commentNode) {
      // Skip if the comment does not have a valid parent path
      // why can this happen? I saw it once
      console.log("commentNode not found for comment", comment);
      continue;
    }

    const parentPath = getParentPath(comment.comment.path);
    const parentNode = commentMap[parentPath];

    if (parentNode) {
      parentNode.children.push(commentNode);
    } else {
      // If the parent node does not exist, add the comment node to the root level
      commentTree.push(commentNode);
    }
  }
  return commentTree;
}

// I think .pop is faster than splice here
function getParentPath(path: string): string {
  const pathSegments = path.split(".");
  pathSegments.pop();
  return pathSegments.join(".");
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
