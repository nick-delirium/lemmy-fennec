import React from "react";
import { StyleSheet, View } from "react-native";
import { Icon } from "../../ThemedComponents";
import { PersonView } from "lemmy-js-client";
import MdRenderer from "../../components/MdRenderer";

function Bio({ profile }: { profile: PersonView }) {
  return profile.person.bio ? (
    <View style={styles.longRow}>
      <Icon name={"edit"} size={24} style={{ marginTop: 8 }} />
      <MdRenderer value={profile.person.bio} />
    </View>
  ) : null;
}

const styles = StyleSheet.create({
  container: {
    padding: 12,
    gap: 12,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  longRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    width: "100%",
  },
});

export default Bio;
