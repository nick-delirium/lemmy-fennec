import React from "react";
import { View, ActivityIndicator, TouchableOpacity, Text, useColorScheme, StyleSheet, Switch } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { observer } from "mobx-react-lite";
import Markdown from "react-native-marked";
import { apiClient } from "../../store/apiClient";
import { Icon, Text as ThemedText } from "../../ThemedComponents";
import { asyncStorageHandler } from "../../asyncStorage";
import UserRow from './UserRow'
import UserRating from './UserRating';
import { useTheme } from "@react-navigation/native";
import { mdTheme } from '../../commonStyles'

// even though its actually inside tab, main nav context is a stack right now
function Profile({ navigation }: NativeStackScreenProps<any, "Profile">) {
  const { localUser: profile } = apiClient.profileStore;
  const sch = useColorScheme()
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
    void apiClient.profileStore.getProfile(apiClient.loginDetails)
  }

  if (!profile) {
    return (
      <View>
        <ActivityIndicator />
      </View>
    )
  }

  const toggleReadPosts = () => {
    void apiClient.profileStore.updateSettings({ auth: apiClient.loginDetails.jwt, show_read_posts: !profile.local_user.show_read_posts })
  }
  const toggleNSFW = () => {
    void apiClient.profileStore.updateSettings({ auth: apiClient.loginDetails.jwt, show_nsfw: !profile.local_user.show_nsfw })
  }
  return (
    <View style={styles.container}>
      <UserRow person={profile.person} />
      {profile.person.bio ? (
          <View style={styles.longRow}>
            <Icon name={'user'} size={24} style={{ marginTop: 8 }} />
            <Markdown
              value={profile.person.bio}
              theme={{ colors: sch === 'dark' ? mdTheme.dark : mdTheme.light }}
            />
          </View>) : null}
      <UserRating counts={profile.counts} />

      <View style={styles.row}>
        <Icon size={24} name={"edit"} />
        <View>
          <ThemedText>
            Comments: {profile.counts.comment_count}
          </ThemedText>
          <ThemedText>
            Posts: {profile.counts.post_count}
          </ThemedText>
        </View>
      </View>

      <View style={styles.row}>
        <ThemedText>Hide NSFW?</ThemedText>
        <Switch
          trackColor={{false: '#767577', true: '#81b0ff'}}
          value={!profile.local_user.show_nsfw}
          onValueChange={toggleNSFW}
        />
      </View>
      <View style={styles.row}>
        <ThemedText>Hide read posts?</ThemedText>
        <Switch
          trackColor={{false: '#767577', true: '#81b0ff'}}
          value={!profile.local_user.show_read_posts}
          onValueChange={toggleReadPosts}
        />
      </View>
      <TouchableOpacity onPress={logoutHandler} style={styles.row}>
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

const styles = StyleSheet.create({
  container: {
    padding: 12,
    gap: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  longRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    width: '100%',
  }
})

export default observer(Profile);