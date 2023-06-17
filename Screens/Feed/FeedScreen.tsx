import React from "react";
import { FlatList, View } from "react-native";
import { observer } from "mobx-react-lite";
import { styles } from '../../commonStyles'
import { apiClient } from "../../store/apiClient";
import Post from './Post'

function Feed() {
  React.useEffect(() => {
    if (apiClient.api) {
      void apiClient.postStore.getPosts(apiClient.loginDetails)
    }
  }, [ apiClient.api ])

  return (
    <View style={styles.container}>
      <FlatList
        renderItem={({ item }) => <Post post={item} />}
        data={apiClient.postStore.posts}
        onRefresh={() => {
          apiClient.postStore.setFilters({ page: 0 })
          apiClient.postStore.getPosts(apiClient.loginDetails)
        }}
        onEndReached={() => apiClient.postStore.nextPage(apiClient.loginDetails)}
        refreshing={apiClient.postStore.isLoading}
        onEndReachedThreshold={1}
        keyExtractor={(p) => p.post.id.toString()}
        fadingEdgeLength={1}
      />
    </View>
  );
}

export default observer(Feed);