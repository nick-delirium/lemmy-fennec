import React from "react";
import { View, StyleSheet } from "react-native";
import { observer } from "mobx-react-lite";
import { apiClient } from "../store/apiClient";

function FAB({
  children,
  elevated,
}: {
  children: React.ReactNode;
  elevated?: boolean;
}) {
  const position = apiClient.profileStore.leftHanded
    ? styles.leftButton
    : styles.rightButton;
  return <View style={{ ...styles.container, ...position }}>{children}</View>;
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 21,
    gap: 12,
  },
  elevated: { bottom: 84 }, // when input added
  leftButton: { left: 16, alignItems: "flex-start" },
  rightButton: { right: 16, alignItems: "flex-end" },
});

export default observer(FAB);
