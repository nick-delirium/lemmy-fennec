import React from "react";
import { observer } from "mobx-react-lite";
import { StatusBar, useColorScheme } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import {
  getFocusedRouteNameFromRoute,
  NavigationContainer,
} from "@react-navigation/native";
import { apiClient } from "./store/apiClient";
import LoginScreen from "./Screens/LoginScreen";
import HomeScreen from "./Screens/HomeScreen";
import { AppAmoledTheme, AppDarkTheme, AppTheme } from "./commonStyles";
import PostScreen from "./Screens/Post/PostScreen";
import CommunityScreen from "./Screens/Community/CommunityScreen";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import UserScreen from "./Screens/User/UserScreen";
import SettingsScreen from "./Screens/SettingsScreen";
import DebugScreen from "./Screens/DebugScreen";
import CommentWrite from "./Screens/CommentWrite/CommentWrite";
import PostWrite from "./Screens/PostWrite";
import { preferences, Theme } from "./store/preferences";

const Stack = createNativeStackNavigator();

const App = observer(() => {
  const [title, setTitle] = React.useState<string>("Feed");
  const scheme = useColorScheme();

  const getTitle = (route) => {
    const parsed = getFocusedRouteNameFromRoute(route) ?? "Feed";
    return parsed === "Feed" ? title : parsed;
  };

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

  const systemTheme = scheme === "dark" ? AppDarkTheme : AppTheme;
  const isLightStatusBar =
    preferences.theme === Theme.System
      ? scheme !== "dark"
      : preferences.theme === Theme.Light;

  const schemeMap = {
    [Theme.System]: systemTheme,
    [Theme.Light]: AppTheme,
    [Theme.Dark]: AppDarkTheme,
    [Theme.Amoled]: AppAmoledTheme,
  };

  return (
    <SafeAreaProvider style={{ flex: 1 }}>
      {/* I don't really remember how it works */}
      <StatusBar
        barStyle={isLightStatusBar ? "dark-content" : "light-content"}
        backgroundColor={schemeMap[preferences.theme].colors.card}
      />
      <NavigationContainer theme={schemeMap[preferences.theme]}>
        <Stack.Navigator initialRouteName={"Home"}>
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={({ route }) => ({
              headerTitle: getTitle(route),
            })}
          />
          <Stack.Screen name="Post" component={PostScreen} />
          <Stack.Screen
            options={{ headerTitle: "New Comment" }}
            name={"CommentWrite"}
            component={CommentWrite}
          />
          <Stack.Screen
            options={{ headerTitle: "New Post" }}
            name={"PostWrite"}
            component={PostWrite}
          />
          <Stack.Screen name="Community" component={CommunityScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="User" component={UserScreen} />
          <Stack.Screen name="Settings" component={SettingsScreen} />
          <Stack.Screen name="Debug" component={DebugScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
});

export default App;
