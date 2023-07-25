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
import MiniComment from "../../components/TinyComment";
import { commonStyles } from "../../commonStyles";

function CommentWrite({ navigation, route }) {
  const [text, setText] = React.useState("");
  const { colors } = useTheme();

  const item = apiClient.commentsStore.replyTo;
  const isEdit = item?.isEdit;

  React.useEffect(() => {
    if (isEdit && item) setText(item.content);
  }, [isEdit, item]);
  if (!item) return <ActivityIndicator />;

  const submit = () => {
    if (text.length === 0 || !apiClient.loginDetails?.jwt) return;
    if (isEdit) {
      apiClient.api
        .editComment({
          comment_id: item.parent_id,
          content: text,
          auth: apiClient.loginDetails.jwt,
        })
        .then(() => {
          void apiClient.commentsStore.getComments(
            item.postId,
            apiClient.loginDetails
          );
          navigation.goBack();
        });
    } else
      apiClient.commentsStore
        .createComment(
          {
            auth: apiClient.loginDetails.jwt,
            content: text,
            parent_id: apiClient.commentsStore.replyTo.parent_id,
            post_id: apiClient.commentsStore.replyTo.postId,
          },
          item.parent_id === undefined
        )
        .then(() => {
          navigation.goBack();
        });
  };
  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={{ flex: 1 }}>
        <ScrollView
          horizontal={true}
          contentContainerStyle={{ width: "100%", height: "100%", padding: 8 }}
        >
          <MiniComment
            title={item.title}
            community={item.community}
            published={item.published}
            author={item.author}
            content={item.content}
            useMd
          />
        </ScrollView>
      </ScrollView>
      <ButtonsRow
        isLoading={apiClient.commentsStore.isLoading}
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
          accessibilityLabel={"Comment text input"}
        />
      </View>
    </View>
  );
}

interface ButtonsRowProps {
  setText: (text: string) => void;
  text: string;
  submit?: () => void;
  isLoading?: boolean;
}

export function ButtonsRow({
  setText,
  text,
  submit,
  isLoading,
}: ButtonsRowProps) {
  const { colors } = useTheme();
  return (
    <View
      style={{
        ...styles.iconsRow,
        backgroundColor: colors.card,
        borderTopColor: colors.border,
      }}
    >
      <TouchableOpacity
        style={commonStyles.touchableIcon}
        onPressCb={() => setText(text + "**___**")}
        simple
      >
        <Text style={styles.bold} customColor={colors.primary}>
          B
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={commonStyles.touchableIcon}
        onPressCb={() => setText(text + "*___*")}
        simple
      >
        <Icon name={"italic"} accessibilityLabel={"Italic text"} size={16} />
      </TouchableOpacity>
      <TouchableOpacity
        style={commonStyles.touchableIcon}
        onPressCb={() => setText(text + "[text](url)")}
        simple
      >
        <Icon name={"link"} accessibilityLabel={"Web link"} size={16} />
      </TouchableOpacity>
      <TouchableOpacity
        style={commonStyles.touchableIcon}
        onPressCb={() => setText(text + "> ")}
        simple
      >
        <Icon
          name={"chevron-right"}
          accessibilityLabel={"Quote text"}
          size={16}
        />
      </TouchableOpacity>
      <TouchableOpacity
        style={commonStyles.touchableIcon}
        onPressCb={() => setText(text + "~~___~~")}
        simple
      >
        <Text customColor={colors.primary} style={styles.strike}>
          S
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={commonStyles.touchableIcon}
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

      {submit ? (
        <>
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
        </>
      ) : null}
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

export default observer(CommentWrite);
