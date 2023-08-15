import React from "react";
import { StyleSheet, ToastAndroid, View } from "react-native";

import { useTheme } from "@react-navigation/native";
import { setImageAsync } from "expo-clipboard";
import { documentDirectory, downloadAsync } from "expo-file-system";
import {
  addAssetsToAlbumAsync,
  createAlbumAsync,
  createAssetAsync,
  getAlbumAsync,
  usePermissions,
} from "expo-media-library";
import ImageView from "react-native-image-viewing";

import { Icon, Text, TouchableOpacity } from "../../ThemedComponents";

interface Props {
  url: string;
  name: string;
  visible: boolean;
  setIsVisible: React.Dispatch<React.SetStateAction<boolean>>;
  shareImage: () => void;
}

function ImageViewer({ url, name, visible, setIsVisible, shareImage }: Props) {
  const [permissionResponse, askForPermission] = usePermissions({
    writeOnly: true,
  });
  const { colors } = useTheme();
  const safeName = name.length > 45 ? name.slice(0, 40) + "..." : name;

  const handleDownload = async () => {
    let fileUri = documentDirectory + `${safeName.replace(" ", "-")}.jpg`;
    try {
      const res = await downloadAsync(url, fileUri);
      await saveFile(res.uri);
      ToastAndroid.showWithGravity(
        "Image saved",
        ToastAndroid.SHORT,
        ToastAndroid.CENTER
      );
    } catch (err) {
      ToastAndroid.showWithGravity(
        "Couldn't save image",
        ToastAndroid.SHORT,
        ToastAndroid.CENTER
      );
      console.log("FS Err: ", err);
    }
  };

  const copyImage = () => {
    fetch(url)
      .then((r) => r.blob())
      .then((blob) => {
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = () => {
          const base64data = reader.result.toString().split(",")[1];
          setImageAsync(base64data.toString()).catch((err) =>
            console.log("Copy err: ", err)
          );
        };
      });
  };

  const saveFile = async (fileUri) => {
    const shouldAsk =
      permissionResponse?.granted === false &&
      permissionResponse?.canAskAgain === true;
    const saveToAlbum = async () => {
      try {
        const asset = await createAssetAsync(fileUri);
        const album = await getAlbumAsync("Arctius");
        if (album === null) {
          await createAlbumAsync("Arctius", asset, false);
        } else {
          await addAssetsToAlbumAsync([asset], album, false);
        }
      } catch (err) {
        console.log("Save err: ", err);
      }
    };
    if (shouldAsk) {
      askForPermission().then(async (res) => {
        if (res.status === "granted") {
          void saveToAlbum();
        } else if (res.status === "denied") {
          alert("please allow permissions to download");
        }
      });
    } else {
      void saveToAlbum();
    }
  };
  return (
    <ImageView
      images={[{ uri: url }]}
      imageIndex={0}
      visible={visible}
      onRequestClose={() => setIsVisible(false)}
      FooterComponent={() => (
        <View style={{ ...styles.imgHeader, backgroundColor: colors.card }}>
          <Text lines={1} style={{ fontSize: 14 }}>
            {safeName}
          </Text>
          <View style={{ flexDirection: "row", gap: 16 }}>
            <TouchableOpacity onPressCb={shareImage} simple>
              <Icon
                name={"share-2"}
                accessibilityLabel={"share post button"}
                size={24}
              />
            </TouchableOpacity>
            <TouchableOpacity simple onPressCb={copyImage}>
              <Icon
                name={"copy"}
                accessibilityLabel={"copy post button"}
                size={24}
              />
            </TouchableOpacity>
            <TouchableOpacity onPressCb={handleDownload} simple>
              <Icon
                name={"download"}
                accessibilityLabel={"download post button"}
                size={24}
              />
            </TouchableOpacity>
          </View>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  imgHeader: {
    padding: 12,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 16,
  },
});

export default ImageViewer;
