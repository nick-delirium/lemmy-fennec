import React from "react";
import { Dimensions, StyleSheet, View } from "react-native";

import { useTheme } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { PostView } from "lemmy-js-client";
import { observer } from "mobx-react-lite";

import { Text, TouchableOpacity } from "../../ThemedComponents";
import { apiClient } from "../../store/apiClient";
import { makeDateString } from "../../utils/utils";
import MdRenderer from "../MdRenderer";
import Embed from "./Embed";
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
}: {
  post: PostView;
  useCommunity?: boolean;
  navigation?: NativeStackScreenProps<any, "Feed">["navigation"];
}) {
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

  const customReadColor = post.read ? "#ababab" : colors.text;
  return (
    <View style={{ ...styles.container, borderColor: colors.border }}>
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
          <Media url={post.post.url} name={post.post.name} isNsfw={isNsfw} />
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
});

export default observer(Post);
