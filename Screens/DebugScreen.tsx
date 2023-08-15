import React from "react";
import { FlatList, View } from "react-native";

import { observer } from "mobx-react-lite";

import { Text } from "../ThemedComponents";
import { debugStore } from "../store/debugStore";

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
