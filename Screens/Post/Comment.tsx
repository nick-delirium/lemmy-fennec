import React from "react";
import { observer } from "mobx-react-lite";
import {
  View,
  StyleSheet,
  useColorScheme,
  Share,
  Platform,
  Vibration,
} from "react-native";
import { apiClient, Score } from "../../store/apiClient";
import { Icon, Text, TouchableOpacity } from "../../ThemedComponents";
import { CommentNode } from "../../store/commentsStore";
import { makeDateString } from "../../utils/utils";
import Markdown from "react-native-marked";
import { mdTheme } from "../../commonStyles";
import { useTheme } from "@react-navigation/native";

function Comment({
  comment,
  hide,
}: {
  comment: CommentNode;
  hide?: () => void;
}) {
  const sch = useColorScheme();
  const { colors } = useTheme();

  const commentDate = React.useMemo(
    () => makeDateString(comment.comment.published),
    []
  );
  const shareComment = React.useCallback(() => {
    void Share.share(
      {
        url: comment.comment.ap_id,
        message: Platform.OS === "ios" ? "" : comment.comment.ap_id,
        title: comment.comment.ap_id,
      },
      { dialogTitle: comment.comment.ap_id }
    );
  }, []);
  const upvoteComment = React.useCallback(() => {
    Vibration.vibrate(50);
    void apiClient.commentsStore.rateComment(
      comment.comment.id,
      apiClient.loginDetails,
      Score.Upvote
    );
  }, []);
  const downvoteComment = React.useCallback(() => {
    Vibration.vibrate(50);
    void apiClient.commentsStore.rateComment(
      comment.comment.id,
      apiClient.loginDetails,
      Score.Downvote
    );
  }, []);

  return (
    <View style={{ ...styles.container, borderBottomColor: colors.card }}>
      <View style={styles.topRow}>
        <Text style={styles.author}>
          u/{comment.creator.display_name || comment.creator.name}
        </Text>
        <Text style={styles.date}>{commentDate}</Text>
      </View>
      <View>
        <Markdown
          value={comment.comment.content}
          styles={{
            paragraph: {
              backgroundColor: colors.background,
            },
          }}
          theme={{ colors: sch === "dark" ? mdTheme.dark : mdTheme.light }}
        />
      </View>
      <View style={styles.bottomRow}>
        <View style={styles.infoPiece}>
          <Icon
            accessibilityLabel={"total rating (upvote percent)"}
            name={"chevrons-up"}
            size={24}
          />
          <Text>
            {comment.counts.score} (
            {Math.ceil(
              (comment.counts.upvotes /
                (comment.counts.upvotes + comment.counts.downvotes)) *
                100
            )}
            %)
          </Text>
        </View>
        {comment.children.length > 0 ? (
          <View style={styles.infoPiece}>
            <Icon
              accessibilityLabel={"sub comments amount"}
              name={"message-square"}
              size={24}
            />
            <Text>{comment.children.length}</Text>
          </View>
        ) : null}

        <View style={{ flex: 1 }} />
        <TouchableOpacity simple onPressCb={shareComment}>
          <Icon
            accessibilityLabel={"share comment button"}
            name={"share-2"}
            size={24}
          />
        </TouchableOpacity>
        {hide ? (
          <TouchableOpacity simple onPressCb={hide}>
            <Icon
              accessibilityLabel={"hide sub comment tree"}
              name={"eye-off"}
              size={24}
            />
          </TouchableOpacity>
        ) : null}
        <TouchableOpacity simple onPressCb={downvoteComment}>
          <Icon
            accessibilityLabel={"downvote comment"}
            name={"arrow-down"}
            size={24}
            color={comment.my_vote === Score.Downvote ? "red" : undefined}
          />
        </TouchableOpacity>
        <TouchableOpacity onPressCb={upvoteComment} simple>
          <Icon
            accessibilityLabel={"upvote comment"}
            name={"arrow-up"}
            size={24}
            color={comment.my_vote === Score.Upvote ? "red" : undefined}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 8,
    borderBottomWidth: 1,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  infoPiece: {
    flexDirection: "row",
    gap: 6,
    alignItems: "center",
  },
  date: {
    fontWeight: "300",
    fontSize: 12,
  },
  author: {
    fontSize: 12,
    fontWeight: "500",
    color: "orange",
  },
  bottomRow: {
    flexDirection: "row",
    gap: 12,
    paddingTop: 4,
    paddingBottom: 4,
  },
});

export default observer(Comment);
