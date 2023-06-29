import React from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { observer } from "mobx-react-lite";
import { apiClient } from "../../store/apiClient";
import UserRow from "../Profile/UserRow";
import UserRating from "../Profile/UserRating";
import Counters from "../Profile/Counters";
import Bio from "../Profile/Bio";

function UserScreen({
  navigation,
  route,
}: NativeStackScreenProps<any, "User">) {
  const loadedProfile = apiClient.profileStore.userProfile;
  const profile = loadedProfile?.person_view;

  React.useEffect(() => {
    if (!profile && route.params?.personId) {
      void apiClient.profileStore.getProfile(apiClient.loginDetails, {
        person_id: route.params.personId,
      });
    }
    return () => {
      apiClient.profileStore.setProfile(null);
    };
  }, [route.params.personId]);

  React.useEffect(() => {
    if (profile) {
      navigation.setOptions({
        title: profile.person.name,
      });
    }
  }, [profile]);

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
    </View>
  );
}

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

export default observer(UserScreen);
