import React from "react";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import BlockedCommunities from "./BlockedCommunities";
import BlockedUsers from "./BlockedUsers";

const Tab = createMaterialTopTabNavigator();

function BlocksScreen() {
  return (
    <Tab.Navigator>
      <Tab.Screen name={"Blocked Communities"} component={BlockedCommunities} />
      <Tab.Screen name={"Blocked Users"} component={BlockedUsers} />
    </Tab.Navigator>
  );
}

export default BlocksScreen;
