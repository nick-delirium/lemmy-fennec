import React from "react";
import { PostView } from "lemmy-js-client";
import { useTheme } from "@react-navigation/native";
import { observer } from "mobx-react-lite";
import Markdown from "react-native-marked";
import {
  View,
  StyleSheet,
  Platform,
  NativeModules,
  useColorScheme,
  Image,
  Vibration,
  Share,
  TouchableOpacity
} from "react-native";
import { Text, Icon } from "../../ThemedComponents";
import { mdTheme } from '../../commonStyles'
import { Score, apiClient } from "../../store/apiClient";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

const deviceLanguage =
  Platform.OS === 'ios'
  ? NativeModules.SettingsManager.settings.AppleLocale ||
    NativeModules.SettingsManager.settings.AppleLanguages[0] // iOS 13 is special
  : NativeModules.I18nManager.localeIdentifier;

function Post({ post, isExpanded, navigation }: { post: PostView, isExpanded?: boolean, navigation?: NativeStackNavigationProp<any, "Feed"> }) {
  const { colors } = useTheme();
  const sch = useColorScheme()

  // flags to mark the post
  const isNsfw = post.post.nsfw || post.community.nsfw;
  const isLocal = post.post.local;
  const isPic = post.post.url ? /\.(jpeg|jpg|gif|png)$/.test(post.post.url) : false;

  const maxLines = isExpanded ? undefined : 3;
  const safeDescription = post.post.body ? post.post.body : ''

  const recentDateOptions = { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' } as const;
  const oldDateOptions = { month: 'long', day: '2-digit', year: 'numeric' } as const;
  const postDate = new Date(post.post.published);
  const isSameYear = postDate.getFullYear() === new Date().getFullYear();
  const dateStr = postDate.toLocaleDateString(
    deviceLanguage.replace('_', '-'), isSameYear ? recentDateOptions : oldDateOptions);

  return (
    <View style={{ ...styles.container, borderColor: colors.border }}>
      <View style={styles.topRow}>
        <View style={styles.communityIconContainer}>
          <Image
            source={{ uri: post.community.icon }}
            style={styles.communityIcon}
          />
        </View>
        <Text style={styles.communityName}>c/{post.community.name}</Text>
        <Text style={styles.smolText}>by</Text>
        <Text style={styles.authorName}>u/{post.creator.display_name || post.creator.name}</Text>
        <Text style={{ marginLeft: 'auto' }}>{dateStr}</Text>
      </View>
      <Text
        customColor={post.read ? "#F5F5F5" : undefined}
        lines={maxLines}
        style={styles.postName}
      >
        {post.post.name}
      </Text>
      {!isExpanded ? (
        <TouchableOpacity
          onPress={() => {
            apiClient.postStore.setSinglePost(post)
            navigation.navigate("Post")
        }}
        >
          {isPic ? (
              <Image
                source={{ uri: post.post.url }}
                style={styles.postImg}
                progressiveRenderingEnabled
                resizeMode={'contain'}
                alt={"Post image"}
              />
            ) : (
              <Markdown
                value={safeDescription}
                theme={{ colors: sch === 'dark' ? mdTheme.dark : mdTheme.light }}
              />
            )}
        </TouchableOpacity>
      ) : (isPic ? (
           <Image
             source={{ uri: post.post.url }}
             style={styles.postImg}
             progressiveRenderingEnabled
             resizeMode={'contain'}
             alt={"Post image"}
           />
         ) : (
           <Markdown
             value={safeDescription}
             theme={{ colors: sch === 'dark' ? mdTheme.dark : mdTheme.light }}
           />
         )
       )}
      <View style={styles.iconsRow}>
        <View style={styles.infoPiece}>
          <Icon name={"chevrons-up"} size={24} />
          <Text>
            {post.counts.score} ({Math.ceil(
            (post.counts.upvotes / (post.counts.upvotes + post.counts.downvotes)) * 100)}%)
          </Text>
        </View>
        <View style={{ flex: 1 }} />
        <View style={styles.infoPiece}>
          <Icon name={"message-square"} size={24} />
          <Text>
            {`${post.counts.comments}${post.unread_comments > 0 ? '(+' + post.unread_comments + ')' : ''}`}
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => {
            Vibration.vibrate(50)
            void apiClient.postStore.savePost(
              { post_id: post.post.id, save: !post.saved, auth: apiClient.loginDetails?.jwt })
          }}
        >
          <Icon name={"bookmark"} size={24} color={post.saved ? 'red' : undefined} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => Share.share(
            { url: post.post.ap_id, message: Platform.OS === 'ios' ? '' : post.post.ap_id, title: post.post.name },
            { dialogTitle: post.post.name }
          )}
        >
          <Icon name={"share-2"} size={24} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            Vibration.vibrate(50)
            void apiClient.postStore.ratePost(
              post.post.id, apiClient.loginDetails, Score.Downvote)
          }}
        >
          <Icon name={"arrow-down"} size={24} color={post.my_vote === -1 ? "red" : undefined} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            Vibration.vibrate(50)
            void apiClient.postStore.ratePost(
              post.post.id, apiClient.loginDetails, Score.Upvote)
          }}
        >
          <Icon name={"arrow-up"} size={24} color={post.my_vote === 1 ? "red" : undefined} />
        </TouchableOpacity>
      </View>
    </View>
  )
}

// todo add saving

const styles = StyleSheet.create({
  container: {
    padding: 8,
    borderBottomWidth: 1,
  },
  infoPiece: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center'
  },
  iconsRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    paddingTop: 8,
    paddingBottom: 8
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  communityIconContainer: { backgroundColor: '#f6f6f6', borderRadius: 24, width: 24, height: 24 },
  communityIcon: { width: 24, height: 24, borderRadius: 24 },
  authorName: { fontSize: 12, fontWeight: '500' },
  communityName: { fontSize: 12, fontWeight: '500', marginLeft: 4 },
  smolText: { fontSize: 12 },
  postName: {
    fontSize: 16,
    marginTop: 4,
    marginBottom: 8,
  },
  postImg: { width: '100%', height: 320 }
})

export default observer(Post);