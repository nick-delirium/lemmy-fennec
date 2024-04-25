import React from "react";
import { FlatList, Image, StyleSheet, View } from "react-native";

import { CommunityBlockView } from "lemmy-js-client";
import { observer } from "mobx-react-lite";

import { Icon, Text, TouchableOpacity } from "../../ThemedComponents";
import { apiClient } from "../../store/apiClient";
import { hostname } from "../Search/ListComponents";

function BlockedCommunities() {
  const blockedCommunities = apiClient.profileStore.blockedCommunities;

  const renderItem = ({ item }: { item: CommunityBlockView }) => (
    <RenderCommunity item={item} />
  );
  return (
    <View style={styles.container}>
      <FlatList
        onRefresh={apiClient.getGeneralData}
        refreshing={apiClient.isLoading}
        data={blockedCommunities}
        renderItem={renderItem}
        keyExtractor={(item) => item.community.actor_id}
        ListEmptyComponent={<Text>Nothing so far...</Text>}
      />
    </View>
  );
}

function RenderCommunity({ item }: { item: CommunityBlockView }) {
  const commName = `${item.community.name}@${hostname(
    item.community.actor_id
  )}`;

  const unblock = () => {
    apiClient.communityStore
      .blockCommunity(item.community.id, false)
      .then(() => {
        apiClient.profileStore.setBlocks(
          apiClient.profileStore.blockedPeople,
          apiClient.profileStore.blockedCommunities.filter(
            (c) => c.community.id !== item.community.id
          )
        );
      });
  };
  return (
    <View style={styles.row}>
      <View style={styles.iconContainer}>
        <Image
          source={{ uri: item.community.icon }}
          style={styles.communityIcon}
          accessibilityLabel={"Icon for community: " + item.community.name}
        />
      </View>
      <Text style={styles.title}>{commName}</Text>
      <View style={styles.spacer} />
      <TouchableOpacity
        feedback
        simple
        style={styles.touchableIcon}
        onPressCb={unblock}
      >
        <Icon name={"x"} size={24} color={"red"} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 8 },
  communityIcon: { width: 28, height: 28, borderRadius: 28 },
  iconContainer: {
    width: 28,
    height: 28,
    borderRadius: 28,
    backgroundColor: "#cecece",
  },
  spacer: { flex: 1 },
  touchableIcon: { padding: 4 },
  row: { flexDirection: "row", alignItems: "center", gap: 8 },
  title: { fontSize: 16 },
});

export default observer(BlockedCommunities);
