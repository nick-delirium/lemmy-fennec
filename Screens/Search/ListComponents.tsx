import React from "react";
import {
  CommunityFollowerView,
  CommunityView,
  PersonView,
  PostView,
} from "lemmy-js-client";
import { Image, StyleSheet, View } from "react-native";
import { Text, TouchableOpacity } from "../../ThemedComponents";
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
    <TouchableOpacity simple onPressCb={getCommunity}>
      <View style={styles.community}>
        {sublemmy.community.icon ? (
          <Image
            source={{ uri: sublemmy.community.icon }}
            style={styles.communityIcon}
          />
        ) : null}
        <Text style={styles.communityName}>{sublemmy.community.name}</Text>
        <Text>{sublemmy.counts.subscribers} subscribers</Text>
      </View>
    </TouchableOpacity>
  );
}

export function User({
  user,
  navigation,
}: {
  user: PersonView;
  navigation: any;
}) {
  return (
    <TouchableOpacity
      simple
      onPressCb={() =>
        navigation.navigate("User", { personId: user.person.id })
      }
    >
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
    </TouchableOpacity>
  );
}

export function Post({
  post,
  navigation,
}: {
  post: PostView;
  navigation: any;
}) {
  return (
    <TouchableOpacity
      simple
      onPressCb={() => navigation.navigate("Post", { post: post.post.id })}
    >
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
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  communityIcon: { width: 24, height: 24, borderRadius: 24 },
  communityName: { color: "violet", fontSize: 16 },
  postIcon: { width: 72, height: 72 },
  community: { flexDirection: "row", alignItems: "center", gap: 8, padding: 4 },
});
