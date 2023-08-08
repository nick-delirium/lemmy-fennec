import React from "react";
import { observer } from "mobx-react-lite";
import { StatusBar, useColorScheme } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { NavigationContainer } from "@react-navigation/native";
import { apiClient, ReportMode } from "./store/apiClient";
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
import { Icon } from "./ThemedComponents";
import MessageWrite from "./Screens/Unreads/MessageWrite";
import Prompt from "./components/Prompt";
import { ActionSheetProvider } from "@expo/react-native-action-sheet";
import BlocksScreen from "./Screens/Blocks/BlocksScreen";
import AddAccount from "./Screens/AddAccount";

const Stack = createNativeStackNavigator();

const App = observer(() => {
  const scheme = useColorScheme();

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

  const sendReport = (text: string) => {
    if (apiClient.reportMode === ReportMode.Post) {
      apiClient.api
        .createPostReport({
          post_id: apiClient.reportedItemId,
          reason: text,
          auth: apiClient.loginDetails.jwt,
        })
        .then(() => {
          closeReport();
        });
    } else {
      apiClient.api
        .createCommentReport({
          comment_id: apiClient.reportedItemId,
          reason: text,
          auth: apiClient.loginDetails.jwt,
        })
        .then(() => {
          closeReport();
        });
    }
  };

  const closeReport = () => {
    apiClient.setShowPrompt(false);
  };

  const reportMode = apiClient.reportMode;
  const promptActions =
    reportMode !== ReportMode.Off
      ? {
          onCancel: closeReport,
          onConfirm: sendReport,
        }
      : apiClient.promptActions;
  return (
    <SafeAreaProvider style={{ flex: 1 }}>
      {/* I don't really remember how it works */}
      <StatusBar
        barStyle={isLightStatusBar ? "dark-content" : "light-content"}
        backgroundColor={schemeMap[preferences.theme].colors.card}
      />
      <ActionSheetProvider>
        <NavigationContainer theme={schemeMap[preferences.theme]}>
          <Stack.Navigator initialRouteName={"Home"}>
            <Stack.Screen
              name="Home"
              component={HomeScreen}
              options={{ headerShown: false }}
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
            <Stack.Screen
              options={{ headerTitle: "Message" }}
              name={"MessageWrite"}
              component={MessageWrite}
            />
            <Stack.Screen
              options={{
                headerRight: () => <Icon name={"arrow-up"} size={24} />,
              }}
              name="Community"
              component={CommunityScreen}
            />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen
              options={{ headerTitle: "Add Account" }}
              name={"AddAccount"}
              component={AddAccount}
            />
            <Stack.Screen name="User" component={UserScreen} />
            <Stack.Screen name="Settings" component={SettingsScreen} />
            <Stack.Screen name="Debug" component={DebugScreen} />
            <Stack.Screen name="Blocks" component={BlocksScreen} />
          </Stack.Navigator>
          {apiClient.showPrompt ? (
            <Prompt
              text={`Describe whats wrong with this ${
                reportMode === ReportMode.Post ? "post" : "comment"
              }`}
              title={`Report ${
                reportMode === ReportMode.Post ? "post" : "comment"
              }`}
              reportMode={reportMode}
              placeholder={"Type a reason here"}
              onSubmit={promptActions.onConfirm}
              onCancel={promptActions.onCancel}
            />
          ) : null}
        </NavigationContainer>
      </ActionSheetProvider>
    </SafeAreaProvider>
  );
});

export default App;
