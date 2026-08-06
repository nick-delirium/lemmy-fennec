import React from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";

import { Theme } from "@react-navigation/native";
import { observer } from "mobx-react-lite";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Icon, TouchableOpacity } from "../../ThemedComponents";
import { apiClient } from "../../store/apiClient";
import { FlatComment, MAX_INDENT_DEPTH } from "../../store/commentsStore";
import Comment from "./Comment";

const INDENT_PER_LEVEL = 8;

const CommentFlatList = observer(
  ({
    comments,
    header,
    footer,
    refreshing,
    colors,
    getAuthor,
    openComment,
    navigation,
    openCommenting,
    onRefresh,
    onEndReached,
    onScroll,
    scrollEventThrottle,
  }: {
    colors: Theme["colors"];
    refreshing?: boolean;
    /** already flattened by commentsStore.visibleComments */
    comments: FlatComment[];
    openComment?: number;
    header?: React.ReactElement;
    footer?: React.ReactElement;
    getAuthor?: (id: number) => void;
    openCommenting?: () => void;
    navigation?: any;
    onRefresh?: () => void;
    onEndReached?: () => void;
    onScroll?: (e: any) => void;
    scrollEventThrottle?: number;
  }) => {
    // this keeps state reactive, but does not trigger re-renders
    const scrolledToItem = React.useRef<number>(0);
    const listRef = React.useRef<FlatList<FlatComment>>(null);
    const insets = useSafeAreaInsets();

    const extractor = React.useCallback(
      (c: FlatComment) => c.node.comment.id.toString(),
      [],
    );
    const renderer = React.useCallback(
      ({ item }: { item: FlatComment }) => (
        <CommentRow
          row={item}
          colors={colors}
          getAuthor={getAuthor}
          openCommenting={openCommenting}
        />
      ),
      [colors, getAuthor, openCommenting],
    );

    React.useEffect(() => {
      if (!listRef.current || !comments?.length || openComment === undefined) {
        return;
      }
      // scrollToIndex right after mount lands on a list that hasn't laid out yet
      const timer = setTimeout(() => {
        if (openComment >= comments.length) return;
        listRef.current?.scrollToIndex({ index: openComment, animated: false });
      }, 125);
      return () => clearTimeout(timer);
    }, [comments, openComment]);

    const rootCommenting = () => {
      const post = apiClient.postStore.singlePost;
      if (!post || post.post.locked || !apiClient.isLoggedIn) return;
      apiClient.commentsStore.setReplyTo({
        postId: post.post.id,
        parent_id: undefined,
        title: post.post.name,
        community: post.community.name,
        published: post.post.published,
        author: post.creator.name,
        content: post.post.body || post.post.url,
        language_id: post.post.language_id,
      });
      navigation.navigate("CommentWrite");
    };

    // now steps one comment at a time — indices used to address top-level
    // threads, so this skipped whole subtrees
    const scrollNext = () => {
      if (!listRef.current) return;
      const next =
        scrolledToItem.current + 1 < comments.length
          ? scrolledToItem.current + 1
          : scrolledToItem.current;
      listRef.current.scrollToIndex({ index: next, animated: true });
      scrolledToItem.current = next;
    };
    const resetScroll = () =>
      scrolledToItem.current !== 0 ? (scrolledToItem.current = 0) : null;

    const changeScrollIndex = React.useCallback(({ viewableItems }) => {
      if (viewableItems.length === 0) return;
      const firstItem = viewableItems[0];
      scrolledToItem.current = firstItem.index;
    }, []);

    return (
      <>
        <FlatList
          scrollEventThrottle={scrollEventThrottle}
          onScroll={onScroll}
          onScrollToTop={resetScroll}
          onRefresh={onRefresh}
          ref={listRef}
          onViewableItemsChanged={changeScrollIndex}
          windowSize={15}
          maxToRenderPerBatch={15}
          removeClippedSubviews
          onEndReached={onEndReached}
          onEndReachedThreshold={0.5}
          initialNumToRender={10}
          ListHeaderComponent={header}
          ListFooterComponent={footer}
          data={comments}
          style={{ flex: 1 }}
          keyExtractor={extractor}
          renderItem={renderer}
          refreshing={refreshing}
        />
        <View
          style={{
            flex: 1,
            width: "100%",
            backgroundColor: colors.card,
            position: "absolute",
            bottom: 0,
            left: 0,
            // sits flush against the screen edges, so it has to clear the home
            // indicator and the rounded corners itself
            paddingTop: 8,
            paddingBottom: 8 + insets.bottom,
            paddingLeft: 8 + insets.left,
            paddingRight: 8 + insets.right,
            flexDirection: "row",
            gap: 8,
          }}
        >
          {/* no point offering the field when it can't be submitted; the
              jump-to-next-comment button below stays useful either way */}
          {apiClient.isLoggedIn ? (
            <TouchableOpacity
              style={{ flex: 1 }}
              simple
              feedback
              onPressCb={rootCommenting}
            >
              <View
                style={{
                  flex: 1,
                  borderRadius: 6,
                  borderWidth: 1,
                  justifyContent: "center",
                  paddingHorizontal: 6,
                  borderColor: colors.border,
                }}
              >
                <Text style={{ opacity: 0.6, color: colors.text }}>
                  Comment...
                </Text>
              </View>
            </TouchableOpacity>
          ) : (
            <View style={{ flex: 1 }} />
          )}
          <TouchableOpacity
            style={{ padding: 4 }}
            simple
            feedback
            onPressCb={scrollNext}
          >
            <Icon name={"chevron-down"} size={24} />
          </TouchableOpacity>
        </View>
      </>
    );
  },
);

