import React from "react";
import { PostView } from "lemmy-js-client";
import { useTheme } from "@react-navigation/native";
import { observer } from "mobx-react-lite";
import { View, StyleSheet, Image, Dimensions, Share } from "react-native";
import { Text, TouchableOpacity } from "../../ThemedComponents";
import { apiClient } from "../../store/apiClient";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { makeDateString } from "../../utils/utils";
import Embed from "./Embed";
import PostTitle from "./PostTitle";
import PostIconRow from "./PostIconRow";
import MdRenderer from "../MdRenderer";
import { preferences } from "../../store/preferences";
import ImageViewer from "./ImageViewer";
import PostBadges from "./PostBadges";

// !!!TODO!!!
// 1. split stuff into components
// 2. research performance
// 3. see how I can force max lines on markdown
function Post({
  post,
  navigation,
  useCommunity,
}: {
  post: PostView;
  useCommunity?: boolean;
  navigation?: NativeStackScreenProps<any, "Feed">["navigation"];
}) {
  const [visible, setIsVisible] = React.useState(false);
  const { colors } = useTheme();

  // flags to mark the post
  const isNsfw = post.post.nsfw || post.community.nsfw;
  const isPic = post.post.url
    ? /\.(jpeg|jpg|gif|png|webp)$/.test(post.post.url)
    : false;
  // const isLocal = post.post.local; // do I even need it?

  const maxLines = 3;
  const safeDescription = post.post.body ? post.post.body.slice(0, 500) : "";
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

  const getCommunity = () => {
    apiClient.postStore.setCommunityPosts([]);
    apiClient.communityStore.setCommunity(null);
    navigation.navigate("Community", { id: post.community.id });
  };

  const getAuthor = () => {
    navigation.navigate("User", { personId: post.creator.id });
  };

  const getComments = () => {
    apiClient.postStore.setSinglePost(post);
    navigation.navigate("Post", { post: post.post.id, openComment: 0 });
  };

  const shareImage = () => {
    void Share.share({
      url: post.post.url,
      message: post.post.url,
      title: "Share post image",
    });
  };

  const customReadColor = post.read ? "#ababab" : colors.text;
  return (
    <View style={{ ...styles.container, borderColor: colors.border }}>
      {isPic ? (
        <ImageViewer
          url={post.post.url}
          name={post.post.name}
          visible={visible}
          setIsVisible={setIsVisible}
          shareImage={shareImage}
        />
      ) : null}
      <PostTitle
        post={post}
        dateStr={dateStr}
        getAuthor={getAuthor}
        getCommunity={getCommunity}
      />
      <TouchableOpacity
        simple
        still
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
      <PostBadges isNsfw={isNsfw} post={post} />
      <TouchableOpacity
        simple
        still
        onPressCb={() => {
          apiClient.postStore.setSinglePost(post);
          navigation.navigate("Post", { post: post.post.id });
        }}
      >
        {isPic ? (
          <TouchableOpacity onPressCb={() => setIsVisible(true)} simple>
            <Image
              source={{ uri: post.post.url }}
              style={styles.postImg}
              progressiveRenderingEnabled
              resizeMode={"contain"}
              alt={"Image for post" + post.post.name}
              accessibilityLabel={"Image for post" + post.post.name}
              blurRadius={isNsfw && !preferences.unblurNsfw ? 55 : 0}
            />
          </TouchableOpacity>
        ) : (
          <View style={{ maxHeight: 200, overflow: "hidden" }}>
            {post.post.url || post.post.embed_title ? (
              <Embed
                embed_title={post.post.embed_title}
                embed_description={post.post.embed_description}
                url={post.post.url}
              />
            ) : null}
            <MdRenderer value={safeDescription} />
          </View>
        )}
      </TouchableOpacity>
      <PostIconRow
        post={post}
        useCommunity={useCommunity}
        markRead={markRead}
        getComments={getComments}
      />
    </View>
  );
}

// todo add saving

const styles = StyleSheet.create({
  container: {
    padding: 8,
    width: Dimensions.get("window").width,
    borderBottomWidth: 1,
  },
  postName: {
    fontSize: 17,
    fontWeight: "500",
    marginTop: 4,
    marginBottom: 8,
  },
  postImg: { width: "100%", height: 340 },
});

export default observer(Post);
