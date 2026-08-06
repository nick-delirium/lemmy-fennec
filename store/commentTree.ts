import { CommentId, CommentView } from "lemmy-js-client";

export interface CommentNode extends CommentView {
  children: CommentNode[];
}

/**
 * One rendered comment row. The tree is flattened depth-first into a linear list
 * so a single FlatList can virtualise the whole thread — rendering the tree
 * recursively meant every top-level row mounted its entire subtree at once.
 */
export interface FlatComment {
  node: CommentNode;
  depth: number;
  isCollapsed: boolean;
}

/** How deep the indent keeps growing before it stops, to keep rows readable. */
export const MAX_INDENT_DEPTH = 5;

/**
 * Walks the tree depth-first into the row list the comment FlatList renders.
 * A collapsed node is emitted but its subtree is skipped, so collapsing is what
 * shortens the list rather than anything in the view layer.
 */
export function flattenCommentTree(
  tree: CommentNode[],
  collapsed: ReadonlySet<CommentId>,
): FlatComment[] {
  const rows: FlatComment[] = [];
  const walk = (nodes: CommentNode[], depth: number) => {
    for (const node of nodes) {
      const isCollapsed = collapsed.has(node.comment.id);
      rows.push({ node, depth, isCollapsed });
      if (!isCollapsed && node.children.length > 0) {
        walk(node.children, depth + 1);
      }
    }
  };
  walk(tree, 0);
  return rows;
}

/**
 * Groups a flat comment list into a tree using lemmy's `path` ("0.12.34"), which
 * spells out a comment's ancestry. Sibling order follows the order the API
 * returned, so the active sort is preserved.
 */
export function buildCommentTree(comments: CommentView[]): CommentNode[] {
  // keyed by path, not by id — the previous signature claimed CommentId
  const byPath = new Map<string, CommentNode>();
  for (const comment of comments) {
    byPath.set(comment.comment.path, { ...comment, children: [] });
  }

  const commentTree: CommentNode[] = [];
  for (const comment of comments) {
    // always present: inserted by the loop above
    const node = byPath.get(comment.comment.path);
    const parent = byPath.get(getParentPath(comment.comment.path));
    // no loaded parent means this is a root as far as this page is concerned
    if (parent) parent.children.push(node);
    else commentTree.push(node);
  }
  return commentTree;
}

// I think .pop is faster than splice here
function getParentPath(path: string): string {
  const pathSegments = path.split(".");
  pathSegments.pop();
  return pathSegments.join(".");
}
