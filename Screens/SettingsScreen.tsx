import React from "react";
import { StyleSheet, View } from "react-native";

import { observer } from "mobx-react-lite";

import { Icon, Text, TouchableOpacity } from "../ThemedComponents";
import { apiClient } from "../store/apiClient";

function Settings({ navigation }) {
  return (
    <View style={{ flex: 1, padding: 12, gap: 12 }}>
      <TouchableOpacity
        simple
        onPressCb={() => navigation.navigate("Looks")}
        style={styles.row}
      >
        <Icon name={"layout"} size={24} />
        <Text style={styles.text}>Look and feel</Text>
      </TouchableOpacity>
      <TouchableOpacity
        simple
        onPressCb={() => navigation.navigate("Behavior")}
        style={styles.row}
      >
        <Icon name={"cpu"} size={24} />
        <Text style={styles.text}>Behavior</Text>
      </TouchableOpacity>
      {apiClient.isLoggedIn ? (
        <>
          <TouchableOpacity
            simple
            onPressCb={() => navigation.navigate("ProfileSettings")}
            style={styles.row}
          >
            <Icon name={"user"} size={24} />
            <Text style={styles.text}>Profile settings</Text>
          </TouchableOpacity>
          <TouchableOpacity
            simple
            style={styles.row}
            onPressCb={() => navigation.navigate("Blocks")}
          >
            <Icon name={"eye-off"} size={24} />
            <Text>Blocks</Text>
          </TouchableOpacity>
        </>
      ) : null}
      <TouchableOpacity
        style={{ ...styles.row, marginTop: 32 }}
        simple
        onPressCb={() => navigation.navigate("Debug")}
      >
        <Icon name={"terminal"} size={24} />
        <Text>Show network debug log</Text>
      </TouchableOpacity>
      <Text style={{ color: "#aaaaaa", fontSize: 12 }}>
        Make sure to report issues and suggest your ideas in our community.
      </Text>
      <Text style={{ color: "#aaaaaa", fontSize: 12 }}>
        This app is an Open Source software released under GNU AGPLv3 license,
        {"\n"}
        it does not store, process or send your personal information.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  text: {
    fontSize: 16,
  },
});

export default observer(Settings);
