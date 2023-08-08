import React from "react";
import {
  Linking,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
  Image,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { observer } from "mobx-react-lite";
import { apiClient } from "../../store/apiClient";
import UserRow from "./UserRow";
import UserRating from "./UserRating";
import Counters from "./Counters";
import Bio from "./Bio";
import { Icon, TouchableOpacity, Text } from "../../ThemedComponents";
import { asyncStorageHandler } from "../../asyncStorage";
import { useTheme } from "@react-navigation/native";
import AccountPicker from "../../components/AccountPicker/AccountPicker";

// even though its actually inside tab, main nav context is a stack right now
function Profile({ navigation }: NativeStackScreenProps<any, "Profile">) {
  const { localUser: profile } = apiClient.profileStore;
  const { colors } = useTheme();

  React.useEffect(() => {
    if (!profile) {
      reload();
    } else {
      void apiClient.profileStore.getProfile(apiClient.loginDetails, {
        person_id: profile.local_user.person_id,
        sort: "New",
        page: 1,
        limit: 30,
      });
    }
  }, [profile]);

  const reload = () => {
    void apiClient.getGeneralData();
  };

  const logoutHandler = () => {
    const accounts = apiClient.accounts.filter((a) => {
      return JSON.parse(a.auth).jwt !== apiClient.loginDetails.jwt;
    });
    apiClient.setAccounts(accounts);
    asyncStorageHandler.logout();
    apiClient.profileStore.setLocalUser(null);
    apiClient.setLoginState(false);
    apiClient.setLoginDetails(null);
    navigation.replace("Home");
  };

  const hasBanner = Boolean(profile?.person?.banner);
  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={apiClient.profileStore.isLoading}
          onRefresh={reload}
        />
      }
    >
      {profile ? (
        <View style={{ gap: 8 }}>
          {hasBanner ? (
            <Image
              resizeMode={"cover"}
              source={{ uri: profile.person.banner }}
              style={{
                width: "100%",
                height: 120,
              }}
            />
          ) : null}
          <UserRow hasBanner={hasBanner} person={profile.person} />
          <ScrollView
            horizontal={true}
            contentContainerStyle={{ width: "100%", height: "100%" }}
          >
            <Bio profile={profile} />
          </ScrollView>
          <UserRating counts={profile.counts} />
          <Counters profile={profile} />
        </View>
      ) : null}
      <View style={{ gap: 8, marginTop: 32 }}>
        <TouchableOpacity
          simple
          onPressCb={() => navigation.navigate("Settings")}
          style={styles.row}
        >
          <Icon name={"settings"} size={24} />
          <Text>Settings</Text>
        </TouchableOpacity>
        {apiClient.isLoggedIn ? (
          <TouchableOpacity
            simple
            style={styles.row}
            onPressCb={() => navigation.navigate("Blocks")}
          >
            <Icon name={"eye-off"} size={24} />
            <Text>Blocks</Text>
          </TouchableOpacity>
        ) : null}
        <TouchableOpacity
          style={styles.row}
          simple
          onPressCb={() =>
            navigation.navigate("Community", { name: "arctius@lemmy.world" })
          }
        >
          <Icon size={24} name={"message-circle"} />
          <Text
            style={{
              color: colors.border,
              textDecorationLine: "underline",
              textDecorationColor: colors.border,
            }}
          >
            https://lemmy.world/c/arctius
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.row}
          simple
          onPressCb={() =>
            Linking.openURL("https://github.com/nick-delirium/lemmy-fennec")
          }
        >
          <Icon size={24} name={"github"} />
          <Text
            style={{
              color: colors.border,
              textDecorationLine: "underline",
              textDecorationColor: colors.border,
            }}
          >
            Got feedback, issues or suggestions?
          </Text>
        </TouchableOpacity>

        {apiClient.isLoggedIn ? (
          <>
            <TouchableOpacity
              onPressCb={logoutHandler}
              simple
              style={styles.row}
            >
              <Icon size={24} name={"log-out"} />
              <Text
                style={{
                  color: colors.border,
                  textDecorationLine: "underline",
                  textDecorationColor: colors.border,
                }}
              >
                Logout
              </Text>
            </TouchableOpacity>
            <AccountPicker />
          </>
        ) : (
          <View>
            <TouchableOpacity onPressCb={() => navigation.replace("Login")}>
              <Text>Login</Text>
            </TouchableOpacity>
          </View>
        )}
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
    </ScrollView>
  );
}

// todo: settings, posts, comments, profile editing

const styles = StyleSheet.create({
  container: {
    padding: 12,
    gap: 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
});

export default observer(Profile);
