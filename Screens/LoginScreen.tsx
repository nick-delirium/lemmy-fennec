import React from 'react'
import { observer } from 'mobx-react-lite'
import { StatusBar } from 'expo-status-bar';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { asyncStorageHandler, dataKeys } from '../asyncStorage';
import { LemmyHttp } from 'lemmy-js-client';
import { apiClient } from '../store/apiClient';
import { useTheme } from '@react-navigation/native';
import { Text, TextInput, TouchableOpacity } from '../ThemedComponents';

function LoginScreen({ navigation }: NativeStackScreenProps<any, "Login">) {
  const { colors } = useTheme();

  const [ instanceHref, setHref ] = React.useState("");
  const [ login, setLogin ] = React.useState("");
  const [ password, setPassword ] = React.useState("");

  React.useEffect(() => {
    if (apiClient.isLoggedIn && apiClient.api) {
      navigation.navigate("Home")
    }
  }, [apiClient.isLoggedIn])

  const saveInstance = async () => {
    const loginDetails = {
      username_or_email: login,
      password,
    }

    const client: LemmyHttp = new LemmyHttp(instanceHref);
    apiClient.setClient(client);
    apiClient.login(loginDetails).then(async (auth) => {
      await Promise.all([
        asyncStorageHandler.setSecureData(dataKeys.login, JSON.stringify(auth)),
        asyncStorageHandler.setData(dataKeys.instance, instanceHref),
        asyncStorageHandler.setData(dataKeys.username, loginDetails.username_or_email),
      ])
      navigation.navigate("Home")
    })
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="auto" />
      <View
        style={{
          ...styles.container,
          width: '100%',
          height: '100%',
          alignItems: 'center',
          backgroundColor: colors.background
        }}
      >
        <View style={{ ...styles.container, alignItems: 'flex-start', width: '70%' }}>
          <Text>Choose Lemmy instance to connect to</Text>
          <TextInput
            placeholder="https://lemmy.ml"
            value={instanceHref}
            onChangeText={text => setHref(text)}
            autoCapitalize='none'
            autoCorrect={false}
            keyboardType="url"
            importantForAutofill={"yes"}
            accessibilityLabel={"lemmy instance url"}
            onFocus={() => instanceHref === '' ? setHref('https://') : null}
          />
          <Text>Login/email</Text>
          <TextInput
            placeholder="king_julien"
            value={login}
            importantForAutofill={"yes"}
            onChangeText={text => setLogin(text)}
            autoCapitalize='none'
            // autoCorrect={false}
            textContentType={"username"}
            autoComplete={"username"}
            accessibilityLabel={"username"}
            keyboardType="email-address"
          />
          <Text>Password</Text>
          <TextInput
            placeholder="banana"
            value={password}
            importantForAutofill={"yes"}
            onChangeText={text => setPassword(text)}
            autoCapitalize='none'
            // autoCorrect={false}
            autoComplete={"current-password"}
            textContentType={"password"}
            accessibilityLabel={"password"}
            secureTextEntry
            keyboardType="default"
          />
        </View>
        <View style={{ ...styles.container, flexDirection: 'row', width: '70%', marginTop: 12 }}>
          <TouchableOpacity
            style={{ flex: 1 }}
            onPressCb={saveInstance}
          >
            <Text>Go!</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{ flex: 1 }}
            onPressCb={() => navigation.navigate('Home')}
          >
            <Text>Skip for now</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaProvider>
  )
}


const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  hrefInput: {
    width: "100%",
    padding: 8,
    borderRadius: 6,
    borderWidth: 1,
  },
});


export default observer(LoginScreen);
