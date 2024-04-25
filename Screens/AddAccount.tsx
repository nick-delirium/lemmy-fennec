import React from "react";
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  ToastAndroid,
  TouchableWithoutFeedback,
  View,
} from "react-native";

import { useTheme } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { StatusBar } from "expo-status-bar";
import { LemmyHttp } from "lemmy-js-client";
import { observer } from "mobx-react-lite";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { Text, TextInput, TouchableOpacity } from "../ThemedComponents";
import { asyncStorageHandler, dataKeys } from "../asyncStorage";
import { apiClient } from "../store/apiClient";

function AddAccount({ navigation }: NativeStackScreenProps<any, "AddAccount">) {
  const passRef = React.useRef<any>(null);
  const { colors } = useTheme();

  const [instanceHref, setHref] = React.useState("");
  const [login, setLogin] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [mfa, setMfa] = React.useState("");

  const saveInstance = async () => {
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
        const currentAccounts = apiClient.accounts;
        apiClient.setAccounts(
          currentAccounts.concat({
            login,
            auth: JSON.stringify(auth),
            instance: instanceHref,
          })
        );
        apiClient.getGeneralData().then(() => {
          navigation.goBack();
        });
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
              <Text>Username/email</Text>
              <TextInput
                placeholder="batman"
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
                placeholder="waruwannakillme"
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
                textContentType={"oneTimeCode"}
              />
            </View>
            {apiClient.isLoading ? (
              <View style={{ flexDirection: "row", gap: 6 }}>
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
                  <Text>Add Account</Text>
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
                onPressCb={() => navigation.goBack()}
              >
                <Text>Cancel</Text>
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

export default observer(AddAccount);
