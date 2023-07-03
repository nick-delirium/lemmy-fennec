import React from "react";
import { StyleSheet, useColorScheme, View } from "react-native";
import Markdown from "react-native-marked";
import { mdTheme } from "../../commonStyles";
import { Icon } from "../../ThemedComponents";
import { PersonView } from "lemmy-js-client";
import { useTheme } from "@react-navigation/native";

function Bio({ profile }: { profile: PersonView }) {
  const sch = useColorScheme();
  const { colors } = useTheme();
  return profile.person.bio ? (
    <View style={styles.longRow}>
      <Icon name={"edit"} size={24} style={{ marginTop: 8 }} />
      <Markdown
        styles={{
          text: { fontSize: 14, color: colors.text },
        }}
        value={profile.person.bio}
        theme={{ colors: sch === "dark" ? mdTheme.dark : mdTheme.light }}
      />
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
