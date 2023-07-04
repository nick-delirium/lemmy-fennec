import React from "react";
import { Linking, StyleSheet, useColorScheme, View } from "react-native";
import Markdown, { Renderer } from "react-native-marked";
import { mdTheme } from "../../commonStyles";
import { Icon, TouchableOpacity } from "../../ThemedComponents";
import { PersonView } from "lemmy-js-client";
import { useTheme } from "@react-navigation/native";
import { Text } from "../../ThemedComponents";
import { SvgFromUri, SvgUri } from "react-native-svg";

class CustomRenderer extends Renderer {
  constructor() {
    super();
  }

  linkImage(href: string, imageUrl: string, alt?: string, style?: any) {
    if (imageUrl.endsWith(".svg")) {
      return (
        <TouchableOpacity
          key={this.getKey()}
          style={{ ...style, width: "100%" }}
          onPressCb={() => Linking.openURL(href)}
        >
          <Text>{alt}</Text>
        </TouchableOpacity>
      );
    } else {
      return super.linkImage(href, imageUrl, alt, style);
    }
  }
}

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
        renderer={new CustomRenderer()}
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
