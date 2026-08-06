import React from "react";
import { Animated, StyleSheet, View } from "react-native";

import { useTheme } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Text } from "../ThemedComponents";

/** Height of the header's own content, excluding the status bar inset. */
export const HEADER_HEIGHT = 56;
const MAX_HEIGHT = HEADER_HEIGHT;
const MIN_HEIGHT = 0;
const scrollDistance = MAX_HEIGHT - MIN_HEIGHT;

/**
 * How much vertical room the header occupies. The header is absolutely
 * positioned, so screens need this to offset their first list item — otherwise
 * content starts underneath it.
 */
export function useHeaderOffset() {
  return HEADER_HEIGHT + useSafeAreaInsets().top;
}

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
  const insets = useSafeAreaInsets();
  // the status bar / dynamic island strip is added on top of the header's own
  // height and is never collapsed, so the title can't slide under the island
  const animatedHeaderHeight = animHeaderValue.interpolate({
    inputRange: [0, scrollDistance],
    outputRange: [MAX_HEIGHT + insets.top, MIN_HEIGHT + insets.top],
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
          paddingTop: insets.top,
          paddingLeft: insets.left,
          paddingRight: insets.right,
        },
      ]}
    >
      {leftAction}
      {/* one line, shrinkable: the post screen passes the post title, and a long
          one wrapped inside the fixed-height header and pushed rightAction out */}
      <Text lines={1} style={styles.headerText}>
        {title}
      </Text>
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
    flexShrink: 1,
  },
});

export default DynamicHeader;
