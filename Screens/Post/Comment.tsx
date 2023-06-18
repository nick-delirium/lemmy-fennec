import React from 'react'
import { observer } from "mobx-react-lite";
import { ActivityIndicator, View, FlatList } from "react-native";
import { apiClient } from "../../store/apiClient";
import Post from '../Feed/Post'
import { Text } from '../../ThemedComponents'
import { CommentNode } from "../../store/commentsStore";

function Comment({ comment }: { comment: CommentNode }) {
  return (
    <View>
      <View>
        <Text>{comment.creator.display_name || comment.creator.name}</Text>
        <Text>
          {comment.comment.published}
        </Text>
      </View>
      <View>
        <Text>
          {comment.comment.content}
        </Text>
      </View>
      <View>
        <Text>
          {comment.counts.score}
        </Text>
      </View>
    </View>
  )
}

export default observer(Comment)