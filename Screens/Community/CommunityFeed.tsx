import React from "react";
import { FlatList, StyleSheet, View } from "react-native";

import { PostView } from "lemmy-js-client";
import { observer } from "mobx-react-lite";

import { Icon, Text, TouchableOpacity } from "../../ThemedComponents";
import { commonStyles } from "../../commonStyles";
import FeedPost from "../../components/Post/FeedPost";
import TinyPost from "../../components/Post/TinyPost";
import { apiClient } from "../../store/apiClient";
import { preferences } from "../../store/preferences";
import FloatingMenu from "../Feed/FloatingMenu";

function CommunityFeed({ navigation }: { navigation: any }) {
  const { community } = apiClient.communityStore;
  const listRef = React.useRef<FlatList<PostView>>(null);

  React.useEffect(() => {
    if (navigation && listRef.current) {
      const scrollUp = () =>
        listRef.current.scrollToOffset({ animated: true, offset: 0 });

      navigation.getParent().setOptions({
        headerRight: () => (
          <TouchableOpacity
            style={{ marginRight: 10 }}
            simple
            onPressCb={scrollUp}
          >
            <Icon name={"arrow-up"} size={24} />
          </TouchableOpacity>
        ),
      });
    }
  }, [navigation, listRef.current]);

  const renderPost = React.useCallback(
    ({ item }) => {
      return preferences.compactPostLayout ? (
        // @ts-ignore
        <TinyPost post={item} navigation={navigation} useCommunity />
      ) : (
        // @ts-ignore
        <FeedPost post={item} navigation={navigation} useCommunity />
      );
    },
    [preferences.compactPostLayout]
  );
  const extractor = React.useCallback((p) => p.post.id.toString(), []);
  const onEndReached = React.useCallback(() => {
    if (apiClient.postStore.posts.length === 0) return;
    void apiClient.postStore.nextPage(community.community.id);
  }, [community]);
  const onRefresh = React.useCallback(() => {
    apiClient.postStore.setCommPage(1);
    void apiClient.postStore.getPosts(community.community.id);
  }, [community]);

  const onPostScroll = React.useRef(({ changed }) => {
    if (changed.length > 0 && apiClient.loginDetails?.jwt) {
      changed.forEach((item) => {
        if (!item.isViewable && preferences.getReadOnScroll()) {
          void apiClient.postStore.markPostRead({
            post_ids: [item.item.post.id],
            read: true,
          });
        }
      });
    }
  }).current;

  const createPost = () => {
    navigation.navigate("PostWrite", {
      communityName: community.community.name,
      communityId: community.community.id,
    });
  };

  // feedKey is a hack for autoscroll; force rerender on each feed update
  return (
    <View style={commonStyles.container} key={apiClient.postStore.feedKey}>
      <FlatList
        ref={listRef}
        ListEmptyComponent={
          <View style={ownStyles.emptyContainer}>
            <Text style={ownStyles.empty}>No posts here so far...</Text>
          </View>
        }
        style={{ flex: 1, width: "100%" }}
        renderItem={renderPost}
        data={apiClient.postStore.communityPosts}
        onRefresh={onRefresh}
        onEndReached={onEndReached}
        refreshing={apiClient.postStore.isLoading}
        onEndReachedThreshold={0.5}
        keyExtractor={extractor}
        fadingEdgeLength={1}
        onViewableItemsChanged={onPostScroll}
      />
      <FloatingMenu
        useCommunity
        additional={
          !community?.community.posting_restricted_to_mods &&
          apiClient.loginDetails?.jwt ? (
            <TouchableOpacity simple onPressCb={createPost}>
              <Text style={{ fontWeight: "500" }}>New Post</Text>
            </TouchableOpacity>
          ) : null
        }
      />
    </View>
  );
}

const ownStyles = StyleSheet.create({
  emptyContainer: {
    padding: 12,
    flex: 1,
  },
  empty: {
    fontSize: 16,
  },
});

export default observer(CommunityFeed);
