import React from "react";
import { FlatList, Image, StyleSheet, View } from "react-native";

import { PersonBlockView } from "lemmy-js-client";
import { observer } from "mobx-react-lite";

import { Icon, Text, TouchableOpacity } from "../../ThemedComponents";
import { apiClient } from "../../store/apiClient";
import { hostname } from "../Search/ListComponents";

function BlockedUsers() {
  const blockedUsers = apiClient.profileStore.blockedPeople;

  const renderItem = ({ item }: { item: PersonBlockView }) => (
    <RenderUser item={item} />
  );
  return (
    <View style={styles.container}>
      <FlatList
        onRefresh={apiClient.getGeneralData}
        refreshing={apiClient.isLoading}
        data={blockedUsers}
        renderItem={renderItem}
        keyExtractor={(item) => item.person.actor_id}
        ListEmptyComponent={<Text>Nothing so far...</Text>}
      />
    </View>
  );
}

function RenderUser({ item }: { item: PersonBlockView }) {
  const userName = `${item.target.name}@${hostname(item.target.actor_id)}`;

  const unblock = () => {
    void apiClient.profileStore.blockPerson(item.target.id, false);
  };
  return (
    <View style={styles.row}>
      <View style={styles.iconContainer}>
        <Image
          source={{ uri: item.target.avatar }}
          style={styles.communityIcon}
          accessibilityLabel={"Icon for person: " + item.target.name}
        />
      </View>
      <Text style={styles.title}>{userName}</Text>
      <View style={styles.spacer} />
      <TouchableOpacity
        simple
        feedback
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

export default observer(BlockedUsers);
