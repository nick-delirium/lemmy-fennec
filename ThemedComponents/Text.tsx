import React from "react";
import { Text, TextStyle } from "react-native";

import { useTheme } from "@react-navigation/native";
import { AccessibilityRole } from "react-native/Libraries/Components/View/ViewAccessibility";

interface Props {
  style?: TextStyle;
  customColor?: string;
  lines?: number;
  children: React.ReactNode;
  selectable?: boolean;
  accessibilityHint?: string;
  accessibilityLabel?: string;
  accessibilityRole?: AccessibilityRole;
  onPress?: () => void;
}

export default function ThemedText({
  style,
  children,
  lines,
  customColor,
  selectable,
  accessibilityHint,
  accessibilityLabel,
  accessibilityRole,
  onPress,
}: Props) {
  const { colors } = useTheme();

  return (
    <Text
      style={{ color: customColor ? customColor : colors.text, ...style }}
      numberOfLines={lines}
      allowFontScaling
      onPress={onPress}
      accessibilityHint={accessibilityHint}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole={accessibilityRole ?? "text"}
      selectable={selectable}
      maxFontSizeMultiplier={10}
    >
      {children}
    </Text>
  );
}
