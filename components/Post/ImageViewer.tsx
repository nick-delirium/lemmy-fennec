import React from "react";
import { StyleSheet, View } from "react-native";
import { Icon, Text, TouchableOpacity } from "../../ThemedComponents";
import ImageView from "react-native-image-viewing";
import { useTheme } from "@react-navigation/native";

interface Props {
  url: string;
  name: string;
  visible: boolean;
  setIsVisible: React.Dispatch<React.SetStateAction<boolean>>;
  shareImage: () => void;
}

function ImageViewer({ url, name, visible, setIsVisible, shareImage }) {
  const { colors } = useTheme();
  const safeName = name.length > 50 ? name.slice(0, 40) + "..." : name;
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
