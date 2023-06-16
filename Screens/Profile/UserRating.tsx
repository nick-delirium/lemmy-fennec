import { Icon, Text } from "../../ThemedComponents";
import { View } from "react-native";
import React from "react";
import { PersonAggregates } from 'lemmy-js-client'

function UserRating({ counts }: { counts: PersonAggregates }) {
  return (
    <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
      <Icon name="plus-square" size={24} />
      <View style={{ alignItems: 'center' }}>
        <Text>
          {counts.comment_score + counts.post_score}
          {' Total Score'}
        </Text>
      </View>
      <View style={{ flexDirection: 'column', alignItems: 'center' }}>
        <Text>
          {counts.comment_score}
          {' Comment Score'}
        </Text>
      </View>
      <View style={{ flexDirection: 'column', alignItems: 'center', flexWrap: 'wrap' }}>
        <Text>
          {counts.post_score}
          {' Post Score'}
        </Text>
      </View>
    </View>
  )
}

export default UserRating;