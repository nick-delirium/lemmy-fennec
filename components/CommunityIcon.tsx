import React from "react";
import { Image, View, StyleSheet } from "react-native";

function CommunityIcon({
  communityPic,
  communityName,
}: {
  communityPic?: string;
  communityName: string;
}) {
  return (
    <View style={styles.iconContainer}>
      <Image
        source={{ uri: communityPic }}
        style={styles.communityIcon}
        accessibilityLabel={"Icon for community: " + communityName}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  communityIcon: { width: 28, height: 28, borderRadius: 28 },
  iconContainer: {
    width: 28,
    height: 28,
    borderRadius: 28,
    backgroundColor: "#cecece",
  },
});

export default CommunityIcon;
