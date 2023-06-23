import { Icon, Text } from "../../ThemedComponents";
import { View } from "react-native";
import React from "react";
import { PersonAggregates } from "lemmy-js-client";

function UserRating({ counts }: { counts: PersonAggregates }) {
  return (
    <View style={{ flexDirection: "row", gap: 12, alignItems: "center" }}>
      <Icon name="plus-square" size={24} />
      <View style={{ flexDirection: "column" }}>
        <Text>Score: {counts.comment_score + counts.post_score}</Text>
        <Text>
          (
          {`${counts.comment_score} from comments, ${counts.post_score} from posts`}
          )
        </Text>
      </View>
    </View>
  );
}

export default UserRating;
