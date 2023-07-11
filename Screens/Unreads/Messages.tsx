import React from "react";
import { observer } from "mobx-react-lite";
import { View, FlatList, StyleSheet } from "react-native";
import { Text, TouchableOpacity, Icon } from "../../ThemedComponents";
import { apiClient } from "../../store/apiClient";
import { PrivateMessageView } from "lemmy-js-client";
import { commonColors } from "../../commonStyles";
import { useNavigation, useTheme } from "@react-navigation/native";
import { makeDateString } from "../../utils/utils";
import { PrivateMessageId } from "lemmy-js-client/dist/types/PrivateMessageId";

function Messages({ navigation }) {
  const { colors } = useTheme();

  React.useEffect(() => {
    const unsub = navigation.addListener("focus", () => {
      if (apiClient.mentionsStore.messages.length !== 0) return;
      void apiClient.mentionsStore.getMessages(apiClient.loginDetails.jwt);
    });

    return () => {
      unsub();
    };
  }, [apiClient.mentionsStore.messages.length]);

  const renderItem = ({ item }) => <Message item={item} />;
  return (
    <FlatList
      data={apiClient.mentionsStore.messages}
      renderItem={renderItem}
      onRefresh={() =>
        apiClient.mentionsStore.getMessages(apiClient.loginDetails.jwt)
      }
      refreshing={apiClient.mentionsStore.isLoading}
      ItemSeparatorComponent={() => (
        <View
          style={{ height: 1, width: "100%", backgroundColor: colors.border }}
        />
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
  const navigation = useNavigation();

  const isFromLocalUser =
    item.creator.id === apiClient.profileStore.localUser.person.id;
  const toLocalUser =
    item.recipient.id === apiClient.profileStore.localUser.person.id;
  const borderColor = isFromLocalUser ? commonColors.author : "#cecece";

  const messageDate = makeDateString(
    item.private_message.updated || item.private_message.published
  );
  const toWriting = () => {
    // @ts-ignore
    navigation.navigate("MessageWrite", {
      isFromLocalUser,
      toLocalUser,
      item,
      messageDate,
      borderColor,
      recipient: item.creator.id,
      messageId: item.private_message.id,
    });
  };

  const removeMessage = () => {
    apiClient.api
      .deletePrivateMessage({
        private_message_id: item.private_message.id,
        deleted: true,
        auth: apiClient.loginDetails.jwt,
      })
      .then(() => {
        apiClient.mentionsStore.getMessages(apiClient.loginDetails.jwt);
      });
  };

  const markRead = () => null;
  return (
    <View
      style={{
        ...styles.message,
        opacity: item.private_message.read ? 0.6 : 1,
      }}
    >
      <MessageBody
        isFromLocalUser={isFromLocalUser}
        toLocalUser={toLocalUser}
        item={item}
        messageDate={messageDate}
        borderColor={borderColor}
      />
      <View style={{ flexDirection: "row", gap: 8 }}>
        <View style={{ flex: 1 }} />
        {isFromLocalUser ? (
          <TouchableOpacity simple onPressCb={removeMessage}>
            <Icon name={"trash"} size={24} />
          </TouchableOpacity>
        ) : null}
        <TouchableOpacity simple onPressCb={toWriting}>
          <Icon name={"edit"} size={24} />
        </TouchableOpacity>
        <TouchableOpacity simple onPressCb={markRead}>
          <Icon name={"check-square"} size={24} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

export function MessageBody({
  isFromLocalUser,
  toLocalUser,
  item,
  messageDate,
  borderColor,
}) {
  return (
    <>
      <View style={styles.title}>
        {isFromLocalUser ? null : (
          <>
            <Text>From:</Text>
            <Text customColor={commonColors.author}>{item.creator.name}</Text>
          </>
        )}
        {toLocalUser ? null : (
          <>
            <Text>To:</Text>
            <Text customColor={commonColors.author}>{item.recipient.name}</Text>
          </>
        )}
        <Text style={{ marginLeft: "auto" }}>{messageDate}</Text>
      </View>
      <View style={{ ...styles.messageContent, borderLeftColor: borderColor }}>
        <Text>{item.private_message.content || "Empty message"}</Text>
      </View>
    </>
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
