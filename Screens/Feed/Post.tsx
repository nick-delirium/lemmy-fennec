import React from "react";
import { PostView } from "lemmy-js-client";
import { useTheme } from "@react-navigation/native";
import { observer } from "mobx-react-lite";
import Markdown from "react-native-marked";
import {
  View,
  StyleSheet,
  Platform,
  useColorScheme,
  Image,
  Vibration,
  Share,
  Dimensions,
} from "react-native";
import { Text, Icon, TouchableOpacity } from "../../ThemedComponents";
import { mdTheme, commonColors } from "../../commonStyles";
import { Score, apiClient } from "../../store/apiClient";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { makeDateString } from "../../utils/utils";
import Embed from "./Embed";

// !!!TODO!!!
// 1. split stuff into components
// 2. research performance
// 3. see how I can force max lines on markdown
function Post({
  post,
  isExpanded,
  navigation,
  useCommunity,
}: {
  post: PostView;
  isExpanded?: boolean;
  useCommunity?: boolean;
  navigation?: NativeStackScreenProps<any, "Feed">["navigation"];
}) {
  const [imgDimensions, setImgDimensions] = React.useState({
    width: 0,
    height: 0,
  });

  const [isFullImg, setIsFullImg] = React.useState(false);
  const { colors } = useTheme();
  const sch = useColorScheme();

  // flags to mark the post
  const isNsfw = post.post.nsfw || post.community.nsfw;
  const isPic = post.post.url
    ? /\.(jpeg|jpg|gif|png)$/.test(post.post.url)
    : false;
  // const isLocal = post.post.local; // do I even need it?

  const maxLines = isExpanded ? undefined : 3;
  const safeDescription = post.post.body
    ? isExpanded
      ? post.post.body
      : post.post.body.slice(0, 500)
    : "";
  const dateStr = makeDateString(post.post.published);

  const markRead = () => {
    if (apiClient.loginDetails?.jwt) {
      void apiClient.postStore.markPostRead(
        {
          post_id: post.post.id,
          read: true,
          auth: apiClient.loginDetails.jwt,
        },
        useCommunity
      );
    }
  };
  React.useEffect(() => {
    if (isExpanded) markRead();
    if (isPic && isExpanded) {
      Image.getSize(post.post.url, (picWidth, picHeight) => {
        const { width } = Dimensions.get("window");
        const safeHeight = (width / picWidth) * picHeight;

        setImgDimensions({ width, height: safeHeight });
      });
    }
  }, [isPic, isExpanded]);

  const getCommunity = () => {
    apiClient.postStore.setCommunityPosts([]);
    apiClient.communityStore.setCommunity(null);
    navigation.navigate("Community", { id: post.community.id });
  };

  const getAuthor = () => {
    navigation.navigate("User", { personId: post.creator.id });
  };

  const customReadColor = post.read ? "#ababab" : colors.text;
  return (
    <View style={{ ...styles.container, borderColor: colors.border }}>
      <View style={styles.topRow}>
        <View style={styles.communityIconContainer}>
          <Image
            source={{ uri: post.community.icon }}
            style={styles.communityIcon}
          />
        </View>
        <TouchableOpacity simple onPressCb={getCommunity}>
          <Text customColor={customReadColor} style={styles.communityName}>
            c/{post.community.name}
          </Text>
        </TouchableOpacity>
        <Text customColor={customReadColor} style={styles.smolText}>
          by
        </Text>
        <TouchableOpacity simple onPressCb={getAuthor}>
          <Text customColor={customReadColor} style={styles.authorName}>
            u/{post.creator.display_name || post.creator.name}
          </Text>
        </TouchableOpacity>
        <Text customColor={customReadColor} style={{ marginLeft: "auto" }}>
          {dateStr}
        </Text>
      </View>
      {isNsfw ? <Text style={{ color: "red", marginTop: 8 }}>NSFW</Text> : null}
      {!isExpanded ? (
        <TouchableOpacity
          simple
          onPressCb={() => {
            apiClient.postStore.setSinglePost(post);
            navigation.navigate("Post", { post: post.post.id });
          }}
        >
          <Text
            customColor={customReadColor}
            lines={maxLines}
            style={styles.postName}
          >
            {post.post.name}
          </Text>
        </TouchableOpacity>
      ) : (
        <Text
          customColor={customReadColor}
          lines={maxLines}
          style={styles.postName}
        >
          {post.post.name}
        </Text>
      )}
      {!isExpanded ? (
        <TouchableOpacity
          simple
          onPressCb={() => {
            apiClient.postStore.setSinglePost(post);
            navigation.navigate("Post", { post: post.post.id });
          }}
        >
          {isPic ? (
            <Image
              source={{ uri: post.post.url }}
              style={styles.postImg}
              progressiveRenderingEnabled
              resizeMode={"contain"}
              alt={"Post image"}
              blurRadius={isNsfw && !apiClient.profileStore.unblurNsfw ? 15 : 0}
            />
          ) : (
            <View style={{ maxHeight: 200, overflow: "hidden" }}>
              {post.post.url || post.post.embed_title ? (
                <Embed
                  embed_title={post.post.embed_title}
                  embed_description={post.post.embed_description}
                  url={post.post.url}
                />
              ) : null}
              <Markdown
                value={safeDescription}
                theme={{
                  colors: sch === "dark" ? mdTheme.dark : mdTheme.light,
                }}
              />
            </View>
          )}
        </TouchableOpacity>
      ) : (
        <View>
          {isPic ? (
            <View>
              <View
                style={{
                  maxHeight: isFullImg ? undefined : 720,
                  overflow: "hidden",
                }}
              >
                <Image
                  source={{ uri: post.post.url }}
                  style={{ width: "100%", height: imgDimensions.height }}
                  progressiveRenderingEnabled
                  resizeMode={"contain"}
                  alt={"Post image"}
                />
              </View>
              {isFullImg || imgDimensions.height <= 720 ? null : (
                <TouchableOpacity
                  simple
                  style={styles.previewButton}
                  onPressCb={() => setIsFullImg(true)}
                >
                  <Text>Show full image</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : null}
          {post.post.embed_title ? (
            <Embed
              embed_title={post.post.embed_title}
              embed_description={post.post.embed_description}
              url={post.post.url}
            />
          ) : null}
          <Markdown
            value={safeDescription}
            theme={{ colors: sch === "dark" ? mdTheme.dark : mdTheme.light }}
          />
        </View>
      )}
      <View
        style={{
          ...styles.iconsRow,
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
          />
          <Text
            customColor={
              !post.my_vote
                ? undefined
                : post.my_vote === 1
                ? commonColors.upvote
                : commonColors.downvote
            }
          >
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
    </View>
  );
}

// todo add saving

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
  iconsRow: {
    gap: 12,
    alignItems: "center",
    paddingTop: 8,
    paddingBottom: 8,
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

export default observer(Post);
