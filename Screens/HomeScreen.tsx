import React from "react";

import { Feather } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { getFocusedRouteNameFromRoute } from "@react-navigation/native";
import { observer } from "mobx-react-lite";

import { Icon } from "../ThemedComponents";
import { apiClient } from "../store/apiClient";
import Feed from "./Feed/FeedScreen";
import FollowsScreen from "./Follows/FollowsScreen";
import Profile from "./Profile/ProfileScreen";
import Search from "./Search/SearchScreen";
import Unreads from "./Unreads/Unreads";

const Tab = createBottomTabNavigator();

function HomeScreen() {
  const jwt = apiClient.loginDetails?.jwt;
  const isLoggedIn = apiClient.isLoggedIn;
  React.useEffect(() => {
    if (jwt) {
      void apiClient.mentionsStore.fetchUnreads(jwt);
    }
  }, [jwt]);
  const unreadCount = apiClient.mentionsStore.unreadsCount;
  const displayedUnreads = unreadCount > 99 ? "99+" : unreadCount;

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          switch (route.name) {
            case "Feed":
              return <Feather name={"align-left"} size={size} color={color} />;
            case "Profile":
              return <Feather name={"user"} size={size} color={color} />;
            case "Search":
              return <Feather name={"search"} size={size} color={color} />;
            case "Followed Communities":
              return <Feather name={"star"} size={size} color={color} />;
            case "Unreads":
              return <Feather name={"mail"} size={size} color={color} />;
            default:
              return <Feather name={"heart"} size={size} color={color} />;
          }
        },
        tabBarShowLabel: false,
        tabBarAccessibilityLabel: `Tab bar route - ${route.name}`,
      })}
      initialRouteName={"Feed"}
    >
      <Tab.Screen
        name="Feed"
        component={Feed}
        options={{
          headerShown: false,
        }}
      />
      {isLoggedIn ? (
        <>
          <Tab.Screen name={"Saved"} component={FollowsScreen} />
          <Tab.Screen
            name={"Unreads"}
            component={Unreads}
            options={{
              tabBarBadge: unreadCount > 0 ? displayedUnreads : undefined,
            }}
          />
        </>
      ) : null}
      <Tab.Screen name={"Search"} component={Search} />
      <Tab.Screen name="Profile" component={Profile} />
    </Tab.Navigator>
  );
}

export default observer(HomeScreen);
