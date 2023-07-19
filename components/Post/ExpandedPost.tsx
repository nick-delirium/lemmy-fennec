import React from "react";
import { PostView } from "lemmy-js-client";
import { useTheme } from "@react-navigation/native";
import { observer } from "mobx-react-lite";
import { View, StyleSheet, useColorScheme, Image, Share } from "react-native";
import { Text, TouchableOpacity } from "../../ThemedComponents";
import { apiClient } from "../../store/apiClient";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { makeDateString } from "../../utils/utils";
import Embed from "../../components/Post/Embed";
import PostTitle from "./PostTitle";
import PostIconRow from "./PostIconRow";
import MdRenderer from "../MdRenderer";
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
  const scheme = useColorScheme();

  const [visible, setIsVisible] = React.useState(false);
  const { colors } = useTheme();

  // flags to mark the post
  const isNsfw = post.post.nsfw || post.community.nsfw;
  const isPic = post.post.url
    ? /\.(jpeg|jpg|gif|png|webp)$/.test(post.post.url)
    : false;
  // const isLocal = post.post.local; // do I even need it?

  const maxLines = undefined;
  const safeDescription = post.post.body ? post.post.body : "";
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
    markRead();
  }, []);

  const getCommunity = () => {
    apiClient.postStore.setCommunityPosts([]);
    apiClient.communityStore.setCommunity(null);
    navigation.navigate("Community", { id: post.community.id });
  };

  const getAuthor = () => {
    navigation.navigate("User", { personId: post.creator.id });
  };

  const customReadColor = post.read ? "#ababab" : colors.text;

  const openCommenting = () => {
    if (post.post.locked) return;
    apiClient.commentsStore.setReplyTo({
      postId: post.post.id,
      parent_id: undefined,
      title: post.post.name,
      community: post.community.name,
      published: post.post.published,
      author: post.creator.name,
      content: post.post.body,
      language_id: post.post.language_id,
    });
    navigation.navigate("CommentWrite");
  };

  const shareImage = () => {
    void Share.share({
      url: post.post.url,
      message: post.post.url,
      title: "Share post image",
    });
  };
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
        getCommunity={getCommunity}
        getAuthor={getAuthor}
        dateStr={dateStr}
      />

      <Text
        customColor={customReadColor}
        lines={maxLines}
        style={styles.postName}
      >
        {post.post.name}
      </Text>

      <PostBadges isNsfw={isNsfw} post={post} />
      <View>
        {isPic ? (
          <TouchableOpacity onPressCb={() => setIsVisible(true)} simple>
            <Image
              source={{ uri: post.post.url }}
              style={styles.postImg}
              progressiveRenderingEnabled
              resizeMode={"contain"}
              alt={"Image for post" + post.post.name}
              accessibilityLabel={"Image for post" + post.post.name}
            />
          </TouchableOpacity>
        ) : null}
        {post.post.embed_title ? (
          <Embed
            embed_title={post.post.embed_title}
            embed_description={post.post.embed_description}
            url={post.post.url}
          />
        ) : null}
        <MdRenderer value={safeDescription} />
      </View>
      <PostIconRow
        post={post}
        markRead={markRead}
        getComments={openCommenting}
        useCommunity={useCommunity}
      />
    </View>
  );
}

// todo add saving

const styles = StyleSheet.create({
  container: {
    padding: 8,
    borderBottomWidth: 1,
  },
  previewButton: {
    width: "100%",
    alignItems: "center",
    padding: 12,
  },
  postName: {
    fontSize: 17,
    fontWeight: "500",
    flex: 1,
    marginTop: 4,
    marginBottom: 8,
  },
  postImg: { width: "100%", height: 340 },
});

export default observer(Post);
