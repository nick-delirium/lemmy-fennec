import React from "react";
import { FlatList, View } from "react-native";
import { observer } from "mobx-react-lite";
import { styles } from "../../commonStyles";
import { apiClient } from "../../store/apiClient";
import Post from "./Post";
import FloatingMenu from "./FloatingMenu";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

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
    ({ item }) => <Post post={item} navigation={navigation} />,
    []
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
    if (changed.length > 0) {
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

  // feedKey is a hack for autoscroll
  return (
    <View style={styles.container} key={apiClient.postStore.feedKey}>
      <FlatList
        style={{ flex: 1 }}
        renderItem={renderPost}
        data={apiClient.postStore.posts}
        onRefresh={onRefresh}
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
