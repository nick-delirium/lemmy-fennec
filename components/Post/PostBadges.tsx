import React from "react";
import { StyleSheet, View } from "react-native";

import { PostView } from "lemmy-js-client";
import { observer } from "mobx-react-lite";

import { Icon, Text } from "../../ThemedComponents";

function PostBadges({ post, isNsfw }: { post: PostView; isNsfw?: boolean }) {
  return (
    <View style={styles.badges}>
      {post.post.featured_community || post.post.featured_local ? (
        <View style={styles.badge}>
          <Icon name={"star"} size={16} color={"orange"} />
          <Text style={styles.badgeText} customColor={"orange"}>
            Featured
          </Text>
        </View>
      ) : null}
      {isNsfw ? (
        <Text style={styles.badgeText} customColor={"red"}>
          NSFW
        </Text>
      ) : null}
      {post.post.locked ? (
        <View style={styles.badge}>
          <Icon name={"lock"} size={16} color={"red"} />
          <Text style={styles.badgeText} customColor={"red"}>
            Locked
          </Text>
        </View>
      ) : null}
      {post.saved ? (
        <View style={styles.badge}>
          <Icon name={"bookmark"} size={16} color={"green"} />
          <Text style={styles.badgeText} customColor={"green"}>
            Saved
          </Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  badges: {
    flexDirection: "row",
    gap: 8,
    alignItems: "flex-end",
    flex: 1,
    marginVertical: 4,
  },
  badgeText: { fontSize: 12, fontWeight: "500" },
  badge: { flexDirection: "row", gap: 6, alignItems: "center" },
});

export default observer(PostBadges);
