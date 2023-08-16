import React from "react";
import { Animated, FlatList, View } from "react-native";

import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { PostView } from "lemmy-js-client";
import { observer } from "mobx-react-lite";

import { Icon, TouchableOpacity } from "../../ThemedComponents";
import { commonStyles } from "../../commonStyles";
import DynamicHeader from "../../components/DynamicHeader";
import Pagination from "../../components/Pagination";
import FeedPost from "../../components/Post/FeedPost";
import TinyPost from "../../components/Post/TinyPost";
import { apiClient } from "../../store/apiClient";
import { preferences } from "../../store/preferences";
import FloatingMenu from "./FloatingMenu";

let lastOffset = 0;

function Feed({ navigation }: NativeStackScreenProps<any, "Feed">) {
  const scrollOffsetY = React.useRef(new Animated.Value(0)).current;

  const [showFab, setShowFab] = React.useState(true);
  const isFocused = navigation.isFocused();
  const listRef = React.useRef<FlatList<PostView>>(null);
  const title = React.useMemo(() => {
    return `Feed | ${apiClient.postStore.filters.type_ ?? ""} | ${
      apiClient.postStore.filters.sort.replace(/([a-z])([A-Z])/g, "$1 $2") ?? ""
    }`;
  }, [apiClient.postStore.filters.type_, apiClient.postStore.filters.sort]);

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
  const extractor = React.useCallback(
    (p: Record<string, any>) => p.post.id.toString(),
    []
  );
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
      changed.forEach((item: Record<string, any>) => {
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

  // literally no idea how exactly does this magic works here
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

  React.useEffect(() => {
    if (preferences.disableDynamicHeaders) {
      scrollOffsetY.setValue(0);
      setShowFab(true);
    }
  }, [preferences.disableDynamicHeaders]);

  return (
    <View style={commonStyles.container} key={apiClient.postStore.feedKey}>
      <DynamicHeader
        animHeaderValue={scrollOffsetY}
        title={title}
        rightAction={
          <TouchableOpacity
            style={{ marginRight: 10 }}
            simple
            onPressCb={() =>
              listRef.current?.scrollToOffset({ animated: true, offset: 0 })
            }
          >
            <Icon name={"arrow-up"} size={24} />
          </TouchableOpacity>
        }
      />

      <FlatList
        ref={listRef}
        style={{ flex: 1 }}
        renderItem={renderPost}
        data={apiClient.postStore.posts}
        onRefresh={onRefresh}
        windowSize={10}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        onScroll={onScroll}
        scrollEventThrottle={8}
        onEndReached={preferences.paginatedFeed ? undefined : onEndReached}
        refreshing={apiClient.postStore.isLoading}
        onEndReachedThreshold={preferences.paginatedFeed ? undefined : 1}
        keyExtractor={extractor}
        onViewableItemsChanged={onPostScroll}
        ListHeaderComponent={<View style={{ height: 56, width: "100%" }} />}
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
      {showFab ? <FloatingMenu /> : null}
    </View>
  );
}

export default observer(Feed);
