import React from "react";
import { observer } from "mobx-react-lite";
import { View, StyleSheet, ActivityIndicator } from "react-native";
import { TextInput, Text, TouchableOpacity } from "../../ThemedComponents";
import { useTheme } from "@react-navigation/native";
import { apiClient } from "../../store/apiClient";
import { ButtonsRow } from "../CommentWrite/CommentWrite";

function ProfileSettings() {
  const { colors } = useTheme();
  const [displayName, setDisplayName] = React.useState(
    apiClient.profileStore.localUser?.person.display_name || ""
  );
  const [bio, setBio] = React.useState(
    apiClient.profileStore.localUser?.person.bio || ""
  );
  const [email, setEmail] = React.useState(
    apiClient.profileStore.localUser?.local_user.email || ""
  );

  const onSave = () => {
    if (apiClient.profileStore.isLoading) return;
    void apiClient.profileStore.updateSettings({
      bio,
      display_name: displayName,
      email,
      auth: apiClient.loginDetails.jwt,
    });
  };

  return (
    <View style={styles.container}>
      <Text>Display Name</Text>
      <TextInput
        placeholder={"Display Name"}
        value={displayName}
        onChangeText={setDisplayName}
        autoCapitalize={"none"}
        autoCorrect={false}
        keyboardType="default"
        accessibilityLabel={"Display Name for current user"}
      />
      <Text>Bio</Text>
      <View style={{ flexDirection: "column" }}>
        <TextInput
          placeholder={"bio"}
          value={bio}
          onChangeText={setBio}
          autoCapitalize={"sentences"}
          autoCorrect={true}
          multiline
          keyboardType="default"
          accessibilityLabel={"Bio for current user"}
        />
        <ButtonsRow setText={setBio} text={bio} />
      </View>
      <Text>Email</Text>
      <TextInput
        placeholder={"email"}
        value={email}
        onChangeText={setEmail}
        autoCapitalize={"none"}
        autoCorrect={false}
        keyboardType="email-address"
        accessibilityLabel={"Email for current user"}
      />

      <View style={{ flex: 1 }} />
      <TouchableOpacity feedback onPressCb={onSave}>
        {apiClient.profileStore.isLoading ? (
          <ActivityIndicator color={colors.background} />
        ) : (
          <Text>Save</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 12,
    gap: 8,
  },
});

export default observer(ProfileSettings);
