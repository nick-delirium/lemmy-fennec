import { makeObservable, observable, action } from "mobx";
import DataClass from "./dataClass";
import {
  PostId,
  LoginResponse,
  ListingType,
  CommentSortType,
  CommunityId,
  CommentId,
  CommentView,
  GetCommentsResponse,
} from 'lemmy-js-client';
import { Score } from "./apiClient";
import { asyncStorageHandler, dataKeys } from "../asyncStorage";
import { ListingTypeMap } from "./postStore";

interface Filters {
  max_depth: number
  saved_only: boolean
  sort: CommentSortType
  type_: ListingType
}

export const CommentSortTypeMap = {
  Hot: "Hot",
  Top: "Top",
  New: "New",
  Old: "Old",
} as const

// basically making it easier to recursively render comments
// is there any better way to do this?
export interface CommentNode extends CommentView {
  children: CommentNode[];
}

// !!!TODO!!!
// grab sub comments and build subtrees (build tree and insert into children array)

class CommentsStore extends DataClass {
  public comments: CommentView[] = [];
  public commentTree: CommentNode[] = []
  public filters: Filters = {
    max_depth: 8,
    saved_only: false,
    sort: CommentSortTypeMap.Hot,
    type_: ListingTypeMap.All,
  }

  constructor() {
    super();
    makeObservable(this, {
      comments: observable.deep,
      filters: observable.deep,
      commentTree: observable.deep,
      setFilters: action,
      setComments: action,
      buildTree: action,
      isLoading: observable,
      setIsLoading: action,
      setClient: action,
    })
  }

  setFilters(filters: Partial<Filters>) {
    this.filters =  Object.assign(this.filters, filters)
    void asyncStorageHandler.setData(dataKeys.commentFilters, JSON.stringify(this.filters))
  }

  async getComments(postId: PostId | null, loginDetails?: LoginResponse, parentId?: number) {
    await this.fetchData<GetCommentsResponse>(
      () => this.api.getComments({ ... this.filters, auth: loginDetails.jwt, post_id: postId, parent_id: parentId }),
      ({ comments }) => this.setComments(comments),
      (e) => console.error(e)
    )
  }

  setComments(comments: CommentView[]) {
    this.comments = comments;
    // easier for rendering
    this.buildTree(comments);
  }

  buildTree(comments: CommentView[]) {
    this.commentTree = buildCommentTree(comments);
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
      console.log('commentNode not found for comment', comment);
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
  const pathSegments = path.split('.');
  pathSegments.pop();
  return pathSegments.join('.');
}

export const commentsStore = new CommentsStore();