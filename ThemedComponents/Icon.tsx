import { Feather } from "@expo/vector-icons";
import React from "react";
import { useTheme } from "@react-navigation/native";
import { ViewStyle } from "react-native";

interface Props {
  name: keyof typeof Feather.glyphMap,
  style?: ViewStyle,
  size: number,
  color?: string
  accessibilityLabel?: string
}

export default function Icon({ accessibilityLabel, name, size, color, style }: Props) {
  const { colors } = useTheme();

  return (
    <Feather accessibilityLabel={accessibilityLabel} style={style} name={name} size={size} color={color || colors.primary} />
  )
}