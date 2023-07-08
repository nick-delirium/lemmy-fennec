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
import { commonColors } from "../../commonStyles";

function Comment({
  comment,
  hide,
  isExpanded,
  getAuthor,
  openCommenting,
}: {
  comment: CommentNode;
  isExpanded: boolean;
  hide?: () => void;
  getAuthor?: (author: number) => void;
  openCommenting?: () => void;
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
      comment.my_vote === Score.Upvote ? Score.Neutral : Score.Upvote
    );
  }, []);
  const downvoteComment = React.useCallback(() => {
    Vibration.vibrate(50);
    void apiClient.commentsStore.rateComment(
      comment.comment.id,
      apiClient.loginDetails,
      comment.my_vote === Score.Downvote ? Score.Neutral : Score.Downvote
    );
  }, []);

  const replyToComment = React.useCallback(() => {
    if (!openCommenting) return;
    apiClient.commentsStore.setReplyTo({
      postId: comment.post.id,
      parent_id: comment.comment.id,
      title: comment.post.name,
      community: comment.community.name,
      published: comment.comment.published,
      author: comment.creator.name,
      content: comment.comment.content,
      language_id: comment.comment.language_id,
    });
    openCommenting();
  }, [openCommenting]);

  const scoreColor = React.useMemo(() => {
    return comment.my_vote
      ? comment.my_vote === Score.Upvote
        ? commonColors.upvote
        : commonColors.downvote
      : undefined;
  }, [comment.my_vote]);
  return (
    <View style={{ ...styles.container, borderBottomColor: colors.card }}>
      <View style={styles.topRow}>
        <TouchableOpacity
          simple
          onPressCb={() => getAuthor(comment.creator.id)}
        >
          <View style={styles.row}>
            <Text style={styles.author}>
              u/{comment.creator.display_name || comment.creator.name}
            </Text>
            {comment.post.creator_id === comment.creator.id ? (
              <View style={styles.op}>
                <Text style={styles.opText}>OP</Text>
              </View>
            ) : null}
            {comment.creator.admin ? <Icon name={"shield"} size={16} /> : null}
          </View>
        </TouchableOpacity>
        <Text style={styles.date}>{commentDate}</Text>
      </View>
      <View>
        {!isExpanded && apiClient.profileStore.collapseParentComment ? (
          <Text style={{ fontSize: 16 }} lines={1}>
            {comment.comment.content}
          </Text>
        ) : (
          <Markdown
            value={comment.comment.content}
            styles={{
              paragraph: {
                backgroundColor: colors.background,
              },
            }}
            theme={{ colors: sch === "dark" ? mdTheme.dark : mdTheme.light }}
          />
        )}
      </View>
      <View
        style={{
          ...styles.bottomRow,
          flexDirection: apiClient.profileStore.leftHanded
            ? "row-reverse"
            : "row",
        }}
      >
        <View style={styles.infoPiece}>
          <Icon
            accessibilityLabel={"total rating (upvote percent)"}
            name={"chevrons-up"}
            size={24}
            color={scoreColor}
          />
          <Text customColor={scoreColor}>
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
          hide ? (
            <TouchableOpacity style={styles.infoPiece} simple onPressCb={hide}>
              <Icon
                accessibilityLabel={"hide sub comment tree"}
                name={"eye-off"}
                size={24}
              />
              <Text>{comment.counts.child_count}</Text>
            </TouchableOpacity>
          ) : null
        ) : null}

        <View style={{ flex: 1 }} />
        {openCommenting ? (
          <TouchableOpacity simple onPressCb={replyToComment}>
            <Icon
              accessibilityLabel={"Write a comment on this comment"}
              name={"message-square"}
              size={24}
            />
          </TouchableOpacity>
        ) : null}
        <TouchableOpacity simple onPressCb={shareComment}>
          <Icon
            accessibilityLabel={"share comment button"}
            name={"share-2"}
            size={24}
          />
        </TouchableOpacity>
        <TouchableOpacity simple onPressCb={downvoteComment}>
          <Icon
            accessibilityLabel={"downvote comment"}
            name={"arrow-down"}
            size={24}
            color={
              comment.my_vote === Score.Downvote
                ? commonColors.downvote
                : undefined
            }
          />
        </TouchableOpacity>
        <TouchableOpacity onPressCb={upvoteComment} simple>
          <Icon
            accessibilityLabel={"upvote comment"}
            name={"arrow-up"}
            size={24}
            color={
              comment.my_vote === Score.Upvote ? commonColors.upvote : undefined
            }
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
    gap: 8,
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
    gap: 12,
    paddingTop: 4,
    paddingBottom: 4,
  },
  row: {
    flexDirection: "row",
    gap: 6,
    alignItems: "center",
  },
  op: {
    borderRadius: 4,
    paddingVertical: 2,
    paddingHorizontal: 4,
    backgroundColor: "red",
  },
  opText: {
    fontSize: 10,
    fontWeight: "600",
  },
});

export default observer(Comment);
