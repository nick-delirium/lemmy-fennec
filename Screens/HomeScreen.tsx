import React from 'react';
import { observer } from 'mobx-react-lite';
import { apiClient } from '../store/apiClient';
import { Feather } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Feed from './Feed/FeedScreen';
import Profile from './Profile/ProfileScreen';
import { NativeStackScreenProps } from "@react-navigation/native-stack";

const Tab = createBottomTabNavigator();

function HomeScreen() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          if (route.name === "Feed") {
            return <Feather name={"align-left"} size={size} color={color} />;
          } else if (route.name === "Profile") {
            return <Feather name={"user"} size={size} color={color} />;
          }
          return <Feather name={"heart"} size={size} color={color} />;
        },
        tabBarShowLabel: false,
        tabBarAccessibilityLabel: `Tab bar route - ${route.name}`
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
      <Tab.Screen
        name="Profile"
        component={Profile}
        options={{
          headerShown: false,
        }}
      />
    </Tab.Navigator>
  )
}

export default observer(HomeScreen);
