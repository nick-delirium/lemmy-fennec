import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { useTheme } from "@react-navigation/native";
import { observer } from "mobx-react-lite";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { toastStore } from "../store/toastStore";

/**
 * Stand-in for ToastAndroid on platforms that lack it. Rendered once, at the
 * root, above the navigator.
 */
function Toast() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const message = toastStore.message;

  if (!message) return null;
  return (
    <View
      pointerEvents={"none"}
      style={[styles.wrapper, { bottom: 64 + insets.bottom }]}
    >
      <View style={[styles.toast, { backgroundColor: colors.card }]}>
        <Text style={[styles.text, { color: colors.text }]}>{message}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
  },
  toast: {
    maxWidth: "85%",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    opacity: 0.95,
  },
  text: { fontSize: 14, textAlign: "center" },
});

export default observer(Toast);
