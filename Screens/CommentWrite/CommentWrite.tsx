import React from "react";
import {
  View,
  StyleSheet,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  ActivityIndicator,
} from "react-native";
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

function CommentWrite({ navigation }) {
  const [text, setText] = React.useState("");
  const { colors } = useTheme();

  const item = apiClient.commentsStore.replyTo;

  if (!item) return <ActivityIndicator />;

  const submit = () => {
    apiClient.commentsStore
      .createComment({
        auth: apiClient.loginDetails.jwt,
        content: text,
        parent_id: apiClient.commentsStore.replyTo.parent_id,
        post_id: apiClient.commentsStore.replyTo.postId,
      })
      .then(() => {
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
      <View
        style={{
          flexDirection: "row",
          gap: 12,
          alignItems: "center",
          paddingHorizontal: 6,
          paddingVertical: 8,
          backgroundColor: colors.card,
          borderTopColor: colors.border,
          borderTopWidth: 1,
        }}
      >
        <TouchableOpacity onPressCb={() => setText(text + "**___**")} simple>
          <Text
            style={{ fontSize: 16, fontWeight: "bold" }}
            customColor={colors.primary}
          >
            B
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPressCb={() => setText(text + "*___*")} simple>
          <Icon name={"italic"} accessibilityLabel={"Italic text"} size={16} />
        </TouchableOpacity>
        <TouchableOpacity
          onPressCb={() => setText(text + "[text](url)")}
          simple
        >
          <Icon name={"link"} accessibilityLabel={"Web link"} size={16} />
        </TouchableOpacity>
        <TouchableOpacity onPressCb={() => setText(text + "> ")} simple>
          <Icon
            name={"chevron-right"}
            accessibilityLabel={"Quote text"}
            size={16}
          />
        </TouchableOpacity>
        <TouchableOpacity onPressCb={() => setText(text + "*~~___~~*")} simple>
          <Text
            customColor={colors.primary}
            style={{ textDecorationLine: "line-through", fontSize: 16 }}
          >
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
          {!apiClient.commentsStore.isLoading ? (
            <Icon name={"send"} accessibilityLabel={"Send text"} size={24} />
          ) : (
            <ActivityIndicator color={colors.primary} />
          )}
        </TouchableOpacity>
      </View>
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
          accessibilityLabel={"Comment input"}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  inputRow: {
    paddingHorizontal: 6,
    paddingBottom: 12,
    paddingTop: 4,
    flexDirection: "row",
    gap: 6,
  },
  additionalButtonStyle: { justifyContent: "center" },
});

export default observer(CommentWrite);
