import { Feather } from "@expo/vector-icons";
import React from "react";
import { useTheme } from "@react-navigation/native";
import { ViewStyle } from "react-native";

interface Props {
  name: keyof typeof Feather.glyphMap,
  style?: ViewStyle,
  size: number,
  color?: string
}

export default function Icon({ name, size, color, style }: Props) {
  const { colors } = useTheme();

  return (
    <Feather style={style} name={name} size={size} color={color || colors.primary} />
  )
}