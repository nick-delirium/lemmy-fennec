import React from "react";
import { StyleSheet, View } from "react-native";

import { useNavigation } from "@react-navigation/native";
import { Community as ICommunity } from "lemmy-js-client";
import { observer } from "mobx-react-lite";

import { Icon, TouchableOpacity } from "../../ThemedComponents";
import { apiClient } from "../../store/apiClient";
import { Community } from "../Search/ListComponents";

function FollowedCommunity({ item }: { item: ICommunity }) {
  const navigation = useNavigation();
  const isFavorite =
    apiClient.communityStore.favoriteCommunities.findIndex(
      (i) => i.id === item.id
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
