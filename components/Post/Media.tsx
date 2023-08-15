import React from "react";
import { Image, Share, StyleSheet, View } from "react-native";

import { useTheme } from "@react-navigation/native";
import { observer } from "mobx-react-lite";

import { Icon, Text, TouchableOpacity } from "../../ThemedComponents";
import { preferences } from "../../store/preferences";
import ImageViewer from "./ImageViewer";

interface Props {
  url: string;
  name: string;
  isNsfw: boolean;
  small?: boolean;
}

function Media({ url, name, isNsfw, small }: Props) {
  const [visible, setIsVisible] = React.useState(false);
  const { colors } = useTheme();
  const shareImage = () => {
    void Share.share({
      url: url,
      message: url,
      title: "Share post image",
    });
  };

  const imgStyle = React.useMemo(() => {
    return small ? styles.postSmallImg : styles.postImg;
  }, [small]);
  const containerStyle = React.useMemo(() => {
    return small ? styles.noImageSmall : styles.noImage;
  }, [small]);

  return (
    <>
      <ImageViewer
        url={url}
        name={name}
        visible={visible}
        setIsVisible={setIsVisible}
        shareImage={shareImage}
      />
      <TouchableOpacity onPressCb={() => setIsVisible(true)} simple>
        {preferences.lowTrafficMode ? (
          <View style={{ ...containerStyle, backgroundColor: colors.card }}>
            <Icon name={"image"} size={32} />
            {!small ? (
              <>
                <Text style={styles.text}>Low data mode enabled</Text>
                <Text style={styles.text}>Tap to view image</Text>
              </>
            ) : null}
          </View>
        ) : (
          <Image
            source={{ uri: url }}
            style={imgStyle}
            progressiveRenderingEnabled
            resizeMode={"contain"}
            alt={"Image for post" + name}
            accessibilityLabel={"Image for post" + name}
            blurRadius={isNsfw && !preferences.unblurNsfw ? 55 : 0}
          />
        )}
      </TouchableOpacity>
    </>
  );
}

const styles = StyleSheet.create({
  postImg: { width: "100%", height: 340 },
  noImage: {
    width: "100%",
    height: 340,
    flexDirection: "column",
    gap: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  noImageSmall: {
    width: 80,
    height: 80,
    borderRadius: 8,
    flexDirection: "column",
    gap: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    fontSize: 16,
    opacity: 0.8,
  },
  postSmallImg: { width: 80, height: 80, borderRadius: 8 },
});

export default observer(Media);
