import React from "react";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import Replies from "./Replies";
const Tab = createMaterialTopTabNavigator();
import Messages from "./Messages";

function Unreads() {
  return (
    <Tab.Navigator>
      <Tab.Screen name={"Replies"} component={Replies} />
      <Tab.Screen name={"Messages"} component={Messages} />
    </Tab.Navigator>
  );
}

export default Unreads;
