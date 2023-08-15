import React from "react";
import { FlatList, View } from "react-native";

import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { PostView } from "lemmy-js-client";
import { observer } from "mobx-react-lite";

import { Icon, TouchableOpacity } from "../../ThemedComponents";
import { commonStyles } from "../../commonStyles";
import Pagination from "../../components/Pagination";
import FeedPost from "../../components/Post/FeedPost";
import TinyPost from "../../components/Post/TinyPost";
import { apiClient } from "../../store/apiClient";
import { preferences } from "../../store/preferences";
import FloatingMenu from "./FloatingMenu";

function Feed({ navigation }: NativeStackScreenProps<any, "Feed">) {
  const isFocused = navigation.isFocused();
  const listRef = React.useRef<FlatList<PostView>>(null);

  React.useEffect(() => {
    const getPosts = () => {
      if (apiClient.api && apiClient.postStore.posts.length === 0) {
        void apiClient.postStore.getPosts(apiClient.loginDetails);
      }
    };

    const unsubscribe = navigation.addListener("focus", () => {
      getPosts();
    });

    getPosts();
    return unsubscribe;
  }, [apiClient.api, navigation, isFocused]);
  React.useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          style={{ marginRight: 10 }}
          simple
          onPressCb={() =>
            listRef.current?.scrollToOffset({ animated: true, offset: 0 })
          }
        >
          <Icon name={"arrow-up"} size={24} />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

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
    if (apiClient.postStore.posts.length === 0) return;
    void apiClient.postStore.nextPage(apiClient.loginDetails);
  }, [apiClient.postStore.posts.length]);
  const onRefresh = React.useCallback(() => {
    apiClient.postStore.setPage(1);
    void apiClient.postStore.getPosts(apiClient.loginDetails);
  }, []);

  // ref will be kept in memory in-between renders
  const onPostScroll = React.useRef(({ changed }) => {
    if (changed.length > 0 && apiClient.loginDetails?.jwt) {
      changed.forEach((item) => {
        if (!item.isViewable && preferences.getReadOnScroll()) {
          void apiClient.postStore.markPostRead({
            post_id: item.item.post.id,
            read: true,
            auth: apiClient.loginDetails.jwt,
          });
        }
      });
    }
  }).current;

  const nextPage = React.useCallback(() => {
    if (apiClient.postStore.posts.length === 0) return;
    listRef.current.scrollToOffset({ animated: true, offset: 0 });
    void apiClient.postStore.changePage(
      apiClient.postStore.page + 1,
      apiClient.loginDetails
    );
  }, []);
  const prevPage = React.useCallback(() => {
    if (apiClient.postStore.posts.length === 0) return;
    listRef.current.scrollToOffset({ animated: true, offset: 0 });
    void apiClient.postStore.changePage(
      apiClient.postStore.page - 1,
      apiClient.loginDetails
    );
  }, []);

  // feedKey is a hack for autoscroll
  return (
    <View style={commonStyles.container} key={apiClient.postStore.feedKey}>
      <FlatList
        ref={listRef}
        style={{ flex: 1 }}
        renderItem={renderPost}
        data={apiClient.postStore.posts}
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
              page={apiClient.postStore.page}
              itemsLength={apiClient.postStore.posts.length}
            />
          ) : undefined
        }
      />
      <FloatingMenu />
    </View>
  );
}

export default observer(Feed);
