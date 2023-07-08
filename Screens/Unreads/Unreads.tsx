import React from "react";
import { observer } from "mobx-react-lite";
import { apiClient } from "../../store/apiClient";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import Replies from "./Replies";
import Messages from "./Messages";
import Mentions from "./Mentions";
import { Text } from "../../ThemedComponents";

const Tab = createMaterialTopTabNavigator();

const buildShortStr = (counter: number) => (counter > 99 ? "99+" : counter);

function Unreads() {
  const unreadReplies = buildShortStr(apiClient.mentionsStore.unreads.replies);
  const unreadMessages = buildShortStr(
    apiClient.mentionsStore.unreads.messages
  );
  const unreadMentions = buildShortStr(
    apiClient.mentionsStore.unreads.mentions
  );
  return (
    <Tab.Navigator>
      <Tab.Screen
        options={{
          tabBarBadge: () =>
            apiClient.mentionsStore.unreads.replies > 0 ? (
              <Text>{unreadReplies}</Text>
            ) : null,
        }}
        name={"Replies"}
        component={Replies}
      />
      <Tab.Screen
        options={{
          tabBarBadge: () =>
            apiClient.mentionsStore.unreads.messages > 0 ? (
              <Text>{unreadMessages}</Text>
            ) : null,
        }}
        name={"Messages"}
        component={Messages}
      />
      <Tab.Screen
        options={{
          tabBarBadge: () =>
            apiClient.mentionsStore.unreads.mentions > 0 ? (
              <Text>{unreadMentions}</Text>
            ) : null,
        }}
        name={"Mentions"}
        component={Mentions}
      />
    </Tab.Navigator>
  );
}

export default observer(Unreads);
