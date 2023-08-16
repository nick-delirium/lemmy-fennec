import React from "react";
import { ScrollView, StyleSheet, Switch, View } from "react-native";

import { Picker } from "@react-native-picker/picker";
import { useTheme } from "@react-navigation/native";
import { observer } from "mobx-react-lite";

import { Text } from "../../ThemedComponents";
import { apiClient } from "../../store/apiClient";
import { Theme, ThemeMap, preferences } from "../../store/preferences";

function Looks() {
  const toggleLeftHanded = () => {
    preferences.setLeftHanded(!preferences.leftHanded);
  };
  const toggleVotingButtons = () => {
    preferences.setSwapVotingButtons(!preferences.swapVotingButtons);
  };
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Toggler
        label={"Left handed layout"}
        value={preferences.leftHanded}
        onValueChange={toggleLeftHanded}
      />
      <Toggler
        label={"Swap voting buttons"}
        value={preferences.swapVotingButtons}
        onValueChange={toggleVotingButtons}
      />
      <Toggler
        label={"Collapse parent comments"}
        value={preferences.collapseParentComment}
        onValueChange={() =>
          preferences.setCollapseParentComment(
            !preferences.collapseParentComment
          )
        }
      />
      <Toggler
        label={"Compact post layout in feed"}
        value={preferences.compactPostLayout}
        onValueChange={() =>
          preferences.setPostLayout(!preferences.compactPostLayout)
        }
      />
      <Toggler
        label={"Turn off Haptic Feedback"}
        value={preferences.hapticsOff}
        onValueChange={() => preferences.setHapticsOff(!preferences.hapticsOff)}
      />
      <Toggler
        label={"Use paginated feed"}
        value={preferences.paginatedFeed}
        onValueChange={() =>
          preferences.setPaginatedFeed(!preferences.paginatedFeed)
        }
      />
      <Toggler
        label={"Use dynamic headers"}
        value={!preferences.disableDynamicHeaders}
        onValueChange={() =>
          preferences.setDisableDynamicHeaders(
            !preferences.disableDynamicHeaders
          )
        }
      />
      <ThemePicker />
    </ScrollView>
  );
}

export function Toggler({
  useLogin,
  label,
  value,
  onValueChange,
}: {
  useLogin?: boolean;
  label: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
}) {
  if (useLogin && !apiClient.isLoggedIn) return null;
  return (
    <View style={styles.longRow}>
      <Text>{label}</Text>
      <Switch
        style={{ height: 26 }}
        trackColor={{ false: "#767577", true: "#81b0ff" }}
        value={value}
        onValueChange={onValueChange}
      />
    </View>
  );
}

const ThemePicker = observer(() => {
  const { colors } = useTheme();
  return (
    <View style={styles.longRow}>
      <Text>Theme</Text>
      <Picker
        style={{
          width: "50%",
          color: colors.text,
          borderColor: colors.border,
          borderWidth: 1,
        }}
        selectedValue={preferences.theme}
        mode={"dropdown"}
        accessibilityLabel={"App Theme Picker"}
        dropdownIconColor={colors.text}
        itemStyle={{ color: colors.text, backgroundColor: colors.card }}
        onValueChange={(itemValue) => preferences.setTheme(itemValue)}
      >
        {[Theme.System, Theme.Light, Theme.Dark, Theme.Amoled].map((type) => (
          <Picker.Item key={type} label={ThemeMap[type]} value={type} />
        ))}
      </Picker>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    gap: 12,
    padding: 12,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  longRow: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    justifyContent: "space-between",
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
});

export default observer(Looks);
