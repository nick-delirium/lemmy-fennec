import React from "react";
import { Image, StyleSheet, View } from "react-native";
import { observer } from "mobx-react-lite";
import { apiClient } from "../../store/apiClient";
import UserRow from "../Profile/UserRow";
import UserRating from "../Profile/UserRating";
import Counters from "../Profile/Counters";
import Bio from "../Profile/Bio";
import { Text, TouchableOpacity } from "../../ThemedComponents";
import { useNavigation } from "@react-navigation/native";
import { makeDateString } from "../../utils/utils";

function User() {
  const navigation = useNavigation();
  const loadedProfile = apiClient.profileStore.userProfile;
  const profile = loadedProfile?.person_view;
  const isBlocked =
    apiClient.profileStore.blockedPeople.findIndex(
      (p) => p.target.id === profile.person.id
    ) !== -1;

  const onMessagePress = () => {
    // @ts-ignore why do I need this...
    navigation.navigate("MessageWrite", {
      isFromLocalUser: true,
      toLocalUser: false,
      item: {
        private_message: {
          content: "New message...",
        },
        recipient: {
          name: profile?.person?.name,
        },
      },
      messageDate: makeDateString(new Date().getTime()),
      recipient: profile?.person?.id,
      messageId: null,
      newMessage: true,
    });
  };

  const onBlock = () => {
    void apiClient.profileStore.blockPerson(
      profile.person.id,
      !isBlocked,
      apiClient.loginDetails.jwt
    );
  };

  const hasBanner = Boolean(profile?.person?.banner);

  return (
    <View style={styles.container}>
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
      <UserRating counts={profile.counts} />
      <Bio profile={profile} />
      <Counters profile={profile} />
      {apiClient.loginDetails.jwt ? (
        <>
          <TouchableOpacity onPressCb={onMessagePress}>
            <Text>Message User</Text>
          </TouchableOpacity>
          <TouchableOpacity
            feedback
            style={{ backgroundColor: "red" }}
            onPressCb={onBlock}
          >
            <Text>{isBlocked ? "Unblock User" : "Block User"}</Text>
          </TouchableOpacity>
        </>
      ) : null}
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
