import React from 'react'
import { observer } from "mobx-react-lite";
import { ActivityIndicator, View, FlatList, StyleSheet, TouchableOpacity, Vibration, Text } from "react-native";
import { apiClient } from "../../store/apiClient";
import Post from '../Feed/Post'
import Comment from "./Comment";
import { CommentNode } from "../../store/commentsStore";
import { useTheme, Theme } from '@react-navigation/native';

function PostScreen() {
  const post = apiClient.postStore.singlePost
  const { colors } = useTheme()

  React.useEffect(() => {
    if (apiClient.commentsStore.api) {
      void apiClient.commentsStore.getComments(post.post.id, apiClient.loginDetails)
    }
  }, [ apiClient.commentsStore.api ])

  if (!post) return (
    <ActivityIndicator />
  )

  return (
    <View>
      <CommentFlatList
        header={<Post post={post} isExpanded />}
        refreshing={apiClient.commentsStore.isLoading}
        comments={apiClient.commentsStore.commentTree}
        colors={colors}
      />
    </View>
  )
}

const CommentFlatList = observer(({ comments, header, refreshing, colors }: {
  colors: Theme['colors'],
  refreshing?: boolean,
  comments: CommentNode[],
  header?: React.ReactElement
}) => {
  const extractor = React.useCallback((c) => c.comment.id.toString(), [])
  const renderer = React.useCallback(({ item }) => (
    <CommentRenderer comment={item} colors={colors} />
  ), [])

  return (
    <FlatList
      ListHeaderComponent={header}
      data={comments}
      keyExtractor={extractor}
      renderItem={renderer}
      refreshing={refreshing}
    />
  )
})

const CommentRenderer = React.memo(({ comment, colors }: { colors: Theme['colors'], comment: CommentNode }) => {
  const [ isExpanded, setIsExpanded ] = React.useState(true)

  const ownColor = React.useMemo(() => rainbow(), [])
  const hide = () => {
    Vibration.vibrate(50)
    setIsExpanded(false);
  }
  const show = () => {
    Vibration.vibrate(50)
    setIsExpanded(true);
  }

  if (isExpanded) {
    return (
      <View>
        <Comment comment={comment} hide={comment.children.length > 0 ? hide : undefined} />
        {comment.children.length > 0 ? (
          <View style={{ ...styles.subComment, borderLeftColor: ownColor }}>
            <CommentFlatList
              colors={colors}
              comments={comment.children}
            />
          </View>
        ) : null}
      </View>
    )
  } else {
    return (
      <View>
        <Comment comment={comment} />
        <TouchableOpacity onPress={show}>
          <Text style={{ ...styles.subComment, borderLeftColor: ownColor, color: colors.primary }}>+ {comment.children.length} hidden</Text>
        </TouchableOpacity>
      </View>
    )
  }
})

function rainbow() {
  const colors = [
    '#EE4B2B',
    '#FFA500',
    '#FFFF00',
    '#008000',
    '#0000FF',
    '#3F00FF',
    '#FFC0CB',
    '#ADD8E6',
    '#191970',
    '#40E0D0',
    '#00FF00',
    '#E6E6FA',
    '#FFFFE0'
  ] as const;
  const random = Math.floor(Math.random() * colors.length);
  return colors[random];
}

const styles = StyleSheet.create({
  subComment: {
    marginLeft: 12,
    paddingLeft: 8,
    paddingTop: 2,
    borderLeftWidth: 1,
  },
})

export default observer(PostScreen)