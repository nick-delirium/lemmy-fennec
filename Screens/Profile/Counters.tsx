import { PersonView } from "lemmy-js-client";
import React from "react";
import { StyleSheet, View } from "react-native";
import { Icon, Text as ThemedText } from "../../ThemedComponents";

function Counters({ profile }: { profile: PersonView }) {
  return (
    <View style={styles.row}>
      <Icon size={24} name={"edit"} />
      <View>
        <ThemedText>Comments: {profile.counts.comment_count}</ThemedText>
        <ThemedText>Posts: {profile.counts.post_count}</ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
});

export default Counters;
