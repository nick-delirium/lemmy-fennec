import React from "react";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import User from "./User";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import OwnComments from "../Profile/OwnComments";
import { apiClient } from "../../store/apiClient";
import { ActivityIndicator, View } from "react-native";
import { observer } from "mobx-react-lite";

const Tab = createMaterialTopTabNavigator();

function UserScreen({
  route,
  navigation,
}: NativeStackScreenProps<any, "User">) {
  const loadedProfile = apiClient.profileStore.userProfile;
  const person = loadedProfile?.person_view?.person;

  React.useEffect(() => {
    if (person) {
      navigation.setOptions({
        title: person.name,
      });
    }
  }, [person]);
  React.useEffect(() => {
    if (route.params?.personId) {
      void apiClient.profileStore.getProfile(apiClient.loginDetails, {
        person_id: route.params.personId,
      });
    }
    return () => {
      apiClient.profileStore.setProfile(null);
    };
  }, [route.params.personId]);

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
    </Tab.Navigator>
  );
}

export default observer(UserScreen);
