import React from "react";
import { ViewStyle } from "react-native";

import { Feather } from "@expo/vector-icons";
import { useTheme } from "@react-navigation/native";

interface Props {
  name: keyof typeof Feather.glyphMap;
  style?: ViewStyle;
  size: number;
  color?: string;
  accessibilityLabel?: string;
}

export default function Icon({
  accessibilityLabel,
  name,
  size,
  color,
  style,
}: Props) {
  const { colors } = useTheme();

  return (
    <Feather
      accessibilityLabel={accessibilityLabel}
      style={style}
      name={name}
      size={size}
      color={color || colors.primary}
    />
  );
}
