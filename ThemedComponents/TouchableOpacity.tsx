import React from "react";
import { StyleSheet, ViewStyle, TouchableOpacity } from "react-native";
import { useTheme } from "@react-navigation/native";

interface Props {
  isOutlined?: boolean
  onPressCb: () => void
  style?: ViewStyle
  children: React.ReactNode

  [key: string]: any
}

function ThemedTouchableOpacity(props: Props) {
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      style={{
        ...styleSheet.button, ...props.style,
        borderColor: props.isOutlined ? colors.primary : '',
        borderWidth: props.isOutlined ? 1 : 0,
        backgroundColor: props.isOutlined ? '' : colors.primary
      }}
      onPress={props.onPressCb}
    >
      {props.children}
    </TouchableOpacity>
  )
}

const styleSheet = StyleSheet.create({
  button: {
    borderRadius: 6,
    alignItems: 'center',
    padding: 8,
  }
})

export default ThemedTouchableOpacity;