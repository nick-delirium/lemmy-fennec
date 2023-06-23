import React from "react";
import { StyleSheet, ViewStyle, Pressable } from "react-native";
import { useTheme } from "@react-navigation/native";

interface Props {
  isOutlined?: boolean;
  onPressCb: () => void;
  style?: ViewStyle;
  children: React.ReactNode;
  isSecondary?: boolean;
  simple?: boolean;

  [key: string]: any;
}

function ThemedTouchableOpacity(props: Props) {
  const { colors } = useTheme();

  return (
    <Pressable
      role={"button"}
      style={({ pressed }) =>
        props.simple
          ? {
              opacity: pressed ? 0.5 : 1,
              ...props.style,
            }
          : {
              ...styleSheet.button,
              borderColor: props.isOutlined ? colors.primary : "",
              borderWidth: props.isOutlined ? 1 : 0,
              backgroundColor: props.isOutlined
                ? ""
                : props.isSecondary
                ? colors.border
                : colors.primary,
              opacity: pressed ? 0.5 : 1,
              ...props.style,
            }
      }
      onPress={props.onPressCb}
    >
      {props.children}
    </Pressable>
  );
}

const styleSheet = StyleSheet.create({
  button: {
    borderRadius: 6,
    alignItems: "center",
    padding: 8,
  },
});

export default ThemedTouchableOpacity;
