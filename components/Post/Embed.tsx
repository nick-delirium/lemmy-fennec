import React from "react";
import { View, StyleSheet, Linking } from "react-native";
import { Text, TouchableOpacity } from "../../ThemedComponents";
import { useTheme } from "@react-navigation/native";

interface Props {
  embed_description?: string;
  embed_title?: string;
  embed_video_url?: string | null;
  url?: string;
}

function Embed({
  embed_description,
  embed_title,
  embed_video_url,
  url,
}: Props) {
  const { colors } = useTheme();

  const openUrl = () => {
    void Linking.openURL(url);
  };
  return (
    <TouchableOpacity simple onPressCb={openUrl}>
      <View style={{ ...styles.container, borderColor: colors.border }}>
        {embed_title ? <Text style={styles.title}>{embed_title}</Text> : null}
        {embed_description ? <Text lines={3}>{embed_description}</Text> : null}
        {url ? (
          <Text lines={1} style={styles.link}>
            {url}
          </Text>
        ) : null}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: 6,
    padding: 6,
  },
  title: { fontWeight: "500", fontSize: 16 },
  link: { opacity: 0.7, marginLeft: "auto" },
});

export default Embed;
