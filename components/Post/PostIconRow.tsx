import React from "react";
import {
  Alert,
  Platform,
  Share,
  StyleSheet,
  ToastAndroid,
  useColorScheme,
  View,
} from "react-native";
import { PostView } from "lemmy-js-client";
import { useNavigation, useTheme } from "@react-navigation/native";
import { observer } from "mobx-react-lite";
import { useActionSheet } from "@expo/react-native-action-sheet";
import { apiClient, ReportMode, Score } from "../../store/apiClient";
import { Icon, Text, TouchableOpacity } from "../../ThemedComponents";
import { commonColors, commonStyles } from "../../commonStyles";
import { preferences } from "../../store/preferences";
import { shortenNumbers } from "../../utils/utils";

interface Props {
  post: PostView;
  markRead: () => void;
  isExpanded?: boolean;
  useCommunity?: boolean;
  getComments?: () => void;
}

function PostIconRow({
  post,
  useCommunity,
  markRead,
  getComments,
  isExpanded,
}: Props) {
  const scheme = useColorScheme();
  const navigation = useNavigation();
  const { colors } = useTheme();
  const { showActionSheetWithOptions } = useActionSheet();

  const onModLock = () => {
    if (!apiClient.loginDetails?.jwt) return;
    const onConfirm = () => {
      apiClient.postStore
        .modLockPost(
          {
            post_id: post.post.id,
            locked: !post.post.locked,
            auth: apiClient.loginDetails?.jwt,
          },
          isExpanded,
          useCommunity
        )
        .then(() => {
          ToastAndroid.showWithGravity(
            "Post lock toggled",
            ToastAndroid.SHORT,
            ToastAndroid.CENTER
          );
        });
    };

    Alert.alert(
      "Lock Post?",
      "Are you sure you want to lock this post?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Lock",
          onPress: () => onConfirm(),
        },
      ],
      {
        userInterfaceStyle: scheme,
      }
    );
  };
  const onPostDelete = () => {
    if (!apiClient.loginDetails?.jwt) return;
    const onConfirm = () => {
      apiClient.postStore
        .deletePost({
          auth: apiClient.loginDetails.jwt,
          post_id: post.post.id,
          deleted: true,
        })
        .then(() => {
          ToastAndroid.show("Post deleted", ToastAndroid.SHORT);
          if (isExpanded) {
            navigation.goBack();
          }
        });
    };

    Alert.alert(
      "Delete post?",
      "Are you sure you want to delete this post?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          onPress: () => onConfirm(),
        },
      ],
      {
        userInterfaceStyle: scheme,
      }
    );
  };
  const isSelf =
    post.creator.id === apiClient.profileStore.localUser?.local_user.person_id;

  const scoreColor = !post.my_vote
    ? undefined
    : post.my_vote === 1
    ? commonColors.upvote
    : commonColors.downvote;

  const openReporting = () => {
    apiClient.setReportMode(ReportMode.Post, post.post.id);
    apiClient.setShowPrompt(true);
  };

  const openMenu = () => {
    const jwtOptions = ["Report", "Post Save Toggle", "Block Community"];
    const selfOption = ["Delete Own Post"];
    const options = ["Cancel"];
    const icons = [<Icon name={"x"} size={24} />];
    if (isSelf) {
      options.unshift(...selfOption);
      icons.unshift(<Icon name={"trash"} size={24} />);
    }
    if (apiClient.loginDetails?.jwt) {
      if (
        apiClient.profileStore.moderatedCommunities.findIndex(
          (c) => c.community.id === post.community.id
        ) !== -1
      ) {
        options.unshift(
          "Mod: Feature Post Toggle",
          "Mod: Remove Post",
          "Mod: Post Lock Toggle"
          // "Ban user"
        );
        icons.unshift(
          <Icon name={"star"} size={24} />,
          <Icon name={"slash"} size={24} />,
          <Icon name={"lock"} size={24} />
          // <Icon name={"user-x"} size={24} />
        );
      }
      if (post.creator.id === apiClient.profileStore.localUser?.person.id) {
        options.unshift("Edit");
        icons.unshift(<Icon name={"edit-2"} size={24} />);
      }
      options.unshift(...jwtOptions);
      icons.unshift(
        <Icon name={"alert-circle"} size={24} />,
        <Icon name={"bookmark"} size={24} />,
        <Icon name={"slash"} size={24} />
      );
    }
    const cancelButtonIndex = options.findIndex((v) => v === "Cancel");
    const destructiveButtonIndex = options.findIndex((v) => v === "Report");
    const saveIndex = options.findIndex((v) => v === "Post Save Toggle");
    const deleteIndex = options.findIndex((v) => v === "Delete Own Post");
    const removePostIndex = options.findIndex((v) => v === "Mod: Remove Post");
    const togglePostLockIndex = options.findIndex(
      (v) => v === "Mod: Post Lock Toggle"
    );
    const featurePostIndex = options.findIndex(
      (v) => v === "Mod: Feature Post Toggle"
    );
    const editIndex = options.findIndex((v) => v === "Edit");
    // const banUserIndex = options.findIndex((v) => v === "Ban user");
    const blockCommunityIndex = options.findIndex(
      (v) => v === "Block Community"
    );
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
          // too lazy to do this rn
          // case banUserIndex:
          //   apiClient.postStore
          //     .modBanCommunityUser({
          //       community_id: post.community.id,
          //       person_id: post.creator.id,
          //       ban: true,
          //       auth: apiClient.loginDetails?.jwt,
          //       reason: "",
          //       expires: 0,
          //     })
          //     .then(() => {
          //       ToastAndroid.showWithGravity(
          //         "User banned",
          //         ToastAndroid.SHORT,
          //         ToastAndroid.CENTER
          //       );
          //     });
          //   break;
          case blockCommunityIndex:
            apiClient.communityStore
              .blockCommunity(post.community.id, true, apiClient.loginDetails)
              .then(() => {
                ToastAndroid.showWithGravity(
                  "Community blocked",
                  ToastAndroid.SHORT,
                  ToastAndroid.CENTER
                );
              });
            break;
          case editIndex:
            // @ts-ignore
            navigation.navigate("PostWrite", {
              communityName: post.community.name,
              communityId: post.community.id,
              isEdit: true,
              content: {
                id: post.post.id,
                text: post.post.body,
                title: post.post.name,
                nsfw: post.post.nsfw,
                url: post.post.url,
              },
            });
            break;
          case featurePostIndex:
            apiClient.postStore
              .modFeaturePost(
                {
                  post_id: post.post.id,
                  featured: !post.post.featured_community,
                  auth: apiClient.loginDetails?.jwt,
                  feature_type: "Community",
                },
                isExpanded,
                useCommunity
              )
              .then(() => {
                ToastAndroid.showWithGravity(
                  "Post Feature status changed",
                  ToastAndroid.SHORT,
                  ToastAndroid.CENTER
                );
              });
            break;
          case togglePostLockIndex:
            onModLock();
            break;
          case removePostIndex:
            apiClient.setPromptActions({
              onConfirm: (text) => {
                apiClient.postStore
                  .modRemovePost(
                    {
                      post_id: post.post.id,
                      removed: !post.post.removed,
                      auth: apiClient.loginDetails?.jwt,
                      reason: text,
                    },
                    isExpanded,
                    useCommunity
                  )
                  .then(() => {
                    ToastAndroid.showWithGravity(
                      "Post removed",
                      ToastAndroid.SHORT,
                      ToastAndroid.CENTER
                    );
                  });
              },
              onCancel: () => apiClient.setShowPrompt(false),
            });
            apiClient.setShowPrompt(true);
            break;
          case saveIndex:
            void apiClient.postStore.savePost(
              {
                post_id: post.post.id,
                save: !post.saved,
                auth: apiClient.loginDetails?.jwt,
              },
              isExpanded,
              useCommunity
            );
            break;
          case deleteIndex:
            onPostDelete();
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
          {shortenNumbers(post.counts.score)} (
          {post.counts.score !== 0
            ? Math.ceil(
                (post.counts.upvotes /
                  (post.counts.upvotes + post.counts.downvotes)) *
                  100
              )
            : 0}
          %)
        </Text>
      </View>
      <View style={{ flex: 1 }} />
      {apiClient.loginDetails?.jwt ? (
        <TouchableOpacity
          style={commonStyles.touchableIcon}
          simple
          onPressCb={openMenu}
        >
          <Icon name={"more-vertical"} size={24} />
        </TouchableOpacity>
      ) : null}
      <TouchableOpacity
        style={commonStyles.touchableIcon}
        onPressCb={getComments}
        simple
      >
        <View style={styles.infoPiece}>
          <Icon
            accessibilityLabel={"total comments (+ unread)"}
            name={"message-square"}
            size={24}
          />
          <Text>
            {`${shortenNumbers(post.counts.comments)}${
              post.unread_comments > 0
                ? `(+${shortenNumbers(post.unread_comments)})`
                : ""
            }`}
          </Text>
        </View>
      </TouchableOpacity>
      <TouchableOpacity
        style={commonStyles.touchableIcon}
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
        style={commonStyles.touchableIcon}
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
        style={commonStyles.touchableIcon}
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
