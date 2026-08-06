import React from "react";
import { StyleSheet, View } from "react-native";

import { observer } from "mobx-react-lite";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { preferences } from "../store/preferences";

const BOTTOM = 21;
const ELEVATED_BOTTOM = 64; // when input added
const SIDE = 16;

function FAB({
  children,
  elevated,
}: {
  children: React.ReactNode;
  elevated?: boolean;
}) {
  // navigators that own the bottom edge (the tab bar) report a reduced inset
  // here, so this stays correct both inside tabs and on a full-screen stack
  const insets = useSafeAreaInsets();
  const side = SIDE + (preferences.leftHanded ? insets.left : insets.right);
  return (
    <View
      style={{
        ...styles.container,
        bottom: (elevated ? ELEVATED_BOTTOM : BOTTOM) + insets.bottom,
        ...(preferences.leftHanded
          ? { left: side, alignItems: "flex-start" }
          : { right: side, alignItems: "flex-end" }),
      }}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    gap: 12,
  },
});

export default observer(FAB);
