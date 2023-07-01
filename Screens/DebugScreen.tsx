import React from "react";
import { observer } from "mobx-react-lite";
import { View, FlatList } from "react-native";
import { debugStore } from "../store/debugStore";
import { Text } from "../ThemedComponents";

function DebugScreen() {
  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={debugStore.errors}
        removeClippedSubviews={false}
        ListEmptyComponent={<Text>All good so far!</Text>}
        renderItem={({ item }) => (
          <Text
            lines={5}
            selectable
            style={{ borderBottomWidth: 1, borderBottomColor: "violet" }}
          >
            {item}
          </Text>
        )}
      />
    </View>
  );
}

export default observer(DebugScreen);
