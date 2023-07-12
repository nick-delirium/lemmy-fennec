import React from "react";
import { View, StyleSheet, ScrollView, ActivityIndicator } from "react-native";
import { observer } from "mobx-react-lite";
import { useTheme } from "@react-navigation/native";
import {
  Text,
  TextInput,
  TouchableOpacity,
  Icon,
} from "../../ThemedComponents";
import { apiClient } from "../../store/apiClient";
import { MessageBody } from "./Messages";

function MessageWrite({ navigation, route }) {
  const [text, setText] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const { colors } = useTheme();
  const {
    isFromLocalUser,
    toLocalUser,
    item,
    messageDate,
    borderColor,
    recipient,
    messageId,
    newMessage,
  } = route.params;

  React.useEffect(() => {
    if (isFromLocalUser) {
      navigation.setOptions({
        headerTitle: "Edit Message",
      });
      setText(item.private_message?.content);
    }
  }, [navigation, route.params?.isFromLocalUser]);

  const submit = () => {
    if (text.length === 0) return;
    setIsSubmitting(true);
    const promise = isFromLocalUser
      ? apiClient.api.editPrivateMessage({
          private_message_id: messageId,
          content: text,
          auth: apiClient.loginDetails.jwt,
        })
      : apiClient.api.createPrivateMessage({
          content: text,
          recipient_id: recipient,
          auth: apiClient.loginDetails.jwt,
        });
    promise.then(() => {
      setIsSubmitting(false);
      void apiClient.mentionsStore.getMessages(apiClient.loginDetails.jwt);
      navigation.goBack();
    });
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={{ flex: 1 }}>
        <ScrollView
          horizontal={true}
          contentContainerStyle={{ width: "100%", height: "100%" }}
        >
          <View style={{ padding: 12 }}>
            <MessageBody
              isFromLocalUser={isFromLocalUser}
              toLocalUser={toLocalUser}
              item={item}
              newMessage={newMessage}
              messageDate={messageDate}
              borderColor={borderColor}
            />
          </View>
        </ScrollView>
      </ScrollView>
      <ButtonsRow
        isLoading={isSubmitting}
        setText={setText}
        text={text}
        submit={submit}
      />
      <View style={{ ...styles.inputRow, backgroundColor: colors.card }}>
        <TextInput
          style={{ flex: 1 }}
          placeholder={"Beans."}
          value={text}
          onChangeText={(text) => setText(text)}
          autoCapitalize={"sentences"}
          autoCorrect={true}
          onSubmitEditing={submit}
          placeholderTextColor={colors.border}
          keyboardType="default"
          multiline
          accessibilityLabel={"Message input"}
        />
      </View>
    </View>
  );
}

export function ButtonsRow({ setText, text, submit, isLoading }) {
  const { colors } = useTheme();
  return (
    <View
      style={{
        ...styles.iconsRow,
        backgroundColor: colors.card,
        borderTopColor: colors.border,
      }}
    >
      <TouchableOpacity onPressCb={() => setText(text + "**___**")} simple>
        <Text style={styles.bold} customColor={colors.primary}>
          B
        </Text>
      </TouchableOpacity>
      <TouchableOpacity onPressCb={() => setText(text + "*___*")} simple>
        <Icon name={"italic"} accessibilityLabel={"Italic text"} size={16} />
      </TouchableOpacity>
      <TouchableOpacity onPressCb={() => setText(text + "[text](url)")} simple>
        <Icon name={"link"} accessibilityLabel={"Web link"} size={16} />
      </TouchableOpacity>
      <TouchableOpacity onPressCb={() => setText(text + "> ")} simple>
        <Icon
          name={"chevron-right"}
          accessibilityLabel={"Quote text"}
          size={16}
        />
      </TouchableOpacity>
      <TouchableOpacity onPressCb={() => setText(text + "~~___~~")} simple>
        <Text customColor={colors.primary} style={styles.strike}>
          S
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPressCb={() =>
          setText(text + ":::spoiler SpoilerName\n" + "___\n" + ":::")
        }
        simple
      >
        <Icon
          name={"alert-triangle"}
          accessibilityLabel={"Spoiler text"}
          size={16}
        />
      </TouchableOpacity>

      <View style={{ flex: 1 }} />
      <TouchableOpacity
        style={styles.additionalButtonStyle}
        isSecondary
        onPressCb={submit}
      >
        {isLoading ? (
          <ActivityIndicator color={colors.primary} />
        ) : (
          <Icon name={"send"} accessibilityLabel={"Send text"} size={24} />
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  inputRow: {
    paddingHorizontal: 6,
    paddingBottom: 12,
    paddingTop: 4,
    flexDirection: "row",
  },
  additionalButtonStyle: { justifyContent: "center" },
  iconsRow: {
    flexDirection: "row",
    gap: 16,
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderTopWidth: 1,
  },
  bold: { fontSize: 16, fontWeight: "bold" },
  strike: { textDecorationLine: "line-through", fontSize: 16 },
});

export default observer(MessageWrite);
