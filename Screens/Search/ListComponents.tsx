import React from "react";
import { CommunityView, PersonView, PostView } from "lemmy-js-client";
import { Image, StyleSheet, View, Pressable } from "react-native";
import { Text } from "../../ThemedComponents";
import { makeDateString } from "../../utils/utils";
import { apiClient } from "../../store/apiClient";

export function Community({
  sublemmy,
  navigation,
}: {
  sublemmy: CommunityView;
  navigation: any;
}) {
  const getCommunity = () => {
    apiClient.postStore.setCommunityPosts([]);
    apiClient.communityStore.setCommunity(null);
    navigation.navigate("Community", { id: sublemmy.community.id });
  };
  return (
    <View style={styles.community}>
      {sublemmy.community.icon ? (
        <Image
          source={{ uri: sublemmy.community.icon }}
          style={styles.communityIcon}
        />
      ) : null}
      <Pressable onPress={getCommunity}>
        <Text style={{ color: "violet" }}>{sublemmy.community.name}</Text>
      </Pressable>
      <Text>{sublemmy.counts.subscribers} subscribers</Text>
    </View>
  );
}

export function User({ user }: { user: PersonView }) {
  return (
    <View style={styles.community}>
      {user.person.avatar ? (
        <Image
          source={{ uri: user.person.avatar }}
          style={styles.communityIcon}
        />
      ) : null}
      <Text style={{ color: "orange" }}>{user.person.name}</Text>
      <Text>{user.counts.post_score + user.counts.comment_score} score</Text>
      <Text>{user.counts.comment_count} comments</Text>
    </View>
  );
}

export function Post({ post }: { post: PostView }) {
  return (
    <View style={styles.community}>
      {post.post.thumbnail_url ? (
        <Image
          source={{ uri: post.post.thumbnail_url }}
          style={styles.postIcon}
        />
      ) : null}
      <View style={{ flexDirection: "column", gap: 6 }}>
        <Text style={{ fontWeight: "500", fontSize: 16 }}>
          {post.post.name}
        </Text>
        <View style={{ flexDirection: "row", gap: 6 }}>
          <Text style={{ color: "orange" }}>{post.creator.name}</Text>
          <Text style={{ color: "violet" }}>in {post.community.name}</Text>
          <Text>{makeDateString(post.post.published)}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  communityIcon: { width: 24, height: 24, borderRadius: 24 },
  postIcon: { width: 72, height: 72 },
  community: { flexDirection: "row", alignItems: "center", gap: 8, padding: 4 },
});
