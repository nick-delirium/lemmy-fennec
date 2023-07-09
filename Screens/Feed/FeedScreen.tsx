import React from "react";
import { FlatList, View } from "react-native";
import { observer } from "mobx-react-lite";
import { commonStyles } from "../../commonStyles";
import { apiClient } from "../../store/apiClient";
import FeedPost from "../../components/Post/FeedPost";
import TinyPost from "../../components/Post/TinyPost";
import FloatingMenu from "./FloatingMenu";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { preferences } from "../../store/preferences";

function Feed({ navigation }: NativeStackScreenProps<any, "Feed">) {
  const isFocused = navigation.isFocused();
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

  // feedKey is a hack for autoscroll
  return (
    <View style={commonStyles.container} key={apiClient.postStore.feedKey}>
      <FlatList
        style={{ flex: 1 }}
        renderItem={renderPost}
        data={apiClient.postStore.posts}
        onRefresh={onRefresh}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        onEndReached={onEndReached}
        refreshing={apiClient.postStore.isLoading}
        onEndReachedThreshold={1}
        keyExtractor={extractor}
        fadingEdgeLength={1}
        onViewableItemsChanged={onPostScroll}
      />
      <FloatingMenu />
    </View>
  );
}

export default observer(Feed);
