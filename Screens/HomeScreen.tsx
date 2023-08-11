import React from "react";
import { observer } from "mobx-react-lite";
import { Feather } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Feed from "./Feed/FeedScreen";
import Profile from "./Profile/ProfileScreen";
import Search from "./Search/SearchScreen";
import FollowsScreen from "./Follows/FollowsScreen";
import Unreads from "./Unreads/Unreads";
import { apiClient } from "../store/apiClient";
import { Icon } from "../ThemedComponents";
import { getFocusedRouteNameFromRoute } from "@react-navigation/native";

const getTitle = (route, title) => {
  const parsed = getFocusedRouteNameFromRoute(route) ?? "Feed";
  return parsed === "Feed" ? title : parsed;
};

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

  const [title, setTitle] = React.useState<string>("Feed");
  React.useEffect(() => {
    setTitle(
      `Feed | ${
        apiClient.postStore.filters.type_
      } | ${apiClient.postStore.filters.sort.replace(
        /([a-z])([A-Z])/g,
        "$1 $2"
      )}`
    );
  }, [apiClient.postStore.filters.type_, apiClient.postStore.filters.sort]);

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
        options={(route) => ({
          headerTitle: getTitle(route, title),
          headerRight: () => <Icon name={"arrow-up"} size={24} />,
        })}
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
