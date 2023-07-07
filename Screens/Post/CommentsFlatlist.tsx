import { observer } from "mobx-react-lite";
import { Theme } from "@react-navigation/native";
import { CommentNode } from "../../store/commentsStore";
import React from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  Vibration,
  View,
} from "react-native";
import Comment from "./Comment";
import { apiClient } from "../../store/apiClient";

const CommentFlatList = observer(
  ({
    comments,
    header,
    footer,
    refreshing,
    colors,
    getAuthor,
    openComment,
    openCommenting,
    onRefresh,
    onEndReached,
  }: {
    colors: Theme["colors"];
    refreshing?: boolean;
    comments: CommentNode[];
    openComment?: number;
    header?: React.ReactElement;
    footer?: React.ReactElement;
    getAuthor?: (id: number) => void;
    openCommenting?: () => void;
    onRefresh?: () => void;
    onEndReached?: () => void;
  }) => {
    const listRef = React.useRef<FlatList<CommentNode>>(null);
    const extractor = React.useCallback((c) => c.comment.id.toString(), []);
    const renderer = React.useCallback(
      ({ item }) => (
        <CommentRenderer
          openCommenting={openCommenting}
          getAuthor={getAuthor}
          comment={item}
          colors={colors}
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
          listRef.current.scrollToIndex({
            index: openComment,
            animated: false,
          });
          // idk why this is needed but it is
        }, 125);
      }
    }, [comments, openComment, listRef.current]);

    return (
      <FlatList
        onRefresh={onRefresh}
        ref={listRef}
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
    );
  }
);

const CommentRenderer = observer(
  ({
    comment,
    colors,
    getAuthor,
    openCommenting,
  }: {
    colors: Theme["colors"];
    comment: CommentNode;
    getAuthor?: (id: number) => void;
    openCommenting?: () => void;
  }) => {
    const [isExpanded, setIsExpanded] = React.useState(true);

    const ownColor = React.useMemo(() => rainbow(), []);
    const hide = () => {
      Vibration.vibrate(50);
      setIsExpanded(false);
    };
    const show = () => {
      Vibration.vibrate(50);
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
            hide={comment.children.length > 0 ? hide : undefined}
          />
          {comment.children.length > 0 ? (
            <View style={{ ...styles.subComment, borderLeftColor: ownColor }}>
              <CommentFlatList
                getAuthor={getAuthor}
                colors={colors}
                openCommenting={openCommenting}
                comments={comment.children}
              />
            </View>
          ) : comment.counts.child_count > 0 ? (
            <TouchableOpacity onPress={loadMore}>
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
          <TouchableOpacity onPress={show}>
            <Text
              style={{
                ...styles.subComment,
                padding: 8,
                paddingTop: 8,
                borderLeftColor: ownColor,
                color: colors.primary,
              }}
            >
              + {comment.children.length} hidden
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
    marginLeft: 12,
    paddingLeft: 8,
    paddingTop: 2,
    borderLeftWidth: 1,
  },
});

export default CommentFlatList;
