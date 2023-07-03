import React from "react";
import { View } from "react-native";
import { observer } from "mobx-react-lite";
import { Feather } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Feed from "./Feed/FeedScreen";
import Profile from "./Profile/ProfileScreen";
import Search from "./Search/SearchScreen";
import FollowsScreen from "./Follows/FollowsScreen";
import Unreads from "./Unreads/Unreads";
import { apiClient } from "../store/apiClient";
import { Text } from "../ThemedComponents";

const Tab = createBottomTabNavigator();

function HomeScreen() {
  const jwt = apiClient.loginDetails?.jwt;
  React.useEffect(() => {
    if (jwt) {
      void apiClient.mentionsStore.fetchUnreads(jwt);
    }
  }, [jwt]);
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
            case "Communities":
              return <Feather name={"star"} size={size} color={color} />;
            case "Unreads":
              if (apiClient.mentionsStore.unreadsCount !== 0) {
                return (
                  <View>
                    <Feather name={"mail"} size={size} color={color} />
                    <View
                      style={{
                        position: "absolute",
                        top: -4,
                        right: -4,
                        backgroundColor: "red",
                        borderRadius: 100,
                        width: 16,
                        height: 16,
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <Text
                        style={{
                          color: "white",
                          fontSize: 10,
                          fontWeight: "bold",
                        }}
                      >
                        {apiClient.mentionsStore.unreadsCount}
                      </Text>
                    </View>
                  </View>
                );
              } else return <Feather name={"mail"} size={size} color={color} />;
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
      {apiClient.loginDetails?.jwt ? (
        <Tab.Screen
          name={"Communities"}
          component={FollowsScreen}
          options={{ headerShown: false }}
        />
      ) : null}
      <Tab.Screen
        name={"Search"}
        component={Search}
        options={{ headerShown: false }}
      />
      {apiClient.loginDetails?.jwt ? (
        <Tab.Screen
          name={"Unreads"}
          component={Unreads}
          options={{ headerShown: false }}
        />
      ) : null}
      <Tab.Screen
        name="Profile"
        component={Profile}
        options={{
          headerShown: false,
        }}
      />
    </Tab.Navigator>
  );
}

export default observer(HomeScreen);
