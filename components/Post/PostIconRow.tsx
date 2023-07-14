import React from "react";
import { Platform, Share, StyleSheet, View } from "react-native";
import { PostView } from "lemmy-js-client";
import { useTheme } from "@react-navigation/native";
import { observer } from "mobx-react-lite";
import { useActionSheet } from "@expo/react-native-action-sheet";
import { apiClient, ReportMode, Score } from "../../store/apiClient";
import { Icon, Text, TouchableOpacity } from "../../ThemedComponents";
import { commonColors, commonStyles } from "../../commonStyles";
import { preferences } from "../../store/preferences";

interface Props {
  post: PostView;
  useCommunity?: boolean;
  markRead: () => void;
  getComments?: () => void;
  onDelete?: () => void;
}

function PostIconRow({
  post,
  useCommunity,
  markRead,
  getComments,
  onDelete,
}: Props) {
  const { colors } = useTheme();
  const { showActionSheetWithOptions } = useActionSheet();
  const isSelf =
    post.creator.id === apiClient.profileStore.localUser?.local_user.person_id;

  const scoreColor = !post.my_vote
    ? undefined
    : post.my_vote === 1
    ? commonColors.upvote
    : commonColors.downvote;

  const openReporting = () => {
    apiClient.setReportMode(ReportMode.Post, post.post.id);
  };

  const openMenu = () => {
    const jwtOptions = ["Report", "Save"];
    const selfOption = ["Delete"];
    const options = ["Cancel"];
    const icons = [<Icon name={"x"} size={24} />];
    if (isSelf) {
      options.unshift(...selfOption);
      icons.unshift(<Icon name={"trash"} size={24} />);
    }
    if (apiClient.loginDetails?.jwt) {
      options.unshift(...jwtOptions);
      icons.unshift(
        <Icon name={"alert-circle"} size={24} />,
        <Icon name={"bookmark"} size={24} />
      );
    }
    const cancelButtonIndex = options.findIndex((v) => v === "Cancel");
    const destructiveButtonIndex = options.findIndex((v) => v === "Report");
    const saveIndex = options.findIndex((v) => v === "Save");
    const deleteIndex = options.findIndex((v) => v === "Delete");

    const textStyle = {
      color: colors.text,
    };
    const containerStyle = {
      backgroundColor: colors.card,
    };

    showActionSheetWithOptions(
      {
        options,
        icons,
        cancelButtonIndex,
        destructiveButtonIndex,
        textStyle,
        containerStyle,
      },
      (selectedIndex: number) => {
        switch (selectedIndex) {
          case saveIndex:
            void apiClient.postStore.savePost({
              post_id: post.post.id,
              save: !post.saved,
              auth: apiClient.loginDetails?.jwt,
            });
            break;
          case deleteIndex:
            onDelete();
            break;

          case destructiveButtonIndex:
            // Report
            openReporting();
            break;

          case cancelButtonIndex:
          // Canceled
        }
      }
    );
  };
  return (
    <View
      style={{
        ...commonStyles.iconsRow,
        flexDirection: preferences.leftHanded ? "row-reverse" : "row",
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
      {apiClient.loginDetails?.jwt ? (
        <TouchableOpacity simple onPressCb={openMenu}>
          <Icon name={"more-vertical"} size={24} />
        </TouchableOpacity>
      ) : null}
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
        feedback
        onPressCb={() => {
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
        feedback
        onPressCb={() => {
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
