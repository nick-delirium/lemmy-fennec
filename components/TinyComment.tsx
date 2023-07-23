import { makeDateString } from "../utils/utils";
import { StyleSheet, View } from "react-native";
import { Text } from "../ThemedComponents";
import { commonColors, commonStyles } from "../commonStyles";
import React from "react";
import MdRenderer from "./MdRenderer";

function MiniComment({
  published,
  author,
  community,
  title,
  content,
  isSelf,
  useMd,
}: {
  published: string;
  author: string;
  community: string;
  title: string;
  content: string;
  isSelf?: boolean;
  useMd?: boolean;
}) {
  const dateStr = makeDateString(published);
  return (
    <View style={styles.comment}>
      <View style={styles.topRow}>
        {isSelf ? null : (
          <Text customColor={commonColors.author}>{author}</Text>
        )}
        <Text>in</Text>
        <Text customColor={commonColors.community}>{community}</Text>
        <Text style={{ marginLeft: "auto" }}>{dateStr}</Text>
      </View>
      <View>
        <Text lines={2} style={commonStyles.title}>
          {title}
        </Text>
        {content ? (
          useMd ? (
            <MdRenderer value={content} />
          ) : (
            <Text lines={4} style={commonStyles.text}>
              {content}
            </Text>
          )
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  comment: {
    paddingVertical: 8,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
});

export default MiniComment;
