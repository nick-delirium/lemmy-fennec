import React from "react";
import { StyleSheet, View, ViewStyle } from "react-native";

import { useActionSheet } from "@expo/react-native-action-sheet";
import { useTheme } from "@react-navigation/native";

import { Icon, Text, TouchableOpacity } from "../ThemedComponents";

export interface SelectOption<T> {
  label: string;
  value: T;
}

/**
 * A value picker that only opens on press.
 *
 * Replaces @react-native-picker/picker, which on iOS renders an always-visible
 * inline wheel rather than a dropdown — two of them side by side on the search
 * screen took over most of the view. The action sheet is the native idiom on
 * both platforms and collapses to a single row when closed.
 */
function Select<T extends string | number>({
  value,
  options,
  onChange,
  title,
  style,
  accessibilityLabel,
}: {
  value: T;
  options: readonly SelectOption<T>[];
  onChange: (value: T) => void;
  /** Heading shown above the options. */
  title?: string;
  style?: ViewStyle;
  accessibilityLabel?: string;
}) {
  const { colors } = useTheme();
  const { showActionSheetWithOptions } = useActionSheet();

  const selected = options.find((option) => option.value === value);

  const open = () => {
    const labels = options.map((option) => option.label);
    showActionSheetWithOptions(
      {
        options: [...labels, "Cancel"],
        cancelButtonIndex: labels.length,
        title,
        textStyle: { color: colors.text },
        titleTextStyle: { color: colors.text, opacity: 0.6 },
        containerStyle: { backgroundColor: colors.card },
      },
      (index) => {
        // undefined on dismiss, and the last entry is Cancel
        if (index === undefined || index >= options.length) return;
        onChange(options[index].value);
      },
    );
  };

  return (
    <TouchableOpacity
      simple
      onPressCb={open}
      accessibilityLabel={accessibilityLabel ?? title}
    >
      <View
        style={{
          ...styles.field,
          borderColor: colors.border,
          backgroundColor: colors.card,
          ...style,
        }}
      >
        <Text lines={1} style={styles.value}>
          {selected?.label ?? ""}
        </Text>
        <Icon name={"chevron-down"} size={16} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  field: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 6,
    borderWidth: 1,
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  value: { flexShrink: 1 },
});

export default Select;
