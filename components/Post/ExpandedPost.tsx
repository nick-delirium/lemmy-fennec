import React from "react";
import { StyleSheet, View } from "react-native";

import { useTheme } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { PostView } from "lemmy-js-client";
import { observer } from "mobx-react-lite";

import { Text, TouchableOpacity } from "../../ThemedComponents";
import Embed from "../../components/Post/Embed";
import { apiClient } from "../../store/apiClient";
import { makeDateString } from "../../utils/utils";
import MdRenderer from "../MdRenderer";
import Media from "./Media";
import PostBadges from "./PostBadges";
import PostIconRow from "./PostIconRow";
import PostTitle from "./PostTitle";

// !!!TODO!!!
// 1. split stuff into components
// 2. research performance
// 3. see how I can force max lines on markdown

function Post({
  post,
  navigation,
  useCommunity,
  showAllButton,
}: {
  post: PostView;
  useCommunity?: boolean;
  showAllButton?: boolean;
  navigation?: NativeStackScreenProps<any, "Feed">["navigation"];
}) {
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
      content: post.post.body || post.post.url,
      language_id: post.post.language_id,
    });
    navigation.navigate("CommentWrite");
  };

  return (
    <>
      <View style={{ ...styles.container, borderColor: colors.border }}>
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
            <Media url={post.post.url} name={post.post.name} isNsfw={isNsfw} />
          ) : null}
          {post.post.url || post.post.embed_title ? (
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
      {showAllButton ? (
        <TouchableOpacity
          onPressCb={() => {
            navigation.setParams({ post: post.post.id, parentId: undefined });
            void apiClient.commentsStore.getComments(
              post.post.id,
              apiClient.loginDetails
            );
          }}
          simple
        >
          <Text
            style={{
              padding: 8,
              color: colors.primary,
              backgroundColor: colors.card,
              fontSize: 16,
            }}
          >
            Show all {post.counts.comments} comments
          </Text>
        </TouchableOpacity>
      ) : null}
    </>
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
