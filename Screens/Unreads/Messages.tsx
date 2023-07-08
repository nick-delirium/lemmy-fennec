import React from "react";
import { observer } from "mobx-react-lite";
import { View, FlatList, StyleSheet } from "react-native";
import { Text } from "../../ThemedComponents";
import { apiClient } from "../../store/apiClient";
import { PrivateMessageView } from "lemmy-js-client";
import { commonColors } from "../../commonStyles";
import { useTheme } from "@react-navigation/native";

function Messages({ navigation }) {
  const { colors } = useTheme();

  React.useEffect(() => {
    const unsub = navigation.addListener("focus", () => {
      if (apiClient.mentionsStore.unreads.messages !== 0) return;
      void apiClient.mentionsStore.getMessages(apiClient.loginDetails.jwt);
    });

    return () => {
      unsub();
    };
  }, [apiClient.mentionsStore.unreads.messages]);
  return (
    <FlatList
      data={apiClient.mentionsStore.messages}
      renderItem={Message}
      ItemSeparatorComponent={() => (
        <View
          style={{ height: 1, width: "100%", backgroundColor: colors.border }}
        />
      )}
      ListFooterComponent={() => (
        <View
          style={{
            justifyContent: "center",
            padding: 12,
            alignItems: "center",
          }}
        >
          <Text style={{ opacity: 0.6 }}>This area is still in progress.</Text>
        </View>
      )}
      ListEmptyComponent={
        <View style={styles.emptyContainer}>
          <Text style={styles.empty}>
            No messages yet. Send a message to someone! (from web interface,
            since this area is still in progress)
          </Text>
        </View>
      }
    />
  );
}

function Message({ item }: { item: PrivateMessageView }) {
  const isFromLocalUser =
    item.creator.id === apiClient.profileStore.localUser.person.id;
  const toLocalUser =
    item.recipient.id === apiClient.profileStore.localUser.person.id;

  const borderColor = isFromLocalUser ? commonColors.author : "#cecece";
  return (
    <View style={styles.message}>
      {isFromLocalUser ? null : (
        <View style={styles.title}>
          <Text>From:</Text>
          <Text customColor={commonColors.author}>{item.creator.name}</Text>
        </View>
      )}
      {toLocalUser ? null : (
        <View style={styles.title}>
          <Text>To:</Text>
          <Text customColor={commonColors.author}>{item.recipient.name}</Text>
        </View>
      )}
      <View style={{ ...styles.messageContent, borderLeftColor: borderColor }}>
        <Text>{item.private_message.content || "Empty message"}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  emptyContainer: {
    flex: 1,
    padding: 12,
  },
  empty: {
    fontSize: 16,
  },
  title: {
    flexDirection: "row",
    fontWeight: "500",
    gap: 6,
  },
  message: {
    padding: 12,
  },
  messageContent: {
    borderLeftWidth: 1,
    paddingLeft: 6,
  },
});

export default observer(Messages);
