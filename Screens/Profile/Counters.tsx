import React from "react";
import { StyleSheet, View } from "react-native";

import { PersonView } from "lemmy-js-client";

import { Icon, Text as ThemedText } from "../../ThemedComponents";

function Counters({ profile }: { profile: PersonView }) {
  return (
    <View style={styles.row}>
      <Icon size={24} name={"align-left"} />
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
