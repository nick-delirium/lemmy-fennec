import React from "react";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import Profile from "./Profile";
import OwnComments from "./OwnComments";

const Tab = createMaterialTopTabNavigator();

function ProfileScreen() {
  return (
    <Tab.Navigator initialRouteName={"UserProfile"}>
      <Tab.Screen
        options={{
          tabBarLabel: "Profile",
        }}
        name={"UserProfile"}
        component={Profile}
      />
      <Tab.Screen
        options={{
          tabBarLabel: "Comments",
        }}
        name={"UserComments"}
        component={OwnComments}
      />
    </Tab.Navigator>
  );
}

export default ProfileScreen;
