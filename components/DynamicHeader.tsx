import React from "react";
import { Animated, StyleSheet, View } from "react-native";

import { useTheme } from "@react-navigation/native";

import { Text } from "../ThemedComponents";

const MAX_HEIGHT = 56;
const MIN_HEIGHT = 0;
const scrollDistance = MAX_HEIGHT - MIN_HEIGHT;

interface IProps {
  animHeaderValue: Animated.Value;
  title: string;
  rightAction?: React.ReactNode;
  leftAction?: React.ReactNode;
}

const DynamicHeader = ({
  animHeaderValue,
  title,
  rightAction,
  leftAction,
}: IProps) => {
  const { colors } = useTheme();
  const animatedHeaderHeight = animHeaderValue.interpolate({
    inputRange: [0, scrollDistance],
    outputRange: [MAX_HEIGHT, MIN_HEIGHT],
    extrapolate: "clamp",
  });
  const animateHeaderBackgroundColor = animHeaderValue.interpolate({
    inputRange: [0, scrollDistance],
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
      {leftAction}
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
