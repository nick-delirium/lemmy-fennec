import React from "react";
import { View, StyleSheet } from "react-native";
import { observer } from "mobx-react-lite";
import { preferences } from "../store/preferences";

function FAB({
  children,
  elevated,
}: {
  children: React.ReactNode;
  elevated?: boolean;
}) {
  const position = preferences.leftHanded
    ? styles.leftButton
    : styles.rightButton;
  const verticalPosition = elevated ? styles.elevated : {};
  return (
    <View style={{ ...styles.container, ...position, ...verticalPosition }}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 21,
    gap: 12,
  },
  elevated: { bottom: 64 }, // when input added
  leftButton: { left: 16, alignItems: "flex-start" },
  rightButton: { right: 16, alignItems: "flex-end" },
});

export default observer(FAB);
