import React from "react";
import { observer } from "mobx-react-lite";
import { StyleSheet, ViewStyle, Pressable } from "react-native";
import { useTheme } from "@react-navigation/native";
import { impactAsync, ImpactFeedbackStyle } from "expo-haptics";
import { preferences } from "../store/preferences";

interface Props {
  isOutlined?: boolean;
  style?: ViewStyle;
  children: React.ReactNode;
  isSecondary?: boolean;
  simple?: boolean;
  still?: boolean;
  feedback?: boolean;
  [key: string]: any;
}

interface PressProps extends Props {
  onPressCb: () => void;
}

interface LongPressProps extends Props {
  onLongPress: () => void;
}

function ThemedTouchableOpacity(props: PressProps | LongPressProps) {
  const { colors } = useTheme();

  const onPress = () => {
    if (!preferences.hapticsOff && props.feedback) {
      void impactAsync(ImpactFeedbackStyle.Light);
    }
    props.onPressCb();
  };

  const onLongPress = () => {
    if (!preferences.hapticsOff && props.feedback) {
      void impactAsync(ImpactFeedbackStyle.Light);
    }
    props.onLongPress();
  };

  return (
    <Pressable
      role={"button"}
      onLongPress={props.onLongPress ? onLongPress : undefined}
      onPress={props.onPressCb ? onPress : undefined}
      style={({ pressed }) =>
        props.simple
          ? {
              opacity: pressed && !props.still ? 0.5 : 1,
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
              opacity: pressed && !props.still ? 0.5 : 1,
              ...props.style,
            }
      }
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

export default observer(ThemedTouchableOpacity);
