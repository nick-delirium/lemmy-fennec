import React from "react";
import { observer } from "mobx-react-lite";
import { View, FlatList, StyleSheet } from "react-native";
import { Text } from "../../ThemedComponents";

function Messages() {
  return (
    <FlatList
      data={[]}
      renderItem={Message}
      ListEmptyComponent={
        <View style={styles.emptyContainer}>
          <Text style={styles.empty}>
            Feeling lonely? Try using web interface, while this area is under
            construction.
          </Text>
        </View>
      }
    />
  );
}

function Message() {
  return (
    <View>
      <Text>Test</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  emptyContainer: {
    flex: 1,
    padding: 12,
  },
  empty: {
    fontSize: 16,
  },
});

export default observer(Messages);
