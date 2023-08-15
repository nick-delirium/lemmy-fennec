import React from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  ToastAndroid,
  View,
} from "react-native";

import { useTheme } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import * as ImagePicker from "expo-image-picker";
import { UploadImageResponse } from "lemmy-js-client";
import { observer } from "mobx-react-lite";

import { Icon, Text, TextInput, TouchableOpacity } from "../ThemedComponents";
import { commonColors } from "../commonStyles";
import { apiClient } from "../store/apiClient";
import { ButtonsRow } from "./CommentWrite/CommentWrite";
import { Toggler } from "./Settings/Looks";

const imageTypes = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  gif: "image/gif",
  webp: "image/webp",
};

function PostWrite({
  navigation,
  route,
}: NativeStackScreenProps<any, "WritePost">) {
  const { communityName, communityId, isEdit, content } = route.params;
  const { colors } = useTheme();
  const [image, setImage] = React.useState<ImagePicker.ImagePickerAsset>(null);
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

  const pickImage = async () => {
    const permission = await ImagePicker.getMediaLibraryPermissionsAsync();
    if (permission.granted === false) {
      const result = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (result.granted === false)
        return ToastAndroid.showWithGravity(
          "You need to grant permission to access the library",
          ToastAndroid.SHORT,
          ToastAndroid.CENTER
        );
    }
    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        allowsMultipleSelection: false,
        base64: true,
        quality: 0.8,
      });

      if (!result.canceled) {
        setImage(result.assets[0]);
        const type = result.assets[0].uri.split(".").pop();
        const formData = new FormData();
        formData.append("images[]", {
          uri: result.assets[0].uri,
          name: `${new Date().getTime()}.${type}`,
          type: imageTypes[type],
        } as any);
        fetch(apiClient.currentInstance + "/pictrs/image", {
          method: "POST",
          mode: "cors",
          headers: {
            Cookie: "jwt=" + apiClient.loginDetails.jwt,
            "User-Agent": "Arctius Android 0.1.1",
            Accept: "application/json",
            "Content-Type": "multipart/form-data",
          },
          body: formData,
        })
          .then((r) => {
            if (r.ok) {
              return r.json();
            }
          })
          .then((result: UploadImageResponse) => {
            setUrl(
              apiClient.currentInstance +
                "/pictrs/image/" +
                result.files[0].file
            );
          })
          .catch((e) => {
            console.log(e);
            ToastAndroid.showWithGravity(
              "Network error",
              ToastAndroid.SHORT,
              ToastAndroid.CENTER
            );
          });
      }
    } catch (e) {
      console.log(e);
    }
  };
  const deleteImage = () => {
    setUrl("");
    setImage(null);
  };
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
        .catch((e) => {
          console.log(e);
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
    <View style={{ flex: 1, gap: 8 }}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.container}>
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
          <View
            style={{
              ...styles.fileUpload,
              borderColor: colors.border,
            }}
          >
            <TouchableOpacity onPressCb={pickImage}>
              <Text>Upload file</Text>
            </TouchableOpacity>
            <Text customColor={colors.border}>
              {image ? image.uri.split("/").pop() : "Optional"}
            </Text>
          </View>
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
        {image ? (
          <View style={styles.imageCont}>
            <Image
              source={{ uri: image.uri }}
              style={{ width: "80%", height: 320 }}
            />
            <TouchableOpacity
              style={{
                backgroundColor: "red",
                flexDirection: "row",
                gap: 6,
                alignItems: "center",
              }}
              onPressCb={deleteImage}
            >
              <Icon name={"trash"} size={16} color={"white"} />
              <Text>Delete</Text>
            </TouchableOpacity>
          </View>
        ) : null}
      </ScrollView>
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
    paddingBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
  },
  imageCont: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
    gap: 8,
  },
  fileUpload: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 8,
    gap: 8,
  },
});

export default observer(PostWrite);

// img blob
// const blob: Blob = await new Promise((resolve, reject) => {
//   const xhr = new XMLHttpRequest();
//   xhr.onload = function () {
//     resolve(xhr.response);
//   };
//   xhr.onerror = function (e) {
//     console.log(e);
//     reject(new TypeError("Network request failed"));
//   };
//   xhr.responseType = "blob";
//   xhr.open("GET", result.assets[0].uri, true);
//   xhr.send(null);
// });
// const base64String = await FileSystem.readAsStringAsync(
//   result.assets[0].uri,
//   {
//     encoding: "base64",
//   }
// );
// const buffer = Buffer.from(base64String, "base64");
// native upload
// apiClient.api
//   .uploadImage({
//     auth: apiClient.loginDetails.jwt,
//     image: buffer,
//   })
//   .then((result) => {
//     if (result.msg === "ok") {
//       setUrl(
//         apiClient.currentInstance +
//           "/pictrs/image/" +
//           result.files[0].file
//       );
//     } else {
//       console.log("result", result);
//       ToastAndroid.showWithGravity(
//         "Network error",
//         ToastAndroid.SHORT,
//         ToastAndroid.CENTER
//       );
//     }
//   })
//   .catch((e) => {
//     console.log("fetch error", e);
//     ToastAndroid.showWithGravity(
//       "Network error",
//       ToastAndroid.SHORT,
//       ToastAndroid.CENTER
//     );
//   });
