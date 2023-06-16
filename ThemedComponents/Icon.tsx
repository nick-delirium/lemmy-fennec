import { Feather } from "@expo/vector-icons";
import React from "react";
import { useTheme } from "@react-navigation/native";

interface Props {
  name: keyof typeof Feather.glyphMap,
  size: number,
  color?: string
}

export default function Icon({ name, size, color }: Props) {
  const { colors } = useTheme();

  return (
    <Feather name={name} size={size} color={color || colors.primary} />
  )
}