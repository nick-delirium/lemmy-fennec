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
  TouchableOpacity
} from "react-native";
import { Text, Icon } from "../../ThemedComponents";
import { AppTheme, AppDarkTheme } from '../../commonStyles'
import { Score, apiClient } from "../../store/apiClient";

const mdTheme = {
  light: {
    background: "#ffffff",
    code: "#f6f8fa",
    link: "#58a6ff",
    text: "#333333",
    border: "#d0d7de",
    ...AppTheme.colors
  },
  dark: {
    background: "#000000",
    code: "#161b22",
    link: "#58a6ff",
    text: "#ffffff",
    border: "#30363d",
    ...AppDarkTheme.colors
  },
} as const

const deviceLanguage =
  Platform.OS === 'ios'
  ? NativeModules.SettingsManager.settings.AppleLocale ||
    NativeModules.SettingsManager.settings.AppleLanguages[0] // iOS 13 is special
  : NativeModules.I18nManager.localeIdentifier;

function Post({ post, isExpanded }: { post: PostView, isExpanded?: boolean }) {
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
  const dateStr = postDate.toLocaleDateString(deviceLanguage.replace('_', '-'), isSameYear ? recentDateOptions : oldDateOptions);

  return (
    <View style={{ ...styles.container, borderColor: colors.border }}>
      <View style={styles.topRow}>
        <Text style={{ fontSize: 12 }}>c/{post.community.name} by u/{post.creator.display_name || post.creator.name}</Text>
        <Text>{dateStr}</Text>
      </View>
      <Text
        customColor={post.read ? "#F5F5F5" : undefined}
        lines={maxLines}
        style={{
          fontSize: 16,
          marginTop: 4,
          marginBottom: 8,
      }}
      >
        {post.post.name}
      </Text>
      {isPic ? (
        <Image
          source={{ uri: post.post.url }}
          style={{ width: '100%', height: 320 }}
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
      <View style={styles.iconsRow}>
        <View style={styles.infoPiece}>
          <Icon name={"chevrons-up"} size={24} />
          <Text>
            {post.counts.score} ({Math.ceil(
            (post.counts.upvotes / (post.counts.upvotes + post.counts.downvotes)) * 100)}%)
          </Text>
        </View>
        <View style={{ flex: 1}} />
        <View style={styles.infoPiece}>
          <Icon name={"message-square"} size={24} />
          <Text>
            {`${post.counts.comments}${post.unread_comments > 0 ? '(+' + post.unread_comments + ')' : ''}`}
          </Text>
        </View>
        <Icon name={"share-2"} size={24} />
        <TouchableOpacity onPress={() => apiClient.ratePost(post.post.id, Score.Downvote)}>
          <Icon name={"arrow-down"} size={24} color={post.my_vote === -1 ? "red" : undefined} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => apiClient.ratePost(post.post.id, Score.Upvote)}>
          <Icon name={"arrow-up"} size={24} color={post.my_vote === 1 ? "red" : undefined} />
        </TouchableOpacity>
      </View>
    </View>
  )
}

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
    justifyContent: 'space-between'
  }
})

export default observer(Post);