import React from "react";
import { Image, StyleSheet, View } from "react-native";
import { Text, TouchableOpacity } from "../../ThemedComponents";
import { PostView } from "lemmy-js-client";
import { hostname } from "../../Screens/Search/ListComponents";

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
  const isLocal = post.community.local;
  const communityName = isLocal
    ? `c/${post.community.name}`
    : `c/${post.community.name}@${hostname(post.community.actor_id)}`;

  const safeCommunityName =
    communityName.length > 50
      ? communityName.slice(0, 50) + "..."
      : communityName;

  const authorDisplayName = `u/${
    post.creator.display_name || post.creator.name
  }`;
  const safeAuthorName =
    authorDisplayName.length > 50
      ? authorDisplayName.slice(0, 50) + "..."
      : authorDisplayName;

  return (
    <View style={styles.topRow}>
      <View style={styles.communityIconContainer}>
        <TouchableOpacity simple onPressCb={getCommunity}>
          <Image
            source={{ uri: post.community.icon }}
            style={styles.communityIcon}
          />
        </TouchableOpacity>
      </View>
      <View>
        <TouchableOpacity simple onPressCb={getCommunity}>
          <Text
            lines={1}
            customColor={customReadColor}
            style={styles.communityName}
          >
            {safeCommunityName}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity simple onPressCb={getAuthor}>
          <Text customColor={customReadColor} style={styles.authorName}>
            {safeAuthorName}
          </Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.date} customColor={customReadColor}>
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
    gap: 6,
  },
  communityIconContainer: {
    backgroundColor: "#f6f6f6",
    borderRadius: 28,
    width: 28,
    height: 28,
  },
  communityIcon: { width: 28, height: 28, borderRadius: 28 },
  authorName: {
    fontSize: 13,
    fontWeight: "500",
    color: "orange",
    marginTop: 2,
  },
  date: {
    alignSelf: "flex-start",
    marginLeft: "auto",
  },
  communityName: {
    fontSize: 13,
    fontWeight: "500",
    color: "violet",
  },
  smolText: { fontSize: 12 },
});

export default PostTitle;
