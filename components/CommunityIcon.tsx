import React from "react";
import { StyleSheet, View } from "react-native";

import { Image } from "expo-image";

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
