import React from "react";
import { Text, TextStyle } from "react-native";
import { useTheme } from "@react-navigation/native";

interface Props {
  style?: TextStyle;
  customColor?: string;
  lines?: number;
  children: React.ReactNode;
}

export default function ThemedText({
  style,
  children,
  lines,
  customColor,
}: Props) {
  const { colors } = useTheme();

  return (
    <Text
      style={{ color: customColor ? customColor : colors.text, ...style }}
      numberOfLines={lines}
    >
      {children}
    </Text>
  );
}
