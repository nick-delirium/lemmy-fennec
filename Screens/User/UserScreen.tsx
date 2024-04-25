import React from "react";
import { ActivityIndicator, View } from "react-native";

import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { observer } from "mobx-react-lite";

import { apiClient } from "../../store/apiClient";
import OwnComments from "../Profile/OwnComments";
import OwnPosts from "../Profile/OwnPosts";
import User from "./User";

const Tab = createMaterialTopTabNavigator();

function UserScreen({
  route,
  navigation,
}: NativeStackScreenProps<any, "User">) {
  const loadedProfile = apiClient.profileStore.userProfile;
  const person = loadedProfile?.person_view?.person;

  React.useEffect(() => {
    const title =
      apiClient.profileStore.isLoading || !person
        ? "Loading User..."
        : `@${person.name}`;
    navigation.setOptions({
      title: title,
    });
  }, [person, navigation, apiClient.profileStore.isLoading]);

  React.useEffect(() => {
    const paramsPresent = route.params?.personId || route.params?.username;
    if (paramsPresent) {
      void apiClient.profileStore.getProfile({
        person_id: route.params.personId,
        username: route.params.username,
      });
    }
  }, [route.params?.personId, route.params?.username]);

  if (!person || apiClient.profileStore.isLoading) {
    return (
      <View style={{ padding: 24 }}>
        <ActivityIndicator />
      </View>
    );
  }
  return (
    <Tab.Navigator initialRouteName={"ForeignUser"}>
      <Tab.Screen
        options={{
          tabBarLabel: "Profile",
        }}
        name={"ForeignUser"}
        component={User}
      />
      <Tab.Screen
        options={{
          tabBarLabel: "Comments",
        }}
        name={"ForeignUserComments"}
        component={OwnComments}
      />
      <Tab.Screen
        options={{
          tabBarLabel: "Posts",
        }}
        name={"ForeignUserPosts"}
        component={OwnPosts}
      />
    </Tab.Navigator>
  );
}

export default observer(UserScreen);
