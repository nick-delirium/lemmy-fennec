import React from 'react'
import {observer} from "mobx-react-lite";
import {StyleSheet, Switch, Text, TouchableOpacity, View} from "react-native";
import {Icon, Text as ThemedText} from "../../ThemedComponents";
import {asyncStorageHandler} from "../../asyncStorage";
import {apiClient} from "../../store/apiClient";
import {useTheme} from "@react-navigation/native";

function Settings({navigation}: { navigation: any }) {
  const {colors} = useTheme();
  const {localUser: profile} = apiClient.profileStore;

  const logoutHandler = () => {
    asyncStorageHandler.logout();
    navigation.replace("Home")
  }

  const toggleReadPosts = () => {
    void apiClient.profileStore.updateSettings({
      auth: apiClient.loginDetails.jwt,
      show_read_posts: !profile.local_user.show_read_posts
    })
  }
  const toggleNSFW = () => {
    void apiClient.profileStore.updateSettings({
      auth: apiClient.loginDetails.jwt,
      show_nsfw: !profile.local_user.show_nsfw
    })
  }
  return (
    <View>

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
      <View style={styles.row}>
        <ThemedText>Mark posts read while scrolling?</ThemedText>
        <Switch
          trackColor={{false: '#767577', true: '#81b0ff'}}
          value={apiClient.profileStore.readOnScroll}
          onValueChange={() => apiClient.profileStore.setReadOnScroll(!apiClient.profileStore.readOnScroll)}
        />
      </View>
      <TouchableOpacity onPress={logoutHandler} style={styles.row}>
        <Icon size={24} name={"log-out"}/>
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

export default observer(Settings)