/**
 * A single row. Depth is drawn with padding and one coloured rail instead of
 * nesting a view per level, so the hierarchy stays flat for layout.
 */
const CommentRow = observer(
  ({
    row,
    colors,
    getAuthor,
    openCommenting,
  }: {
    row: FlatComment;
    colors: Theme["colors"];
    getAuthor?: (id: number) => void;
    openCommenting?: () => void;
  }) => {
    const { node, depth, isCollapsed } = row;
    const { commentsStore } = apiClient;

    const toggle = () => commentsStore.toggleCollapsed(node.comment.id);
    const loadMore = () => {
      void commentsStore.getComments(undefined, node.comment.id);
    };

    const railColor = rainbow(depth);
    const hasLoadedChildren = node.children.length > 0;
    const unloadedReplies = node.counts.child_count;

    return (
      <View
        style={{
          paddingLeft: Math.min(depth, MAX_INDENT_DEPTH) * INDENT_PER_LEVEL,
        }}
      >
        <View
          style={
            depth > 0
              ? { ...styles.rail, borderLeftColor: railColor }
              : undefined
          }
        >
          <Comment
            getAuthor={getAuthor}
            comment={node}
            isExpanded={!isCollapsed}
            openCommenting={openCommenting}
            hide={toggle}
          />
          {isCollapsed ? (
            <TouchableOpacity simple feedback onPressCb={toggle}>
              <Text style={{ ...styles.moreRow, color: colors.primary }}>
                + {unloadedReplies} hidden
              </Text>
            </TouchableOpacity>
          ) : !hasLoadedChildren && unloadedReplies > 0 ? (
            <TouchableOpacity simple feedback onPressCb={loadMore}>
              <Text style={{ ...styles.moreRow, color: colors.primary }}>
                Load {unloadedReplies} more
              </Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
    );
  },
);

const rainbowColors = [
  "#EE4B2B",
  "#FFA500",
  "#FFFF00",
  "#008000",
  "#0000FF",
  "#3F00FF",
  "#FFC0CB",
  "#ADD8E6",
  "#191970",
  "#40E0D0",
  "#00FF00",
  "#E6E6FA",
  "#FFFFE0",
] as const;

/**
 * Rail colour by depth, so sibling threads line up visually. Was Math.random(),
 * which re-rolled the colour every time a row got recycled while scrolling.
 */
function rainbow(depth: number) {
  return rainbowColors[depth % rainbowColors.length];
}

const styles = StyleSheet.create({
  rail: {
    borderLeftWidth: 2,
    paddingLeft: 6,
  },
  moreRow: {
    paddingTop: 8,
    padding: 8,
  },
});

export default CommentFlatList;
