import React from "react";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import FollowsList from "./FollowsList";
import SavedFeed from "./SavedFeed";

const Tab = createMaterialTopTabNavigator();

function FollowsScreen() {
  return (
    <Tab.Navigator>
      <Tab.Screen name={"Communities"} component={FollowsList} />
      <Tab.Screen
        options={{
          title: "Saved Posts",
        }}
        name={"SavedPosts"}
        component={SavedFeed}
      />
    </Tab.Navigator>
  );
}

export default FollowsScreen;
