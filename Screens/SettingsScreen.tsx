import React from "react";
import { observer } from "mobx-react-lite";
import {
  ActivityIndicator,
  StyleSheet,
  Switch,
  View,
  Dimensions,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { Text } from "../ThemedComponents";
import { apiClient } from "../store/apiClient";
import { preferences, Theme, ThemeMap } from "../store/preferences";
import { useTheme } from "@react-navigation/native";

function SettingsScreen() {
  const { localUser: profile } = apiClient.profileStore;

  const toggleReadPosts = () => {
    void apiClient.profileStore.updateSettings({
      auth: apiClient.loginDetails.jwt,
      show_read_posts: !profile.local_user.show_read_posts,
    });
  };
  const toggleNSFW = () => {
    void apiClient.profileStore.updateSettings({
      auth: apiClient.loginDetails.jwt,
      show_nsfw: !profile.local_user.show_nsfw,
    });
  };
  const toggleBlurNsfw = () => {
    preferences.setBlurNsfw(!preferences.unblurNsfw);
  };

  const toggleLeftHanded = () => {
    preferences.setLeftHanded(!preferences.leftHanded);
  };
  return (
    <View style={styles.container}>
      <Text style={styles.title}>App Behavior</Text>
      <Toggler
        label={"Blur NSFW posts"}
        value={!preferences.unblurNsfw}
        onValueChange={toggleBlurNsfw}
      />
      <Toggler
        useLogin
        label={"Mark posts read while scrolling"}
        value={preferences.readOnScroll}
        onValueChange={() =>
          preferences.setReadOnScroll(!preferences.readOnScroll)
        }
      />
      <Toggler
        label={"Left handed layout"}
        value={preferences.leftHanded}
        onValueChange={toggleLeftHanded}
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
      <ThemePicker />

      <Text style={styles.title}>Account Settings</Text>
      <Toggler
        useLogin
        label={"Hide read posts"}
        value={!profile?.local_user.show_read_posts}
        onValueChange={toggleReadPosts}
      />
      <Toggler
        useLogin
        label={"Hide NSFW posts"}
        value={!profile?.local_user.show_nsfw}
        onValueChange={toggleNSFW}
      />

      {apiClient.profileStore.isLoading ? (
        <View
          style={{
            position: "absolute",
            width: Dimensions.get("window").width,
            height: Dimensions.get("window").height,
            top: 0,
            left: 0,
            flex: 1,
            backgroundColor: "rgba(255,255,255, 0.15)",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 10,
            elevation: 10,
          }}
        >
          <ActivityIndicator accessibilityHint={"user settings are fetching"} />
        </View>
      ) : null}
    </View>
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

export default observer(SettingsScreen);
