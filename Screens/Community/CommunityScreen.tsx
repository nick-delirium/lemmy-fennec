import React from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { observer } from "mobx-react-lite";
import { commonStyles } from "../../commonStyles";
import { apiClient } from "../../store/apiClient";
import FeedPost from "../../components/Post/FeedPost";
import FloatingMenu from "../Feed/FloatingMenu";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import CommunityHeader from "./CommunityHeader";
import { communityStore } from "../../store/communityStore";
import { Text, TouchableOpacity } from "../../ThemedComponents";

function CommunityScreen({
  navigation,
  route,
}: NativeStackScreenProps<any, "Community">) {
  const commId = route.params.id;

  React.useEffect(() => {
    const getData = () => {
      if (communityStore.community?.community.id === commId) return;
      if (commId) {
        apiClient.postStore.setPage(1);
        void apiClient.postStore.getPosts(apiClient.loginDetails, commId);
      }
      void apiClient.communityStore.getCommunity(
        commId,
        apiClient.loginDetails
      );
    };

    const unsubscribe = navigation.addListener("focus", () => {
      getData();
    });
    getData();

    if (communityStore.community !== null && apiClient.postStore) {
      navigation.setOptions({
        title: `${communityStore.community.community.title} | ${apiClient.postStore.filters.sort}`,
      });
    }

    return unsubscribe;
  }, [commId, navigation, apiClient.postStore, communityStore.community]);

  // some optimizations
  const renderPost = React.useCallback(
    // @ts-ignore
    ({ item }) => <FeedPost post={item} navigation={navigation} useCommunity />,
    []
  );
  const extractor = React.useCallback((p) => p.post.id.toString(), []);
  const onEndReached = React.useCallback(() => {
    console.log("next page community", apiClient.postStore.posts.length);
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
        if (!item.isViewable && apiClient.profileStore.getReadOnScroll()) {
          void apiClient.postStore.markPostRead({
            post_id: item.item.post.id,
            read: true,
            auth: apiClient.loginDetails.jwt,
          });
        }
      });
    }
  }).current;

  // feedKey is a hack for autoscroll; force rerender on each feed update
  return (
    <View style={commonStyles.container} key={apiClient.postStore.feedKey}>
      <FlatList
        ListHeaderComponent={
          <CommunityHeader navigation={navigation} route={route} />
        }
        ListEmptyComponent={
          <View style={ownStyles.emptyContainer}>
            <Text style={ownStyles.empty}>No posts here so far...</Text>
            <TouchableOpacity onPressCb={onRefresh}>
              <Text>Refresh</Text>
            </TouchableOpacity>
          </View>
        }
        style={{ flex: 1, width: "100%" }}
        renderItem={renderPost}
        data={apiClient.postStore.communityPosts}
        onRefresh={onRefresh}
        onEndReached={onEndReached}
        refreshing={apiClient.postStore.isLoading}
        onEndReachedThreshold={1}
        keyExtractor={extractor}
        fadingEdgeLength={1}
        onViewableItemsChanged={onPostScroll}
      />
      <FloatingMenu useCommunity />
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

export default observer(CommunityScreen);
