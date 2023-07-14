import React from "react";
import { observer } from "mobx-react-lite";
import { View, StyleSheet, Share, Platform } from "react-native";
import { apiClient, ReportMode, Score } from "../../store/apiClient";
import { Icon, Text, TouchableOpacity } from "../../ThemedComponents";
import { CommentNode } from "../../store/commentsStore";
import { makeDateString } from "../../utils/utils";
import { useTheme } from "@react-navigation/native";
import { commonColors } from "../../commonStyles";
import MdRenderer from "../../components/MdRenderer";
import { preferences } from "../../store/preferences";

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
    void apiClient.commentsStore.rateComment(
      comment.comment.id,
      apiClient.loginDetails,
      comment.my_vote === Score.Upvote ? Score.Neutral : Score.Upvote
    );
  }, []);
  const downvoteComment = React.useCallback(() => {
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

  const openReporting = () => {
    apiClient.setReportMode(ReportMode.Comment, comment.comment.id);
  };
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
        {!isExpanded && preferences.collapseParentComment ? (
          <Text style={{ fontSize: 16, opacity: 0.6 }} lines={1}>
            {comment.comment.content}
          </Text>
        ) : (
          <TouchableOpacity onPressCb={hide} simple feedback>
            <MdRenderer value={comment.comment.content} />
          </TouchableOpacity>
        )}
      </View>
      <View
        style={{
          ...styles.bottomRow,
          flexDirection: preferences.leftHanded ? "row-reverse" : "row",
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

        <View style={{ flex: 1 }} />
        {apiClient.loginDetails?.jwt ? (
          <TouchableOpacity simple onPressCb={openReporting}>
            <Icon name={"alert-circle"} size={24} />
          </TouchableOpacity>
        ) : null}
        {openCommenting ? (
          <TouchableOpacity
            simple
            style={styles.infoPiece}
            onPressCb={replyToComment}
          >
            <Icon
              accessibilityLabel={"Write a comment on this comment"}
              name={"message-square"}
              size={24}
            />
            <Text>{comment.counts.child_count}</Text>
          </TouchableOpacity>
        ) : null}
        <TouchableOpacity simple onPressCb={shareComment}>
          <Icon
            accessibilityLabel={"share comment button"}
            name={"share-2"}
            size={24}
          />
        </TouchableOpacity>
        <TouchableOpacity feedback simple onPressCb={downvoteComment}>
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
        <TouchableOpacity feedback onPressCb={upvoteComment} simple>
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
