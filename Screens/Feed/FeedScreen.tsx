import React from "react";
import { FlatList, View } from "react-native";
import { observer } from "mobx-react-lite";
import { styles } from '../../commonStyles'
import { apiClient } from "../../store/apiClient";
import Post from './Post'
import FloatingMenu from "./FloatingMenu";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

function Feed({ navigation }: NativeStackScreenProps<any, "Feed">) {
  React.useEffect(() => {
    if (apiClient.api) {
      void apiClient.postStore.getPosts(apiClient.loginDetails)
    }
  }, [apiClient.api])

  // some optimizations
  const renderPost = React.useCallback(({ item }) => <Post post={item} navigation={navigation} />, [])
  const extractor = React.useCallback((p) => p.post.id.toString(), [])
  const onEndReached = React.useCallback(() => apiClient.postStore.nextPage(apiClient.loginDetails), [])
  const onRefresh = React.useCallback(() => {
    apiClient.postStore.setFilters({ page: 0 })
    void apiClient.postStore.getPosts(apiClient.loginDetails)
  }, [])
  return (
    <View style={styles.container}>
      <FlatList
        renderItem={renderPost}
        data={apiClient.postStore.posts}
        onRefresh={onRefresh}
        onEndReached={onEndReached}
        refreshing={apiClient.postStore.isLoading}
        onEndReachedThreshold={1}
        keyExtractor={extractor}
        fadingEdgeLength={1}
      />
      <FloatingMenu />
    </View>
  );
}

export default observer(Feed);