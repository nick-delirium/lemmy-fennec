import React from "react";
import { FlatList, StyleSheet, View } from "react-native";

import { useNavigation, useTheme } from "@react-navigation/native";
import { PrivateMessageView } from "lemmy-js-client";
import { observer } from "mobx-react-lite";

import { Icon, Text, TouchableOpacity } from "../../ThemedComponents";
import { commonColors } from "../../commonStyles";
import { apiClient } from "../../store/apiClient";
import { makeDateString } from "../../utils/utils";

function Messages({ navigation }) {
  const { colors } = useTheme();

  React.useEffect(() => {
    const unsub = navigation.addListener("focus", () => {
      if (apiClient.mentionsStore.messages.length !== 0) return;
      void apiClient.mentionsStore.getMessages();
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
      onRefresh={() => apiClient.mentionsStore.getMessages()}
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
      })
      .then(() => {
        void apiClient.mentionsStore.getMessages();
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
  newMessage,
}: {
  isFromLocalUser: boolean;
  toLocalUser: boolean;
  item: PrivateMessageView;
  messageDate: string;
  borderColor: string;
  newMessage?: boolean;
}) {
  const navigation = useNavigation();
  const openUser = () => {
    if (newMessage) return;
    // @ts-ignore
    navigation.navigate("User", {
      personId: item.creator.id,
    });
  };
  return (
    <>
      <View style={styles.title}>
        {isFromLocalUser ? null : (
          <>
            <Text>From:</Text>
            <TouchableOpacity simple onPressCb={openUser}>
              <Text customColor={commonColors.author}>{item.creator.name}</Text>
            </TouchableOpacity>
          </>
        )}
        {toLocalUser ? null : (
          <>
            <Text>To:</Text>
            <TouchableOpacity simple onPressCb={openUser}>
              <Text customColor={commonColors.author}>
                {item.recipient.name}
              </Text>
            </TouchableOpacity>
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
