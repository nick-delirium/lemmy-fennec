import React from "react";
import { StyleSheet, View } from "react-native";
import { Icon, Text, TouchableOpacity } from "../../ThemedComponents";
import ImageView from "react-native-image-viewing";
import { useTheme } from "@react-navigation/native";
import {
  createAssetAsync,
  getAlbumAsync,
  createAlbumAsync,
  addAssetsToAlbumAsync,
  usePermissions,
} from "expo-media-library";
import { documentDirectory, downloadAsync } from "expo-file-system";

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
      void saveFile(res.uri);
    } catch (err) {
      console.log("FS Err: ", err);
    }
  };

  const saveFile = async (fileUri) => {
    const shouldAsk =
      permissionResponse?.granted === false &&
      permissionResponse?.canAskAgain === true;
    const saveToAlbum = async () => {
      try {
        const asset = await createAssetAsync(fileUri);
        const album = await getAlbumAsync("Fennec");
        if (album === null) {
          await createAlbumAsync("Fennec", asset, false);
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
          <TouchableOpacity onPressCb={shareImage} simple>
            <Icon
              name={"share-2"}
              accessibilityLabel={"share post button"}
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
      )}
    />
  );
}

const styles = StyleSheet.create({
  imgHeader: {
    padding: 12,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    gap: 16,
  },
});

export default ImageViewer;
