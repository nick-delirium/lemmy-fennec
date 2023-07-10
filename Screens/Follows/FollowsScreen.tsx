import React from "react";
import { View, FlatList, ActivityIndicator, StyleSheet } from "react-native";
import { observer } from "mobx-react-lite";
import { apiClient } from "../../store/apiClient";
import { Text } from "../../ThemedComponents";
import Pagination from "../../components/Pagination";
import FollowedCommunity from "./FollowedCommunity";

function FollowsScreen() {
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
        onRefresh={() =>
          void apiClient.communityStore.getFollowedCommunities(
            apiClient.loginDetails
          )
        }
        data={[
          ...apiClient.communityStore.favoriteCommunities,
          ...apiClient.communityStore.regularFollowedCommunities,
        ]}
        refreshing={apiClient.communityStore.isLoading}
        renderItem={renderItem}
        keyExtractor={(item) => item.community.id.toString()}
      />
      {apiClient.communityStore.isLoading ? null : (
        <Pagination
          prevPage={prevPage}
          nextPage={nextPage}
          page={apiClient.communityStore.page}
          itemsLength={
            apiClient.communityStore.followedCommunities?.length ?? 0
          }
        />
      )}
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

export default observer(FollowsScreen);
