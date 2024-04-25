import React from "react";
import {
  ActivityIndicator,
  Dimensions,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

import { useTheme } from "@react-navigation/native";
import { observer } from "mobx-react-lite";

import { Text, TextInput, TouchableOpacity } from "../../ThemedComponents";
import { apiClient } from "../../store/apiClient";
import { preferences } from "../../store/preferences";
import { Toggler } from "./Looks";

function Behavior() {
  const [ignoredInst, setIgnoredInst] = React.useState(
    preferences.ignoredInstances.join(", ")
  );
  const { localUser: profile } = apiClient.profileStore;
  const { colors } = useTheme();

  const toggleReadPosts = () => {
    if (!apiClient.loginDetails?.jwt) return;
    void apiClient.profileStore.updateSettings({
      show_read_posts: !profile.local_user.show_read_posts,
    });
  };
  const toggleNSFW = () => {
    if (!apiClient.loginDetails?.jwt) return;
    void apiClient.profileStore.updateSettings({
      show_nsfw: !profile.local_user.show_nsfw,
    });
  };
  const toggleBlurNsfw = () => {
    preferences.setBlurNsfw(!preferences.unblurNsfw);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
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
        label={"Data saving mode"}
        value={preferences.lowTrafficMode}
        onValueChange={() =>
          preferences.setLowTrafficMode(!preferences.lowTrafficMode)
        }
      />
      <Text
        style={{
          fontSize: 12,
          opacity: 0.6,
          marginTop: -6,
        }}
      >
        App will not load media unless you open it.
      </Text>

      {apiClient.isLoggedIn ? (
        <>
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
        </>
      ) : null}

      <Text style={{ ...styles.title, marginBottom: 8 }}>
        Ignored instances
      </Text>
      <TextInput
        placeholder={`I.e "nsfw.com, ilovespez.xyz, testinst"`}
        value={ignoredInst}
        onChangeText={setIgnoredInst}
        autoCapitalize={"none"}
        autoCorrect={false}
        placeholderTextColor={colors.border}
        keyboardType="default"
        multiline
        accessibilityLabel={"Ignored instances input"}
      />
      <Text
        style={{
          fontSize: 12,
          opacity: 0.6,
        }}
      >
        Instances or trigger words separated by comma.
        {"\n"}
        If substring will be matched in post's ap_id, it will be filtered out.
        {"\n"}
        Example ap_id: https://lemmy.world/c/communityname
      </Text>
      <TouchableOpacity
        feedback
        onPressCb={() =>
          preferences.setIgnoredInstances(ignoredInst.split(", "))
        }
      >
        <Text>Save Ignored Instances</Text>
      </TouchableOpacity>

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
    </ScrollView>
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
  title: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
});

export default observer(Behavior);
