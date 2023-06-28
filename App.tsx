import React from "react";
import { observer } from "mobx-react-lite";
import { StatusBar } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import {
  NavigationContainer,
  getFocusedRouteNameFromRoute,
} from "@react-navigation/native";
import { apiClient } from "./store/apiClient";
import LoginScreen from "./Screens/LoginScreen";
import HomeScreen from "./Screens/HomeScreen";
import { useColorScheme } from "react-native";
import { AppDarkTheme, AppTheme } from "./commonStyles";
import PostScreen from "./Screens/Post/PostScreen";
import CommunityScreen from "./Screens/Community/CommunityScreen";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

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

  return (
    <SafeAreaProvider style={{ flex: 1 }}>
      {/* I don't really remember how it works */}
      <StatusBar
        barStyle={scheme !== "dark" ? "dark-content" : "light-content"}
        backgroundColor={
          scheme !== "dark"
            ? AppTheme.colors.background
            : AppDarkTheme.colors.background
        }
      />
      <NavigationContainer theme={scheme === "dark" ? AppDarkTheme : AppTheme}>
        <Stack.Navigator initialRouteName={"Home"}>
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={({ route }) => ({
              headerTitle: getTitle(route),
            })}
          />
          <Stack.Screen name="Post" component={PostScreen} />
          <Stack.Screen name="Community" component={CommunityScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
});

export default App;
