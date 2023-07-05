import React from "react";
import { useTheme } from "@react-navigation/native";
import { View, StyleSheet } from "react-native";
import { Text, TouchableOpacity } from "../ThemedComponents";

function Pagination({ prevPage, nextPage, itemsLength, page }) {
  const { colors } = useTheme();
  return (
    <View style={styles.paddedRow}>
      {page > 1 ? (
        <TouchableOpacity onPressCb={prevPage}>
          <Text>Previous page</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={{ backgroundColor: colors.card }}
          onPressCb={() => null}
        >
          <Text>Previous page</Text>
        </TouchableOpacity>
      )}
      {itemsLength > 0 ? (
        <TouchableOpacity onPressCb={nextPage}>
          <Text>Next page</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={{ backgroundColor: colors.card }}
          onPressCb={() => null}
        >
          <Text>Next page</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  paddedRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
});

export default Pagination;
