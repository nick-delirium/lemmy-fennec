import { observer } from "mobx-react-lite";
import { CommunityView } from "lemmy-js-client";
import { useNavigation } from "@react-navigation/native";
import { apiClient } from "../../store/apiClient";
import { StyleSheet, View } from "react-native";
import { Icon, TouchableOpacity } from "../../ThemedComponents";
import { Community } from "../Search/ListComponents";
import React from "react";

function FollowedCommunity({ item }: { item: CommunityView }) {
  const navigation = useNavigation();
  const isFavorite =
    apiClient.communityStore.favoriteCommunities.findIndex(
      (i) => i.community.id === item.community.id
    ) !== -1;
  const onPress = () => {
    if (isFavorite) {
      apiClient.communityStore.removeFromFavorites(item);
    } else {
      apiClient.communityStore.addToFavorites(item);
    }
  };
  return (
    <View style={styles.row}>
      <TouchableOpacity
        style={{ padding: 2 }}
        simple
        feedback
        onPressCb={onPress}
      >
        <Icon name={"heart"} size={16} color={isFavorite ? "red" : undefined} />
      </TouchableOpacity>
      <Community navigation={navigation} sublemmy={item} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
});

export default observer(FollowedCommunity);
