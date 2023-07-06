import React from "react";
import { observer } from "mobx-react-lite";
import { ActivityIndicator, View } from "react-native";
import { apiClient } from "../../store/apiClient";
import ExpandedPost from "../../components/Post/ExpandedPost";
import { useTheme } from "@react-navigation/native";
import CommentsFloatingMenu from "./CommentsFloatingMenu";
import CommentFlatList from "./CommentsFlatlist";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

function PostScreen({
  navigation,
  route,
}: NativeStackScreenProps<any, "Feed">) {
  const post = apiClient.postStore.singlePost;
  const openComment = route.params.openComment;
  const { colors } = useTheme();

  React.useEffect(() => {
    if (route.params.post) {
      void apiClient.postStore.getSinglePost(
        route.params.post,
        apiClient.loginDetails
      );
    }
    return () => {
      apiClient.postStore.setSinglePost(null);
    };
  }, [route.params.post]);

  React.useEffect(() => {
    if (post && apiClient.commentsStore.comments.length === 0) {
      void apiClient.commentsStore.getComments(
        post.post.id,
        apiClient.loginDetails
      );
    }
  }, [post]);

  React.useEffect(() => {
    return () => {
      apiClient.commentsStore.setComments([]);
    };
  }, []);

  if (!post) return <ActivityIndicator />;

  const getAuthor = (id: number) => {
    navigation.navigate("User", { personId: id });
  };

  const openCommenting = () => {
    navigation.navigate("CommentWrite");
  };
  return (
    <View style={{ flex: 1 }}>
      <CommentFlatList
        getAuthor={getAuthor}
        header={<ExpandedPost post={post} navigation={navigation} />}
        refreshing={apiClient.commentsStore.isLoading}
        comments={apiClient.commentsStore.commentTree}
        colors={colors}
        openComment={openComment}
        openCommenting={openCommenting}
        footer={<View style={{ height: 72, width: "100%" }} />}
      />
      <CommentsFloatingMenu isLoading={apiClient.commentsStore.isLoading} />
    </View>
  );
}

//
// const styles = StyleSheet.create({
//   inputRow: { paddingHorizontal: 6, paddingVertical: 12, flexDirection: 'row', gap: 6 },
//   additionalButtonStyle: { justifyContent: 'center' },
// })

export default observer(PostScreen);
