import React from "react";
import { observer } from "mobx-react-lite";
import { StyleSheet, Switch, View } from "react-native";
import { Text } from "../ThemedComponents";
import { apiClient } from "../store/apiClient";

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
    apiClient.profileStore.setBlurNsfw(!apiClient.profileStore.unblurNsfw);
  };

  const toggleLeftHanded = () => {
    apiClient.profileStore.setLeftHanded(!apiClient.profileStore.leftHanded);
  };
  return (
    <View style={styles.container}>
      <Toggler
        useLogin
        label={"Hide NSFW posts?"}
        value={!profile?.local_user.show_nsfw}
        onValueChange={toggleNSFW}
      />
      <Toggler
        label={"Blur NSFW posts?"}
        value={!apiClient.profileStore.unblurNsfw}
        onValueChange={toggleBlurNsfw}
      />
      <Toggler
        useLogin
        label={"Hide read posts?"}
        value={!profile?.local_user.show_read_posts}
        onValueChange={toggleReadPosts}
      />
      <Toggler
        useLogin
        label={"Mark posts read while scrolling?"}
        value={apiClient.profileStore.readOnScroll}
        onValueChange={() =>
          apiClient.profileStore.setReadOnScroll(
            !apiClient.profileStore.readOnScroll
          )
        }
      />
      <Toggler
        label={"Left handed layout?"}
        value={apiClient.profileStore.leftHanded}
        onValueChange={toggleLeftHanded}
      />
      <Toggler
        label={"Collapse parent comments?"}
        value={apiClient.profileStore.collapseParentComment}
        onValueChange={() =>
          apiClient.profileStore.setCollapseParentComment(
            !apiClient.profileStore.collapseParentComment
          )
        }
      />
    </View>
  );
}

function Toggler({
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
});

export default observer(SettingsScreen);
