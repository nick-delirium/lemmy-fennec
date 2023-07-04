import React from "react";
import { StyleSheet, View } from "react-native";
import { observer } from "mobx-react-lite";
import { apiClient } from "../../store/apiClient";
import UserRow from "../Profile/UserRow";
import UserRating from "../Profile/UserRating";
import Counters from "../Profile/Counters";
import Bio from "../Profile/Bio";

function User() {
  const loadedProfile = apiClient.profileStore.userProfile;
  const profile = loadedProfile?.person_view;

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

export default observer(User);
