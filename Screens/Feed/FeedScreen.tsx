import React from "react";
import { FlatList, View } from "react-native";
import { observer } from "mobx-react-lite";
import { styles } from '../../commonStyles'
import { apiClient } from "../../store/apiClient";
import Post from './Post'

function Feed() {
  React.useEffect(() => {
    if (apiClient.api) {
      void apiClient.getPosts({})
    }
  }, [ apiClient.api ])

  return (
    <View style={styles.container}>
      <FlatList
        renderItem={({ item }) => <Post post={item} />}
        data={apiClient.posts}
        onRefresh={() => apiClient.getPosts({})}
        refreshing={apiClient.isFeedFetching}
        keyExtractor={(p) => p.post.id.toString()}
      />
    </View>
  );
}

export default observer(Feed);