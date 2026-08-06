import React from "react";
import { Animated, FlatList, View } from "react-native";

import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { PostView } from "lemmy-js-client";
import { observer } from "mobx-react-lite";

import { Icon, TouchableOpacity } from "../../ThemedComponents";
import { commonStyles } from "../../commonStyles";
import DynamicHeader, { useHeaderOffset } from "../../components/DynamicHeader";
import Pagination from "../../components/Pagination";
import FeedPost from "../../components/Post/FeedPost";
import TinyPost from "../../components/Post/TinyPost";
import { apiClient } from "../../store/apiClient";
import { preferences } from "../../store/preferences";
import FloatingMenu from "./FloatingMenu";

function Feed({ navigation }: NativeStackScreenProps<any, "Feed">) {
  const scrollOffsetY = React.useRef(new Animated.Value(0)).current;
  const headerOffset = useHeaderOffset();
  // per-mount, not module-level: a shared value leaked the previous screen's
  // scroll position into the header animation on remount
  const lastOffset = React.useRef(0);

  const [showFab, setShowFab] = React.useState(true);
  const isFocused = navigation.isFocused();
  const listRef = React.useRef<FlatList<PostView>>(null);
  const title = React.useMemo(() => {
    const { type_, sort } = apiClient.postStore.filters;
    // `sort.replace(...) ?? ""` threw on an undefined sort — the ?? applied to
    // the result of the call, not to `sort`
    const spacedSort = sort?.replace(/([a-z])([A-Z])/g, "$1 $2") ?? "";
    return `Feed | ${type_ ?? ""} | ${spacedSort}`;
  }, [apiClient.postStore.filters.type_, apiClient.postStore.filters.sort]);

  React.useEffect(() => {
    const getPosts = () => {
      if (apiClient.api && apiClient.postStore.posts.length === 0) {
        void apiClient.postStore.getPosts();
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
    [preferences.compactPostLayout],
  );
  const extractor = React.useCallback(
    (p: Record<string, any>) => p.post.id.toString(),
    [],
  );
  const onEndReached = React.useCallback(() => {
    if (apiClient.postStore.posts.length === 0) return;
    void apiClient.postStore.nextPage();
  }, [apiClient.postStore.posts.length]);
  const onRefresh = React.useCallback(() => {
    apiClient.postStore.setPage(1);
    void apiClient.postStore.getPosts();
  }, []);

  // ref will be kept in memory in-between renders
  const onPostScroll = React.useRef(({ changed }) => {
    if (changed.length > 0 && apiClient.loginDetails?.jwt) {
      changed.forEach((item: Record<string, any>) => {
        if (!item.isViewable && preferences.getReadOnScroll()) {
          void apiClient.postStore.markPostRead({
            post_ids: [item.item.post.id],
            read: true,
          });
        }
      });
    }
  }).current;

  const nextPage = React.useCallback(() => {
    if (apiClient.postStore.posts.length === 0) return;
    listRef.current.scrollToOffset({ animated: true, offset: 0 });
    void apiClient.postStore.changePage(apiClient.postStore.page + 1);
  }, []);
  const prevPage = React.useCallback(() => {
    if (apiClient.postStore.posts.length === 0) return;
    listRef.current.scrollToOffset({ animated: true, offset: 0 });
    void apiClient.postStore.changePage(apiClient.postStore.page - 1);
  }, []);

  // literally no idea how exactly does this magic works here
  const onScroll = React.useCallback(
    (e: any) => {
      if (preferences.disableDynamicHeaders) return;
      const currentScrollY = e.nativeEvent.contentOffset.y;

      // ios rubber-banding reports negative offsets past the top, and feeding
      // those deltas in scrolled the header away exactly when the list was at
      // rest at the top. At or above the top the header is always fully shown.
      if (currentScrollY <= 0) {
        scrollOffsetY.setValue(0);
        if (!showFab) setShowFab(true);
        lastOffset.current = 0;
        return;
      }

      const deltaY = currentScrollY - lastOffset.current;
      const isGoingDown = currentScrollY > lastOffset.current;

      if (isGoingDown) {
        // @ts-ignore using internal value for dynamic animation
        scrollOffsetY.setValue(Math.min(scrollOffsetY._value + deltaY, 56));
      } else {
        // @ts-ignore using internal value for dynamic animation
        scrollOffsetY.setValue(Math.max(scrollOffsetY._value + deltaY, 0));
      }

      if (showFab !== !isGoingDown) setShowFab(!isGoingDown);

      lastOffset.current = currentScrollY;
    },
    [showFab, scrollOffsetY, preferences.disableDynamicHeaders],
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
        ListHeaderComponent={
          <View style={{ height: headerOffset, width: "100%" }} />
        }
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
