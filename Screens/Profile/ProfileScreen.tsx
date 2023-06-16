import React from "react";
import { View, ActivityIndicator, TouchableOpacity, Text } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { observer } from "mobx-react-lite";
import { apiClient } from "../../store/apiClient";
import { Icon, Text as ThemedText } from "../../ThemedComponents";
import { asyncStorageHandler } from "../../asyncStorage";
import UserRow from './UserRow'
import UserRating from './UserRating';
import { useTheme } from "@react-navigation/native";

// even though its actually inside tab, main nav context is a stack right now
function Profile({ navigation }: NativeStackScreenProps<any, "Profile">) {
  const { userProfile: profile } = apiClient;
  const { colors } = useTheme();

  React.useEffect(() => {
    if (apiClient.isLoggedIn === false) {
      navigation.replace("Login")
    } else {
      if (!profile) {
        reload()
      }
    }
  }, [ navigation, apiClient.isLoggedIn ])

  const logoutHandler = () => {
    asyncStorageHandler.logout();
    navigation.replace("Home")
  }
  const reload = () => {
    void apiClient.getProfile()
  }

  if (!profile) {
    return (
      <View>
        <ActivityIndicator />
      </View>
    )
  }
  return (
    <View style={{ gap: 12, padding: 12 }}>
      <UserRow person={profile.person_view.person} />
      <UserRating counts={profile.person_view.counts} />

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <Icon size={24} name={"edit"} />
        <View>
          <ThemedText>
            Comments: {profile.person_view.counts.comment_count}
          </ThemedText>
          <ThemedText>
            Posts: {profile.person_view.counts.post_count}
          </ThemedText>
        </View>
      </View>

      <TouchableOpacity onPress={logoutHandler} style={{ flexDirection: 'row', gap: 8 }}>
        <Icon size={24} name={"log-out"} />
        <Text
          style={{
            color: colors.border,
            textDecorationLine: 'underline',
            textDecorationColor: colors.border
          }}
        >
          Logout
        </Text>
      </TouchableOpacity>
    </View>
  )
}

// todo: settings, posts, comments, profile editing

export default observer(Profile);