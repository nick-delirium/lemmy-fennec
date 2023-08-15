import React from "react";

import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";

import OwnComments from "./OwnComments";
import OwnPosts from "./OwnPosts";
import Profile from "./Profile";

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
      <Tab.Screen
        options={{
          tabBarLabel: "Posts",
        }}
        name={"UserPosts"}
        component={OwnPosts}
      />
    </Tab.Navigator>
  );
}

export default ProfileScreen;
