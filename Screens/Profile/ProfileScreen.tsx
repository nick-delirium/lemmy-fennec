import React from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { observer } from "mobx-react-lite";
import { apiClient } from "../../store/apiClient";
import UserRow from "./UserRow";
import UserRating from "./UserRating";
import Settings from "./Settings";
import Counters from "./Counters";
import Bio from "./Bio";

// even though its actually inside tab, main nav context is a stack right now
function Profile({ navigation }: NativeStackScreenProps<any, "Profile">) {
  const { localUser: profile } = apiClient.profileStore;

  React.useEffect(() => {
    if (apiClient.isLoggedIn === false) {
      navigation.replace("Login");
    } else {
      if (!profile) {
        reload();
      }
    }
  }, [navigation, apiClient.isLoggedIn]);

  const reload = () => {
    void apiClient.getGeneralData();
  };

  if (!profile || apiClient.profileStore.isLoading) {
    return (
      <View>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <UserRow person={profile.person} />
      <UserRating counts={profile.counts} />
      <Bio profile={profile} />
      <Counters profile={profile} />

      <Settings navigation={navigation} />
    </View>
  );
}

// todo: settings, posts, comments, profile editing

const styles = StyleSheet.create({
  container: {
    padding: 12,
    gap: 12,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
});

export default observer(Profile);
