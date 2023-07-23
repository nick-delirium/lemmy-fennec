import React from "react";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import AppSettings from "./Settings/AppSettings";
import ProfileSettings from "./Settings/ProfileSettings";
import { apiClient } from "../store/apiClient";
import { observer } from "mobx-react-lite";

const Tab = createMaterialTopTabNavigator();

function FollowsScreen() {
  return (
    <Tab.Navigator>
      <Tab.Screen name={"App"} component={AppSettings} />
      {apiClient.loginDetails?.jwt ? (
        <Tab.Screen name={"Profile"} component={ProfileSettings} />
      ) : null}
    </Tab.Navigator>
  );
}

export default observer(FollowsScreen);
