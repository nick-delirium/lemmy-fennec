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
import Embed from "../../components/Post/Embed";
import PostTitle from "./PostTitle";
import PostIconRow from "./PostIconRow";
import ImageView from "react-native-image-viewing";

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
  const sch = useColorScheme();

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
    apiClient.commentsStore.setReplyTo({
      postId: post.post.id,
      parent_id: undefined,
      title: post.post.name,
      community: post.community.name,
      published: post.post.published,
      author: post.creator.name,
      content: post.post.body,
    });
    navigation.navigate("CommentWrite");
  };
  return (
    <View style={{ ...styles.container, borderColor: colors.border }}>
      <ImageView
        images={[{ uri: post.post.url }]}
        imageIndex={0}
        visible={visible}
        onRequestClose={() => setIsVisible(false)}
        HeaderComponent={() => (
          <View style={{ ...styles.imgHeader, backgroundColor: colors.card }}>
            <Text style={{ fontSize: 16 }}>{post.post.name}</Text>
          </View>
        )}
      />
      <PostTitle
        post={post}
        getCommunity={getCommunity}
        getAuthor={getAuthor}
        dateStr={dateStr}
      />
      {isNsfw ? <Text style={{ color: "red", marginTop: 8 }}>NSFW</Text> : null}

      <Text
        customColor={customReadColor}
        lines={maxLines}
        style={styles.postName}
      >
        {post.post.name}
      </Text>
      <View>
        {isPic ? (
          <View>
            <TouchableOpacity onPressCb={() => setIsVisible(true)} simple>
              <Image
                source={{ uri: post.post.url }}
                style={styles.postImg}
                progressiveRenderingEnabled
                resizeMode={"contain"}
                alt={"Post image"}
                blurRadius={
                  isNsfw && !apiClient.profileStore.unblurNsfw ? 15 : 0
                }
              />
            </TouchableOpacity>
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
    fontSize: 16,
    marginTop: 4,
    marginBottom: 8,
  },
  postImg: { width: "100%", height: 340 },
  imgHeader: { padding: 12, justifyContent: "center", alignItems: "center" },
});

export default observer(Post);
