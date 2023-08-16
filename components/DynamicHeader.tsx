import React from "react";
import { Animated, StyleSheet, View } from "react-native";

import { useTheme } from "@react-navigation/native";

import { Text } from "../ThemedComponents";

const Max_Header_Height = 56;
const Min_Header_Height = 0;
const Scroll_Distance = Max_Header_Height - Min_Header_Height;

const DynamicHeader = ({ animHeaderValue, title, rightAction }) => {
  const { colors } = useTheme();
  const animatedHeaderHeight = animHeaderValue.interpolate({
    inputRange: [0, Scroll_Distance],
    outputRange: [Max_Header_Height, Min_Header_Height],
    extrapolate: "clamp",
  });
  const animateHeaderBackgroundColor = animHeaderValue.interpolate({
    inputRange: [0, Scroll_Distance],
    outputRange: [colors.card, colors.background],
    extrapolate: "clamp",
  });
  return (
    <Animated.View
      style={[
        styles.header,
        {
          height: animatedHeaderHeight,
          backgroundColor: animateHeaderBackgroundColor,
        },
      ]}
    >
      <Text style={styles.headerText}>{title}</Text>
      <View style={{ flex: 1 }} />
      {rightAction}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    width: "100%",
    position: "absolute",
    top: 0,
    left: 0,
    zIndex: 100,
    elevation: 100,
  },
  headerText: {
    fontSize: 20,
    fontWeight: "500",
    paddingHorizontal: 16,
  },
});

export default DynamicHeader;
