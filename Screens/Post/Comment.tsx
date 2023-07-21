import React from "react";
import { observer } from "mobx-react-lite";
import { View, StyleSheet, Share, Platform } from "react-native";
import { apiClient, ReportMode, Score } from "../../store/apiClient";
import { Text, TouchableOpacity } from "../../ThemedComponents";
import { CommentNode } from "../../store/commentsStore";
import { useTheme } from "@react-navigation/native";
import { commonColors } from "../../commonStyles";
import MdRenderer from "../../components/MdRenderer";
import { preferences } from "../../store/preferences";
import CommentTitle from "./Comment/CommentTitle";
import CommentIconRow from "./Comment/CommentIconRow";
import { setStringAsync } from "expo-clipboard";

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

  const shareComment = React.useCallback(() => {
    void Share.share(
      {
        url: comment.comment.ap_id,
        message: Platform.OS === "ios" ? "" : comment.comment.ap_id,
        title: comment.comment.ap_id,
      },
      { dialogTitle: comment.comment.ap_id }
    );
  }, [comment.my_vote]);
  const upvoteComment = React.useCallback(() => {
    if (!apiClient.loginDetails?.jwt) return;
    void apiClient.commentsStore.rateComment(
      comment.comment.id,
      apiClient.loginDetails,
      comment.my_vote === Score.Upvote ? Score.Neutral : Score.Upvote
    );
  }, [comment.my_vote]);
  const downvoteComment = React.useCallback(() => {
    if (!apiClient.loginDetails?.jwt) return;
    void apiClient.commentsStore.rateComment(
      comment.comment.id,
      apiClient.loginDetails,
      comment.my_vote === Score.Downvote ? Score.Neutral : Score.Downvote
    );
  }, []);

  const replyToComment = React.useCallback(() => {
    if (!openCommenting || !apiClient.loginDetails?.jwt) return;
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
  const editComment = React.useCallback(() => {
    if (!openCommenting || !apiClient.loginDetails?.jwt) return;
    apiClient.commentsStore.setReplyTo({
      postId: comment.post.id,
      parent_id: comment.comment.id,
      title: comment.post.name,
      community: comment.community.name,
      published: comment.comment.published,
      author: comment.creator.name,
      content: comment.comment.content,
      language_id: comment.comment.language_id,
      isEdit: true,
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
    apiClient.setShowPrompt(true);
  };

  const onCopy = () => {
    void setStringAsync(comment.comment.content);
  };

  const selfComment =
    apiClient.profileStore.localUser.person.id === comment.creator.id;
  return (
    <View style={{ ...styles.container, borderBottomColor: colors.card }}>
      <CommentTitle comment={comment} getAuthor={getAuthor} />
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
      <CommentIconRow
        scoreColor={scoreColor}
        upvoteComment={upvoteComment}
        downvoteComment={downvoteComment}
        replyToComment={replyToComment}
        shareComment={shareComment}
        openReporting={openReporting}
        score={comment.counts.score}
        my_vote={comment.my_vote}
        child_count={comment.counts.child_count}
        upvotes={comment.counts.upvotes}
        downvotes={comment.counts.downvotes}
        editComment={editComment}
        onCopy={onCopy}
        selfComment={selfComment}
      />
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
