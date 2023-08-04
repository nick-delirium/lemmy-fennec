import { makeDateString } from "../utils/utils";
import { Image, StyleSheet, View } from "react-native";
import { Text } from "../ThemedComponents";
import { commonColors, commonStyles } from "../commonStyles";
import React from "react";
import MdRenderer from "./MdRenderer";
import CommunityIcon from "./CommunityIcon";

function MiniComment({
  published,
  author,
  community,
  title,
  communityPic,
  content,
  isSelf,
  useMd,
}: {
  published: string;
  author: string;
  community: string;
  communityPic?: string;
  title: string;
  content: string;
  isSelf?: boolean;
  useMd?: boolean;
}) {
  const dateStr = makeDateString(published);
  return (
    <View style={styles.comment}>
      <View style={styles.topRow}>
        <CommunityIcon communityPic={communityPic} communityName={community} />
        <View>
          <Text customColor={commonColors.community}>{community}</Text>
          {isSelf ? null : (
            <Text customColor={commonColors.author}>{author}</Text>
          )}
        </View>
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
