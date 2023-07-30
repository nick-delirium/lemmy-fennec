import { TextInput, TextStyle, StyleSheet } from "react-native";
import React from "react";
import { useTheme } from "@react-navigation/native";

interface Props {
  style?: TextStyle;
  [key: string]: any;
}

function ThemedTextInput(props: Props, ref: any) {
  const { colors } = useTheme();

  return (
    <TextInput
      ref={ref}
      {...props}
      placeholderTextColor={colors.border}
      style={{
        ...ownStyle.input,
        ...props.style,
        borderColor: colors.primary,
        color: colors.text,
      }}
    />
  );
}

const ownStyle = StyleSheet.create({
  input: {
    width: "100%",
    padding: 8,
    borderRadius: 6,
    borderWidth: 1,
  },
});

export default React.forwardRef(ThemedTextInput);
