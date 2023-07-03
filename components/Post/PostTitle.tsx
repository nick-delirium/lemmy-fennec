import React from "react";
import { Image, StyleSheet, View } from "react-native";
import { Text, TouchableOpacity } from "../../ThemedComponents";
import { PostView } from "lemmy-js-client";

interface Props {
  post: PostView;
  getCommunity: () => void;
  getAuthor: () => void;
  customReadColor?: string;
  dateStr: string;
}

function PostTitle({
  post,
  getCommunity,
  getAuthor,
  customReadColor,
  dateStr,
}: Props) {
  return (
    <View style={styles.topRow}>
      <View style={styles.communityIconContainer}>
        <Image
          source={{ uri: post.community.icon }}
          style={styles.communityIcon}
        />
      </View>
      <TouchableOpacity simple onPressCb={getCommunity}>
        <Text customColor={customReadColor} style={styles.communityName}>
          c/{post.community.name}
        </Text>
      </TouchableOpacity>
      <Text customColor={customReadColor} style={styles.smolText}>
        by
      </Text>
      <TouchableOpacity simple onPressCb={getAuthor}>
        <Text customColor={customReadColor} style={styles.authorName}>
          u/{post.creator.display_name || post.creator.name}
        </Text>
      </TouchableOpacity>
      <Text customColor={customReadColor} style={{ marginLeft: "auto" }}>
        {dateStr}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 8,
    borderBottomWidth: 1,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  communityIconContainer: {
    backgroundColor: "#f6f6f6",
    borderRadius: 24,
    width: 24,
    height: 24,
  },
  communityIcon: { width: 24, height: 24, borderRadius: 24 },
  authorName: { fontSize: 13, fontWeight: "500", color: "orange" },
  communityName: {
    fontSize: 13,
    fontWeight: "500",
    marginLeft: 4,
    color: "violet",
  },
  smolText: { fontSize: 12 },
});

export default PostTitle;
