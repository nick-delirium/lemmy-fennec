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

const CommentFlatList = observer(
  ({
    comments,
    header,
    footer,
    refreshing,
    colors,
  }: {
    colors: Theme["colors"];
    refreshing?: boolean;
    comments: CommentNode[];
    header?: React.ReactElement;
    footer?: React.ReactElement;
  }) => {
    const extractor = React.useCallback((c) => c.comment.id.toString(), []);
    const renderer = React.useCallback(
      ({ item }) => <CommentRenderer comment={item} colors={colors} />,
      []
    );

    return (
      <FlatList
        windowSize={10}
        maxToRenderPerBatch={10}
        removeClippedSubviews
        initialNumToRender={5}
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

const CommentRenderer = React.memo(
  ({ comment, colors }: { colors: Theme["colors"]; comment: CommentNode }) => {
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

    if (isExpanded) {
      return (
        <View>
          <Comment
            comment={comment}
            isExpanded={isExpanded}
            hide={comment.children.length > 0 ? hide : undefined}
          />
          {comment.children.length > 0 ? (
            <View style={{ ...styles.subComment, borderLeftColor: ownColor }}>
              <CommentFlatList colors={colors} comments={comment.children} />
            </View>
          ) : null}
        </View>
      );
    } else {
      return (
        <View>
          <Comment isExpanded={isExpanded} comment={comment} />
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
