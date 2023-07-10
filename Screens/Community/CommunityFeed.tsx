import React from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { observer } from "mobx-react-lite";
import { commonStyles } from "../../commonStyles";
import { apiClient } from "../../store/apiClient";
import FeedPost from "../../components/Post/FeedPost";
import FloatingMenu from "../Feed/FloatingMenu";
import { Icon, Text, TouchableOpacity } from "../../ThemedComponents";
import TinyPost from "../../components/Post/TinyPost";
import { preferences } from "../../store/preferences";
import { PostView } from "lemmy-js-client";

function CommunityFeed({
  commId,
  navigation,
}: {
  commId: number;
  navigation: any;
}) {
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
    void apiClient.postStore.nextPage(apiClient.loginDetails, commId);
  }, [commId]);
  const onRefresh = React.useCallback(() => {
    apiClient.postStore.setCommPage(1);
    void apiClient.postStore.getPosts(apiClient.loginDetails, commId);
  }, [commId]);

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
          !community?.community.posting_restricted_to_mods ? (
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
