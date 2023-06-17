import React from 'react';
import { observer } from 'mobx-react-lite';
import { StatusBar } from 'react-native';
import { LoginResponse } from "lemmy-js-client";
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { asyncStorageHandler, dataKeys } from './asyncStorage';
import { LemmyHttp } from 'lemmy-js-client';
import { apiClient } from './store/apiClient';
import LoginScreen from './Screens/LoginScreen';
import HomeScreen from './Screens/HomeScreen';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import { useColorScheme } from 'react-native';
import { AppDarkTheme, AppTheme } from "./commonStyles";

function getHeaderTitle(route) {
  return getFocusedRouteNameFromRoute(route) ?? 'Feed';
}

const Stack = createNativeStackNavigator();

const App = observer(() => {
  const scheme = useColorScheme();

  React.useEffect(() => {
    async function init() {
      if (apiClient.api === undefined) {
        const [ possibleInstance, possibleUser, possibleUsername ] = await Promise.all([
          asyncStorageHandler.readData(dataKeys.instance),
          asyncStorageHandler.readSecureData(dataKeys.login),
          asyncStorageHandler.readData(dataKeys.username)
        ])
        if (possibleInstance && possibleUser && possibleUsername) {
          const auth: LoginResponse = JSON.parse(possibleUser);
          const client: LemmyHttp = new LemmyHttp(possibleInstance);
          apiClient.setClient(client)
          apiClient.setLoginDetails(auth)
          apiClient.setLoginState(true)
          apiClient.profileStore.setUsername(possibleUsername)

          void apiClient.profileStore.getProfile(auth)
        } else {
          const client: LemmyHttp = new LemmyHttp('https://lemmy.ml');
          apiClient.setClient(client)
        }
      } else {
        console.log('got client in state')
      }
    }

    void init();
  }, [ apiClient.api ]);

  return (
    <SafeAreaProvider>
      <StatusBar />
      <NavigationContainer theme={scheme === 'dark' ? AppDarkTheme : AppTheme}>
        <Stack.Navigator initialRouteName={"Home"}>
          <Stack.Screen
            name="Login"
            component={LoginScreen}
          />
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={({ route }) => ({
              headerTitle: getHeaderTitle(route)
            })}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
})

export default App;
