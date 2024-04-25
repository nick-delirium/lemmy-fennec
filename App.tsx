import React from "react";
import { StatusBar, useColorScheme } from "react-native";

import { ActionSheetProvider } from "@expo/react-native-action-sheet";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { observer } from "mobx-react-lite";
import { SafeAreaProvider } from "react-native-safe-area-context";

import AddAccount from "./Screens/AddAccount";
import BlocksScreen from "./Screens/Blocks/BlocksScreen";
import CommentWrite from "./Screens/CommentWrite/CommentWrite";
import CommunityScreen from "./Screens/Community/CommunityScreen";
import DebugScreen from "./Screens/DebugScreen";
import HomeScreen from "./Screens/HomeScreen";
import LoginScreen from "./Screens/LoginScreen";
import PostScreen from "./Screens/Post/PostScreen";
import PostWrite from "./Screens/PostWrite";
import Behavior from "./Screens/Settings/Behavior";
import Looks from "./Screens/Settings/Looks";
import ProfileSettings from "./Screens/Settings/ProfileSettings";
import SettingsScreen from "./Screens/SettingsScreen";
import MessageWrite from "./Screens/Unreads/MessageWrite";
import UserScreen from "./Screens/User/UserScreen";
import { Icon } from "./ThemedComponents";
import { AppAmoledTheme, AppDarkTheme, AppTheme } from "./commonStyles";
import Prompt from "./components/Prompt";
import { ReportMode, apiClient } from "./store/apiClient";
import { Theme, preferences } from "./store/preferences";

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
        })
        .then(() => {
          closeReport();
        });
    } else {
      apiClient.api
        .createCommentReport({
          comment_id: apiClient.reportedItemId,
          reason: text,
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
            <Stack.Screen
              name="Post"
              component={PostScreen}
              options={{ headerShown: false }}
            />
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
            <Stack.Screen name="Looks" component={Looks} />
            <Stack.Screen name="Behavior" component={Behavior} />
            <Stack.Screen name="ProfileSettings" component={ProfileSettings} />
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
