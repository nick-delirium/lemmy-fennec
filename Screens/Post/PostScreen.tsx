import React from "react";
import { ActivityIndicator, Animated, View } from "react-native";

import { useTheme } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { observer } from "mobx-react-lite";

import { Icon, TouchableOpacity } from "../../ThemedComponents";
import DynamicHeader from "../../components/DynamicHeader";
import ExpandedPost from "../../components/Post/ExpandedPost";
import { apiClient } from "../../store/apiClient";
import { preferences } from "../../store/preferences";
import CommentFlatList from "./CommentsFlatlist";
import CommentsFloatingMenu from "./CommentsFloatingMenu";

let lastOffset = 0;

function PostScreen({
  navigation,
  route,
}: NativeStackScreenProps<any, "Feed">) {
  const scrollOffsetY = React.useRef(new Animated.Value(0)).current;

  const [showFab, setShowFab] = React.useState(true);
  const post = apiClient.postStore.singlePost;
  const openComment = route.params.openComment;
  const parentId = route.params.parentId;
  const { colors } = useTheme();

  const refreshAll = () => {
    void apiClient.postStore.getSinglePost(route.params.post);
    void apiClient.commentsStore.getComments(post.post.id, parentId);
  };

  React.useEffect(() => {
    if (route.params.post) {
      void apiClient.postStore.getSinglePost(route.params.post);
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
        apiClient.commentsStore.setPage(1);
        void apiClient.commentsStore.getComments(
          post.post.id,
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

  const onScroll = React.useCallback(
    (e: any) => {
      if (preferences.disableDynamicHeaders) return;
      const currentScrollY = e.nativeEvent.contentOffset.y;
      const deltaY = currentScrollY - lastOffset;
      const isGoingDown = currentScrollY > lastOffset;

      if (isGoingDown) {
        // @ts-ignore using internal value for dynamic animation
        scrollOffsetY.setValue(Math.min(scrollOffsetY._value + deltaY, 56));
      } else {
        // @ts-ignore using internal value for dynamic animation
        scrollOffsetY.setValue(Math.max(scrollOffsetY._value + deltaY, 0));
      }

      if (showFab !== !isGoingDown) setShowFab(!isGoingDown);

      lastOffset = currentScrollY;
    },
    [showFab, scrollOffsetY, preferences.disableDynamicHeaders]
  );

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
    // if (
    //   apiClient.commentsStore.comments.length >=
    //   apiClient.postStore.singlePost.counts.comments - 1
    // ) {
    //   return;
    // } else {
    //   void apiClient.commentsStore.nextPage(
    //     post.post.id,
    //     apiClient.loginDetails
    //   );
    // }
  };

  const showAllButton = Boolean(parentId);
  return (
    <View style={{ flex: 1 }}>
      <DynamicHeader
        animHeaderValue={scrollOffsetY}
        title={post.post.name || "Post"}
        leftAction={
          <TouchableOpacity
            style={{ marginLeft: 16 }}
            simple
            onPressCb={() => navigation.goBack()}
          >
            <Icon name={"arrow-left"} color={colors.text} size={24} />
          </TouchableOpacity>
        }
      />

      <CommentFlatList
        getAuthor={getAuthor}
        header={
          <ExpandedPost
            post={post}
            navigation={navigation}
            showAllButton={showAllButton}
          />
        }
        refreshing={apiClient.commentsStore.isLoading}
        comments={apiClient.commentsStore.commentTree}
        colors={colors}
        onRefresh={refreshAll}
        onEndReached={onEndReached}
        openComment={openComment}
        openCommenting={openCommenting}
        navigation={navigation}
        onScroll={onScroll}
        scrollEventThrottle={8}
        level={1}
        footer={<View style={{ height: 112, width: "100%" }} />}
      />
      {showFab ? (
        <CommentsFloatingMenu isLoading={apiClient.commentsStore.isLoading} />
      ) : null}
    </View>
  );
}

export default observer(PostScreen);
