import React from "react";
import { observer } from "mobx-react-lite";
import { apiClient, Score } from "../../store/apiClient";
import { Platform, Share, StyleSheet, Vibration, View } from "react-native";
import { Icon, Text, TouchableOpacity } from "../../ThemedComponents";
import { commonColors, commonStyles } from "../../commonStyles";
import { PostView } from "lemmy-js-client";

interface Props {
  post: PostView;
  useCommunity?: boolean;
  markRead: () => void;
  getComments?: () => void;
}

function PostIconRow({ post, useCommunity, markRead, getComments }: Props) {
  const scoreColor = !post.my_vote
    ? undefined
    : post.my_vote === 1
    ? commonColors.upvote
    : commonColors.downvote;
  return (
    <View
      style={{
        ...commonStyles.iconsRow,
        flexDirection: apiClient.profileStore.leftHanded
          ? "row-reverse"
          : "row",
      }}
    >
      <View style={styles.infoPiece}>
        <Icon
          accessibilityLabel={"total rating"}
          name={"chevrons-up"}
          size={24}
          color={scoreColor}
        />
        <Text customColor={scoreColor}>
          {post.counts.score} (
          {Math.ceil(
            (post.counts.upvotes /
              (post.counts.upvotes + post.counts.downvotes)) *
              100
          )}
          %)
        </Text>
      </View>
      <View style={{ flex: 1 }} />
      <TouchableOpacity onPressCb={getComments} simple>
        <View style={styles.infoPiece}>
          <Icon
            accessibilityLabel={"total comments (+ unread)"}
            name={"message-square"}
            size={24}
          />
          <Text>
            {`${post.counts.comments}${
              post.unread_comments > 0 ? "(+" + post.unread_comments + ")" : ""
            }`}
          </Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        simple
        onPressCb={() => {
          Vibration.vibrate(50);
          void apiClient.postStore.savePost({
            post_id: post.post.id,
            save: !post.saved,
            auth: apiClient.loginDetails?.jwt,
          });
        }}
      >
        <Icon
          accessibilityLabel={"bookmark post button"}
          name={"bookmark"}
          size={24}
          color={post.saved ? "red" : undefined}
        />
      </TouchableOpacity>
      <TouchableOpacity
        simple
        onPressCb={() =>
          Share.share(
            {
              url: post.post.ap_id,
              message: Platform.OS === "ios" ? "" : post.post.ap_id,
              title: post.post.name,
            },
            { dialogTitle: post.post.name }
          )
        }
      >
        <Icon
          accessibilityLabel={"share post button"}
          name={"share-2"}
          size={24}
        />
      </TouchableOpacity>
      <TouchableOpacity
        simple
        onPressCb={() => {
          Vibration.vibrate(50);
          markRead();
          void apiClient.postStore.ratePost(
            post.post.id,
            apiClient.loginDetails,
            post.my_vote === Score.Downvote ? Score.Neutral : Score.Downvote,
            useCommunity
          );
        }}
      >
        <Icon
          accessibilityLabel={"downvote post"}
          name={"arrow-down"}
          size={24}
          color={post.my_vote === -1 ? commonColors.downvote : undefined}
        />
      </TouchableOpacity>
      <TouchableOpacity
        simple
        onPressCb={() => {
          Vibration.vibrate(50);
          markRead();
          void apiClient.postStore.ratePost(
            post.post.id,
            apiClient.loginDetails,
            post.my_vote === Score.Upvote ? Score.Neutral : Score.Upvote,
            useCommunity
          );
        }}
      >
        <Icon
          accessibilityLabel={"upvote post"}
          name={"arrow-up"}
          size={24}
          color={post.my_vote === 1 ? commonColors.upvote : undefined}
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 8,
    borderBottomWidth: 1,
  },
  infoPiece: {
    flexDirection: "row",
    gap: 6,
    alignItems: "center",
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  imageBox: {
    alignItems: "center",
    gap: 4,
  },
  previewButton: {
    width: "100%",
    alignItems: "center",
    padding: 12,
  },
  communityIconContainer: {
    backgroundColor: "#f6f6f6",
    borderRadius: 24,
    width: 24,
    height: 24,
  },
  communityIcon: { width: 24, height: 24, borderRadius: 24 },
  authorName: { fontSize: 13, fontWeight: "500", color: "orange" },
  communityName: {
    fontSize: 13,
    fontWeight: "500",
    marginLeft: 4,
    color: "violet",
  },
  smolText: { fontSize: 12 },
  postName: {
    fontSize: 16,
    marginTop: 4,
    marginBottom: 8,
  },
  postImg: { width: "100%", height: 340 },
});

export default observer(PostIconRow);
