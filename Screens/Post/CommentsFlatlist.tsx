import React from "react";
import { observer } from "mobx-react-lite";
import { Theme } from "@react-navigation/native";
import { CommentNode } from "../../store/commentsStore";
import { FlatList, StyleSheet, Text, View } from "react-native";
import Comment from "./Comment";
import { apiClient } from "../../store/apiClient";
import { Icon, TouchableOpacity } from "../../ThemedComponents";

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
    level,
  }: {
    colors: Theme["colors"];
    refreshing?: boolean;
    comments: CommentNode[];
    openComment?: number;
    header?: React.ReactElement;
    footer?: React.ReactElement;
    getAuthor?: (id: number) => void;
    openCommenting?: () => void;
    navigation?: any;
    onRefresh?: () => void;
    level?: number;
    onEndReached?: () => void;
  }) => {
    // this keeps state reactive, but does not trigger re-renders
    const scrolledToItem = React.useRef<number>(0);
    const listRef = React.useRef<FlatList<CommentNode>>(null);
    const extractor = React.useCallback((c) => c.comment.id.toString(), []);
    const renderer = React.useCallback(
      ({ item }) => (
        <CommentRenderer
          openCommenting={openCommenting}
          getAuthor={getAuthor}
          comment={item}
          colors={colors}
          level={level}
        />
      ),
      []
    );

    React.useEffect(() => {
      if (
        listRef.current &&
        comments?.length > 0 &&
        openComment !== undefined
      ) {
        setTimeout(() => {
          listRef.current?.scrollToIndex({
            index: openComment,
            animated: false,
          });
          // idk why this is needed but it is
        }, 125);
      }
    }, [comments, openComment, listRef.current]);

    const rootCommenting = () => {
      const post = apiClient.postStore.singlePost;
      if (post.post.locked) return;
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

    const scrollNext = () => {
      if (listRef.current) {
        listRef.current.scrollToIndex({
          index: scrolledToItem.current + 1,
          animated: true,
        });
        scrolledToItem.current = scrolledToItem.current + 1;
      }
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
          scrollEventThrottle={100}
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
        {level === 1 ? (
          <View
            style={{
              flex: 1,
              width: "100%",
              backgroundColor: colors.card,
              position: "absolute",
              bottom: 0,
              left: 0,
              padding: 8,
              flexDirection: "row",
              gap: 8,
            }}
          >
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
            <TouchableOpacity
              style={{ padding: 4 }}
              simple
              feedback
              onPressCb={scrollNext}
            >
              <Icon name={"chevron-down"} size={24} />
            </TouchableOpacity>
          </View>
        ) : null}
      </>
    );
  }
);

const CommentRenderer = observer(
  ({
    comment,
    colors,
    getAuthor,
    openCommenting,
    level,
  }: {
    colors: Theme["colors"];
    comment: CommentNode;
    level?: number;
    getAuthor?: (id: number) => void;
    openCommenting?: () => void;
  }) => {
    const [isExpanded, setIsExpanded] = React.useState(true);

    const ownColor = React.useMemo(() => rainbow(), []);
    const hide = () => {
      setIsExpanded(false);
    };
    const show = () => {
      setIsExpanded(true);
    };

    const loadMore = () => {
      setIsExpanded(true);
      void apiClient.commentsStore.getComments(
        undefined,
        apiClient.loginDetails,
        comment.comment.id
      );
    };

    if (isExpanded) {
      return (
        <View>
          <Comment
            getAuthor={getAuthor}
            comment={comment}
            isExpanded={isExpanded}
            openCommenting={openCommenting}
            hide={hide}
          />
          {comment.children.length > 0 ? (
            <View
              style={{
                ...styles.subComment,
                borderLeftColor: ownColor,
                marginLeft: level < 5 ? 4 : 0,
                paddingLeft: level < 5 ? 6 : 0,
              }}
            >
              <CommentFlatList
                getAuthor={getAuthor}
                colors={colors}
                openCommenting={openCommenting}
                comments={comment.children}
                level={level + 1}
              />
            </View>
          ) : comment.counts.child_count > 0 ? (
            <TouchableOpacity feedback simple onPressCb={loadMore}>
              <Text
                style={{
                  ...styles.subComment,
                  padding: 8,
                  paddingTop: 8,
                  borderLeftColor: ownColor,
                  color: colors.primary,
                }}
              >
                Load {comment.counts.child_count} more
              </Text>
            </TouchableOpacity>
          ) : null}
        </View>
      );
    } else {
      return (
        <View>
          <Comment
            openCommenting={openCommenting}
            isExpanded={isExpanded}
            comment={comment}
          />
          <TouchableOpacity simple feedback onPressCb={show}>
            <Text
              style={{
                ...styles.subComment,
                padding: 8,
                paddingTop: 8,
                borderLeftColor: ownColor,
                color: colors.primary,
              }}
            >
              + {comment.counts.child_count} hidden
            </Text>
          </TouchableOpacity>
        </View>
      );
    }
  }
);

function rainbow() {
  const colors = [
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
  const random = Math.floor(Math.random() * colors.length);
  return colors[random];
}

const styles = StyleSheet.create({
  subComment: {
    paddingTop: 2,
    borderLeftWidth: 1,
  },
});

export default CommentFlatList;
