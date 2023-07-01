import React from "react";
import { View, FlatList, ActivityIndicator } from "react-native";
import { observer } from "mobx-react-lite";
import { apiClient } from "../../store/apiClient";
import { Community } from "../Search/ListComponents";
import { Text, TouchableOpacity } from "../../ThemedComponents";

function FollowsScreen({ navigation }) {
  React.useEffect(() => {
    if (apiClient.communityStore.followedCommunities.length === 0) {
      apiClient.communityStore.setPage(1);
      void apiClient.communityStore.getFollowedCommunities(
        apiClient.loginDetails
      );
    }
  }, []);

  const nextPage = () => {
    apiClient.communityStore.nextPage(apiClient.loginDetails);
  };
  const prevPage = () => {
    apiClient.communityStore.prevPage(apiClient.loginDetails);
  };

  return (
    <View style={{ flex: 1 }}>
      {apiClient.communityStore.isLoading ? <ActivityIndicator /> : null}
      <FlatList
        data={apiClient.communityStore.followedCommunities}
        refreshing={apiClient.communityStore.isLoading}
        renderItem={({ item }) => (
          <Community navigation={navigation} sublemmy={item} />
        )}
        keyExtractor={(item) => item.community.id.toString()}
      />
      {apiClient.communityStore.isLoading ? null : (
        <View
          style={{
            flexDirection: "row",
            gap: 8,
            padding: 8,
            marginTop: "auto",
          }}
        >
          <TouchableOpacity onPressCb={prevPage}>
            <Text>Previous</Text>
          </TouchableOpacity>
          <TouchableOpacity onPressCb={nextPage}>
            <Text>Next</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

export default observer(FollowsScreen);
