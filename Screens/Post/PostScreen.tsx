import React from 'react'
import { observer } from "mobx-react-lite";
import { ActivityIndicator, View, FlatList, StyleSheet } from "react-native";
import { apiClient } from "../../store/apiClient";
import Post from '../Feed/Post'
import Comment from "./Comment";
import { CommentNode } from "../../store/commentsStore";

function PostScreen() {
  const post = apiClient.postStore.singlePost

  React.useEffect(() => {
    if (apiClient.commentsStore.api) {
      void apiClient.commentsStore.getComments(post.post.id, apiClient.loginDetails)
    }
  }, [apiClient.commentsStore.api])

  if (!post) return (
    <ActivityIndicator />
  )

  return (
    <View>
      <CommentFlatList
        header={
          <View>
            <Post post={post} />
            {apiClient.commentsStore.isLoading ? (
              <ActivityIndicator />
            ) : null}
          </View>
        }
        comments={apiClient.commentsStore.commentTree}
      />
    </View>
  )
}

const CommentFlatList = observer(({ comments, header }: { comments: CommentNode[], header?: React.ReactElement }) => {
  const extractor = React.useCallback((c) => c.comment.id.toString(), [])
  const renderer = React.useCallback(({ item }) => (
    <View>
      <Comment comment={item} />
      <View style={styles.subComment}>
        {item.children.length > 0 ? (<CommentFlatList comments={item.children} />) : null}
      </View>
    </View>
  ), [])

  return (
    <FlatList
      ListHeaderComponent={header}
      data={comments}
      keyExtractor={extractor}
      renderItem={renderer}
    />
  )
})

const styles = StyleSheet.create({
  subComment: {
    marginLeft: 8,
    borderLeftWidth: 1,
    borderLeftColor: '#f3f3f3'
  }
})

export default observer(PostScreen)