import React from "react";
import { PostView } from "lemmy-js-client";
import { useTheme } from "@react-navigation/native";
import { observer } from "mobx-react-lite";
import Markdown from "react-native-marked";
import { View, StyleSheet, useColorScheme, Image } from "react-native";
import { Text, TouchableOpacity } from "../../ThemedComponents";
import { mdTheme } from "../../commonStyles";
import { apiClient } from "../../store/apiClient";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { makeDateString } from "../../utils/utils";
import Embed from "./Embed";
import PostTitle from "./PostTitle";
import PostIconRow from "./PostIconRow";

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
  const sch = useColorScheme();

  // flags to mark the post
  const isNsfw = post.post.nsfw || post.community.nsfw;
  const isPic = post.post.url
    ? /\.(jpeg|jpg|gif|png)$/.test(post.post.url)
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

  const customReadColor = post.read ? "#ababab" : colors.text;
  return (
    <View style={{ ...styles.container, borderColor: colors.border }}>
      <PostTitle
        post={post}
        dateStr={dateStr}
        getAuthor={getAuthor}
        getCommunity={getCommunity}
      />
      {isNsfw ? <Text style={{ color: "red", marginTop: 8 }}>NSFW</Text> : null}
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
      <PostIconRow
        post={post}
        useCommunity={useCommunity}
        markRead={markRead}
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
  postName: {
    fontSize: 16,
    marginTop: 4,
    marginBottom: 8,
  },
  postImg: { width: "100%", height: 340 },
});

export default observer(Post);
