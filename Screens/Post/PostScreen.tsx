import React from "react";
import { observer } from "mobx-react-lite";
import { ActivityIndicator, View } from "react-native";
import { apiClient, ReportMode } from "../../store/apiClient";
import ExpandedPost from "../../components/Post/ExpandedPost";
import { useTheme } from "@react-navigation/native";
import CommentsFloatingMenu from "./CommentsFloatingMenu";
import CommentFlatList from "./CommentsFlatlist";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import Prompt from "../../components/Prompt";

function PostScreen({
  navigation,
  route,
}: NativeStackScreenProps<any, "Feed">) {
  const post = apiClient.postStore.singlePost;
  const openComment = route.params.openComment;
  const parentId = route.params.parentId;
  const { colors } = useTheme();

  const refreshAll = () => {
    void apiClient.postStore.getSinglePost(
      route.params.post,
      apiClient.loginDetails
    );
    void apiClient.commentsStore.getComments(
      post.post.id,
      apiClient.loginDetails,
      parentId
    );
  };

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
    if (post) {
      if (
        post.counts.comments > 0
        // apiClient.commentsStore.comments.length === 0
      ) {
        console.log("fetching parent", parentId);
        apiClient.commentsStore.setPage(1);
        void apiClient.commentsStore.getComments(
          post.post.id,
          apiClient.loginDetails,
          parentId,
          Boolean(parentId)
        );
      }
    }
  }, [post]);

  React.useEffect(() => {
    return () => {
      apiClient.commentsStore.setPage(1);
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

  const onEndReached = () => {
    // I'm fairly sure that they return everything at the moment, no matter the limit/page.
    return console.log("endreached", apiClient.commentsStore.comments.length);
    if (
      apiClient.commentsStore.comments.length >=
      apiClient.postStore.singlePost.counts.comments - 1
    ) {
      return;
    } else {
      void apiClient.commentsStore.nextPage(
        post.post.id,
        apiClient.loginDetails
      );
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <CommentFlatList
        getAuthor={getAuthor}
        header={<ExpandedPost post={post} navigation={navigation} />}
        refreshing={apiClient.commentsStore.isLoading}
        comments={apiClient.commentsStore.commentTree}
        colors={colors}
        onRefresh={refreshAll}
        onEndReached={onEndReached}
        openComment={openComment}
        openCommenting={openCommenting}
        level={1}
        footer={<View style={{ height: 72, width: "100%" }} />}
      />
      <CommentsFloatingMenu isLoading={apiClient.commentsStore.isLoading} />
    </View>
  );
}

export default observer(PostScreen);
