import React from "react";
import { FlatList, View } from "react-native";

import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { PostView } from "lemmy-js-client";
import { observer } from "mobx-react-lite";

import { commonStyles } from "../../commonStyles";
import Pagination from "../../components/Pagination";
import FeedPost from "../../components/Post/FeedPost";
import TinyPost from "../../components/Post/TinyPost";
import { apiClient } from "../../store/apiClient";
import { preferences } from "../../store/preferences";

function SavedFeed({ navigation }: NativeStackScreenProps<any, "Feed">) {
  const isFocused = navigation.isFocused();
  const listRef = React.useRef<FlatList<PostView>>(null);

  React.useEffect(() => {
    const getPosts = () => {
      if (apiClient.api && apiClient.postStore.savedPosts.length === 0) {
        void apiClient.postStore.getSavedPosts();
      }
    };

    const unsubscribe = navigation.addListener("focus", () => {
      getPosts();
    });

    getPosts();
    return unsubscribe;
  }, [apiClient.api, navigation, isFocused]);

  const renderPost = React.useCallback(
    ({ item }) => {
      return preferences.compactPostLayout ? (
        <TinyPost post={item} navigation={navigation} />
      ) : (
        <FeedPost post={item} navigation={navigation} />
      );
    },
    [preferences.compactPostLayout]
  );
  const extractor = React.useCallback((p) => p.post.id.toString(), []);
  const onEndReached = React.useCallback(() => {
    if (apiClient.postStore.savedPosts.length === 0) return;
    void apiClient.postStore.changeSavedPage(
      apiClient.postStore.savedPostsPage + 1,
      !preferences.paginatedFeed
    );
  }, [apiClient.postStore.savedPosts.length]);
  const onRefresh = React.useCallback(() => {
    apiClient.postStore.setSavedPostsPage(1);
    void apiClient.postStore.getSavedPosts();
  }, []);

  // ref will be kept in memory in-between renders
  const onPostScroll = React.useRef(({ changed }) => {
    if (changed.length > 0 && apiClient.loginDetails?.jwt) {
      changed.forEach((item) => {
        if (
          !item.item.read &&
          !item.isViewable &&
          preferences.getReadOnScroll()
        ) {
          void apiClient.postStore.markPostRead({
            post_ids: [item.item.post.id],
            read: true,
          });
        }
      });
    }
  }).current;

  const nextPage = React.useCallback(() => {
    if (apiClient.postStore.savedPosts.length === 0) return;
    listRef.current.scrollToOffset({ animated: true, offset: 0 });
    void apiClient.postStore.changeSavedPage(
      apiClient.postStore.savedPostsPage + 1
    );
  }, []);
  const prevPage = React.useCallback(() => {
    if (apiClient.postStore.savedPosts.length === 0) return;
    listRef.current.scrollToOffset({ animated: true, offset: 0 });
    void apiClient.postStore.changeSavedPage(
      apiClient.postStore.savedPostsPage - 1
    );
  }, []);

  // feedKey is a hack for autoscroll
  return (
    <View style={commonStyles.container} key={apiClient.postStore.feedKey}>
      <FlatList
        ref={listRef}
        style={{ flex: 1 }}
        renderItem={renderPost}
        data={apiClient.postStore.savedPosts}
        onRefresh={onRefresh}
        windowSize={10}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        onEndReached={preferences.paginatedFeed ? undefined : onEndReached}
        refreshing={apiClient.postStore.isLoading}
        onEndReachedThreshold={preferences.paginatedFeed ? undefined : 1}
        keyExtractor={extractor}
        onViewableItemsChanged={onPostScroll}
        ListFooterComponent={
          preferences.paginatedFeed ? (
            <Pagination
              prevPage={prevPage}
              nextPage={nextPage}
              isLoading={apiClient.postStore.isLoading}
              page={apiClient.postStore.savedPostsPage}
              itemsLength={apiClient.postStore.savedPosts.length}
            />
          ) : undefined
        }
      />
    </View>
  );
}

export default observer(SavedFeed);
