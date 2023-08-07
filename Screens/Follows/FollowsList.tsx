import React from "react";
import { View, FlatList, ActivityIndicator, StyleSheet } from "react-native";
import { observer } from "mobx-react-lite";
import { apiClient } from "../../store/apiClient";
import { Text } from "../../ThemedComponents";
import Pagination from "../../components/Pagination";
import FollowedCommunity from "./FollowedCommunity";

function FollowsList() {
  const renderItem = ({ item }) => <FollowedCommunity item={item} />;
  return (
    <View style={{ flex: 1 }}>
      {apiClient.communityStore.isLoading ? <ActivityIndicator /> : null}
      <FlatList
        ListEmptyComponent={
          <View style={ownStyles.emptyContainer}>
            <Text style={ownStyles.empty}>Nothing here yet.</Text>
            <Text style={ownStyles.empty}>
              Want a recommendation? Try searching "{getRandomPhrase()}".
            </Text>
          </View>
        }
        onRefresh={apiClient.getGeneralData}
        data={[
          ...apiClient.communityStore.favoriteCommunities,
          ...apiClient.communityStore.regularFollowedCommunities,
        ]}
        refreshing={apiClient.isLoading}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
      />
    </View>
  );
}

const randomSublemmy = [
  "asklemmy",
  "Technology",
  "Memes",
  "Gaming",
  "Chat",
  "Mildly Infuriating",
  "Lemmy Shitpost",
  "Showerthoughts",
];

const ownStyles = StyleSheet.create({
  emptyContainer: {
    padding: 12,
    flex: 1,
  },
  empty: {
    fontSize: 16,
  },
});

function getRandomPhrase() {
  return randomSublemmy[Math.floor(Math.random() * randomSublemmy.length)];
}

export default observer(FollowsList);
