import React from "react";
import { Text, TextStyle } from "react-native";
import { useTheme } from "@react-navigation/native";

interface Props {
  style?: TextStyle;
  customColor?: string;
  lines?: number;
  children: React.ReactNode;
  selectable?: boolean;
}

export default function ThemedText({
  style,
  children,
  lines,
  customColor,
  selectable,
}: Props) {
  const { colors } = useTheme();

  return (
    <Text
      style={{ color: customColor ? customColor : colors.text, ...style }}
      numberOfLines={lines}
      allowFontScaling
      selectable={selectable}
      maxFontSizeMultiplier={10}
    >
      {children}
    </Text>
  );
}
