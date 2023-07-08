// still empty, thinking about making mini version of a post component for mini feed where everything has set height
import React from "react";
import { View, StyleSheet, useColorScheme, Image } from "react-native";
import { Icon, Text, TouchableOpacity } from "../../ThemedComponents";
import PostTitle from "./PostTitle";
import PostIconRow from "./PostIconRow";
import { makeDateString } from "../../utils/utils";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { apiClient } from "../../store/apiClient";
import { useTheme } from "@react-navigation/native";
import { observer } from "mobx-react-lite";
import { PostView } from "lemmy-js-client";

function TinyPost({
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

  const isNsfw = post.post.nsfw || post.community.nsfw;
  const isPic = post.post.url
    ? /\.(jpeg|jpg|gif|png|webp)$/.test(post.post.url)
    : false;
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
      <View style={styles.row}>
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
              resizeMode={"cover"}
              alt={"Post image"}
              blurRadius={isNsfw && !apiClient.profileStore.unblurNsfw ? 15 : 0}
            />
          ) : (
            <View style={{ ...styles.imageLike, backgroundColor: colors.card }}>
              <Icon
                name={
                  post.post.url || post.post.embed_title ? "link" : "align-left"
                }
                size={54}
              />
            </View>
          )}
        </TouchableOpacity>
        <View style={{ flex: 1, justifyContent: "space-between" }}>
          <TouchableOpacity
            simple
            style={{ flex: 1, gap: 4 }}
            onPressCb={() => {
              apiClient.postStore.setSinglePost(post);
              navigation.navigate("Post", { post: post.post.id });
            }}
          >
            <Text
              customColor={customReadColor}
              lines={2}
              style={styles.postName}
            >
              {post.post.name}
            </Text>
          </TouchableOpacity>
          <View style={{ flexDirection: "row", gap: 4, flex: 1 }}>
            {isNsfw ? <Text style={{ color: "red" }}>NSFW</Text> : null}
            <Text lines={1} style={styles.text}>
              {post.post.body}
            </Text>
          </View>
        </View>
      </View>
      <PostIconRow
        post={post}
        useCommunity={useCommunity}
        markRead={markRead}
        getComments={getComments}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 8,
    borderBottomWidth: 1,
  },
  postName: {
    fontSize: 17,
    fontWeight: "500",
    marginTop: 4,
    marginBottom: 8,
  },
  postImg: { width: 80, height: 80, borderRadius: 8 },
  imageLike: {
    width: 80,
    height: 80,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  row: {
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 16,
  },
  text: {
    opacity: 0.8,
  },
});

export default observer(TinyPost);
