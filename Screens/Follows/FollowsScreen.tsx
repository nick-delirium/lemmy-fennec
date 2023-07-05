import React from "react";
import { View, FlatList, ActivityIndicator, StyleSheet } from "react-native";
import { observer } from "mobx-react-lite";
import { apiClient } from "../../store/apiClient";
import { Community } from "../Search/ListComponents";
import { Text, TouchableOpacity } from "../../ThemedComponents";
import { useTheme } from "@react-navigation/native";
import Pagination from "../../components/Pagination";

function FollowsScreen({ navigation }) {
  const { colors } = useTheme();
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
        data={apiClient.communityStore.followedCommunities}
        refreshing={apiClient.communityStore.isLoading}
        renderItem={({ item }) => (
          <Community navigation={navigation} sublemmy={item} />
        )}
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
  paddedRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
});

function getRandomPhrase() {
  return randomSublemmy[Math.floor(Math.random() * randomSublemmy.length)];
}

export default observer(FollowsScreen);
