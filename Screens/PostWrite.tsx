import React from "react";
import { View, StyleSheet, ToastAndroid } from "react-native";
import { Text, TouchableOpacity, TextInput } from "../ThemedComponents";
import { useTheme } from "@react-navigation/native";
import { commonColors } from "../commonStyles";
import { Toggler } from "./SettingsScreen";
import { observer } from "mobx-react-lite";
import { ButtonsRow } from "./CommentWrite/CommentWrite";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { apiClient } from "../store/apiClient";

function PostWrite({
  navigation,
  route,
}: NativeStackScreenProps<any, "WritePost">) {
  const { communityName, communityId, isEdit, content } = route.params;
  const { colors } = useTheme();
  const [text, setText] = React.useState("");
  const [title, setTitle] = React.useState("");
  const [url, setUrl] = React.useState("");
  const [isNsfw, setIsNsfw] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  React.useEffect(() => {
    if (isEdit) {
      setText(content.text);
      setTitle(content.title);
      setUrl(content.url);
      setIsNsfw(content.nsfw);
    }
  }, [isEdit]);

  const submit = async () => {
    setIsLoading(true);
    if (!apiClient.loginDetails.jwt || title === "") return setIsLoading(false);
    if (isEdit) {
      apiClient.api
        .editPost({
          auth: apiClient.loginDetails.jwt,
          post_id: content.id,
          body: text,
          name: title,
          nsfw: isNsfw,
          url: url === "" ? undefined : url,
        })
        .then(() => {
          apiClient.postStore.getSinglePost(content.id, apiClient.loginDetails);
          navigation.goBack();
        });
    } else {
      apiClient.api
        .createPost({
          community_id: communityId,
          name: title,
          url: url === "" ? undefined : url,
          auth: apiClient.loginDetails.jwt,
          nsfw: isNsfw,
          body: text,
        })
        .then(({ post_view }) => {
          return navigation.replace("Post", { post: post_view.post.id });
        })
        .catch(() => {
          ToastAndroid.showWithGravity(
            "Network error",
            ToastAndroid.SHORT,
            ToastAndroid.CENTER
          );
        })
        .finally(() => setIsLoading(false));
    }
  };

  return (
    <View style={styles.container}>
      <View style={{ paddingHorizontal: 8, gap: 12 }}>
        <View style={{ flexDirection: "row", gap: 6 }}>
          <Text style={styles.title}>For</Text>
          <Text style={{ ...styles.title, color: commonColors.community }}>
            u/{communityName}
          </Text>
        </View>
        <TextInput
          placeholder={"Title"}
          value={title}
          onChangeText={(titleV) => setTitle(titleV)}
          autoCapitalize={"sentences"}
          autoCorrect={true}
          placeholderTextColor={colors.border}
          keyboardType="default"
          accessibilityLabel={"Post title"}
        />
        <TextInput
          placeholder={"URL (optional)"}
          value={url}
          onChangeText={(urlV) => setUrl(urlV)}
          autoCapitalize={"none"}
          autoCorrect={false}
          placeholderTextColor={colors.border}
          keyboardType="default"
          accessibilityLabel={"Post title"}
        />
        <TextInput
          placeholder={"Post body (optional)"}
          value={text}
          onChangeText={(textV) => setText(textV)}
          autoCapitalize={"sentences"}
          autoCorrect={false}
          placeholderTextColor={colors.border}
          keyboardType="default"
          multiline={true}
          accessibilityLabel={"Post content"}
        />
        <Toggler
          useLogin
          label={"NSFW?"}
          value={isNsfw}
          onValueChange={setIsNsfw}
        />
      </View>
      <View style={{ flex: 1 }} />
      <ButtonsRow
        setText={setText}
        text={text}
        submit={submit}
        isLoading={isLoading}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 8,
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default observer(PostWrite);
