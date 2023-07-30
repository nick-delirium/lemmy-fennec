import React from "react";
import { observer } from "mobx-react-lite";
import { StatusBar } from "expo-status-bar";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import {
  StyleSheet,
  View,
  ToastAndroid,
  ActivityIndicator,
  Linking,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
} from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { asyncStorageHandler, dataKeys } from "../asyncStorage";
import { LemmyHttp } from "lemmy-js-client";
import { apiClient } from "../store/apiClient";
import { useTheme } from "@react-navigation/native";
import { Text, TextInput, TouchableOpacity } from "../ThemedComponents";

function LoginScreen({ navigation }: NativeStackScreenProps<any, "Login">) {
  const passRef = React.useRef<any>(null);
  const { colors } = useTheme();

  const [instanceHref, setHref] = React.useState("");
  const [login, setLogin] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [mfa, setMfa] = React.useState("");

  React.useEffect(() => {
    if (apiClient.isLoggedIn && apiClient.api) {
      navigation.replace("Home");
    }
  }, [apiClient.isLoggedIn]);

  const saveInstance = async () => {
    if (login === "" || password === "") {
      const client: LemmyHttp = new LemmyHttp(instanceHref);
      apiClient.setClient(client);
      asyncStorageHandler.setData(dataKeys.instance, instanceHref).then(() => {
        navigation.replace("Home");
      });
    }

    const loginDetails = {
      username_or_email: login,
      password,
      totp_2fa_token: mfa !== "" ? mfa : undefined,
    };

    const client: LemmyHttp = new LemmyHttp(instanceHref);
    apiClient.setClient(client);
    apiClient
      .login(loginDetails)
      .then(async (auth) => {
        await Promise.all([
          asyncStorageHandler.setSecureData(
            dataKeys.login,
            JSON.stringify(auth)
          ),
          asyncStorageHandler.setData(dataKeys.instance, instanceHref),
          asyncStorageHandler.setData(
            dataKeys.username,
            loginDetails.username_or_email
          ),
        ]);
        navigation.replace("Home");
      })
      .catch(() => {
        ToastAndroid.showWithGravity(
          "Couldn't login to chosen instance; check your credentials?",
          ToastAndroid.SHORT,
          ToastAndroid.TOP
        );
      });
  };

  return (
    <SafeAreaProvider>
      <StatusBar style="auto" />
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <ScrollView
            contentContainerStyle={{
              ...styles.container,
              width: "100%",
              height: "100%",
              alignItems: "center",
              backgroundColor: colors.background,
            }}
          >
            <View
              style={{
                ...styles.container,
                alignItems: "flex-start",
                width: "70%",
              }}
            >
              <Text>Choose Lemmy instance to connect to</Text>
              <TextInput
                placeholder="https://lemmy.ml"
                value={instanceHref}
                onChangeText={(text) => setHref(text)}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="url"
                importantForAutofill={"yes"}
                accessibilityLabel={"lemmy instance url"}
                onFocus={() =>
                  instanceHref === "" ? setHref("https://") : null
                }
              />
              <View
                style={{
                  ...styles.container,
                  flexDirection: "row",
                  width: "100%",
                  marginTop: 12,
                }}
              >
                <TouchableOpacity style={{ flex: 1 }} onPressCb={() => null}>
                  <Text>Connect</Text>
                </TouchableOpacity>
              </View>
              <Text style={{ alignSelf: "center", marginVertical: 8 }}>or</Text>
              <Text>Username/email</Text>
              <TextInput
                placeholder="king_julien"
                value={login}
                importantForAutofill={"yes"}
                onChangeText={(text) => setLogin(text)}
                autoCapitalize="none"
                returnKeyType="next"
                textContentType={"username"}
                autoComplete={"username"}
                accessibilityLabel={"username"}
                keyboardType="email-address"
                onSubmitEditing={() => passRef.current.focus()}
              />
              <Text>Password</Text>
              <TextInput
                placeholder="banana"
                value={password}
                ref={passRef}
                importantForAutofill={"yes"}
                onChangeText={(text) => setPassword(text)}
                autoCapitalize="none"
                // autoCorrect={false}
                autoComplete={"current-password"}
                textContentType={"password"}
                accessibilityLabel={"password"}
                secureTextEntry
                keyboardType="default"
              />
              <Text>2FA token (if enabled)</Text>
              <TextInput
                placeholder="123456"
                value={mfa}
                onChangeText={(text) => setMfa(text)}
                autoCapitalize="none"
                // autoCorrect={false}
                accessibilityLabel={"2FA token"}
                secureTextEntry
                keyboardType="default"
              />
            </View>
            {apiClient.isLoading ? (
              <View style={{ flexDirection: "row" }}>
                <ActivityIndicator />
                <Text>Loading...</Text>
              </View>
            ) : (
              <View
                style={{
                  ...styles.container,
                  flexDirection: "row",
                  width: "70%",
                  marginTop: 12,
                }}
              >
                <TouchableOpacity style={{ flex: 1 }} onPressCb={saveInstance}>
                  <Text>Log in</Text>
                </TouchableOpacity>
              </View>
            )}
            <View
              style={{
                ...styles.container,
                flexDirection: "row",
                width: "70%",
                marginTop: 12,
              }}
            >
              <TouchableOpacity
                style={{ flex: 1 }}
                onPressCb={() =>
                  void Linking.openURL("https://join-lemmy.org/instances")
                }
              >
                <Text>Create account</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{ flex: 1 }}
                onPressCb={() => navigation.replace("Home")}
              >
                <Text>Skip for now</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
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
