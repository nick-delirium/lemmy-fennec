import React from "react";
import { PostView } from "lemmy-js-client";
import { useTheme } from "@react-navigation/native";
import { observer } from "mobx-react-lite";
import Markdown from "react-native-marked";
import {
  View,
  StyleSheet,
  Platform,
  useColorScheme,
  Image,
  Vibration,
  Share,
  TouchableOpacity,
  Dimensions
} from "react-native";
import { Text, Icon } from "../../ThemedComponents";
import { mdTheme } from '../../commonStyles'
import { Score, apiClient } from "../../store/apiClient";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { makeDateString } from '../../utils';

// !!!TODO!!!
// 1. split stuff into components
// 2. research performance
// 3. see how I can force max lines on markdown
function Post({ post, isExpanded, navigation }: {
  post: PostView,
  isExpanded?: boolean,
  navigation?: NativeStackNavigationProp<any, "Feed">
}) {
  const [imgDimensions, setImgDimensions] = React.useState({ width: 0, height: 0 })
  const [isFullImg, setIsFullImg] = React.useState(false)
  const { colors } = useTheme();
  const sch = useColorScheme()

  // flags to mark the post
  const isNsfw = post.post.nsfw || post.community.nsfw;
  const isPic = post.post.url ? /\.(jpeg|jpg|gif|png)$/.test(post.post.url) : false;
  // const isLocal = post.post.local; // do I even need it?

  const maxLines = isExpanded ? undefined : 3;
  const safeDescription = post.post.body ? isExpanded ? post.post.body : post.post.body.slice(0, 500) : ''
  const dateStr = makeDateString(post.post.published)

  React.useEffect(() => {
    if (isPic && isExpanded) {
      Image.getSize(post.post.url, (picWidth, picHeight) => {
        const { width } = Dimensions.get('window')
        const safeHeight = (width / picWidth) * picHeight

        setImgDimensions({ width, height: safeHeight })
      })
    }
  }, [isPic, isExpanded])

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
      {isNsfw ? (
        <Text style={{ color: 'red', marginTop: 8 }}>
          NSFW
        </Text>
      ) : null}
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
              blurRadius={isNsfw ? 15 : 0}
            />
          ) : (
             <View style={{ maxHeight: 200, overflow: 'hidden' }}>
               <Markdown
                 value={safeDescription}
                 theme={{ colors: sch === 'dark' ? mdTheme.dark : mdTheme.light }}
               />
             </View>
           )}
        </TouchableOpacity>
      ) : (
         <View>
           {isPic ? (
             <View>
               <View style={{ maxHeight: isFullImg ? undefined : 720, overflow: 'hidden' }}>
                 <Image
                   source={{ uri: post.post.url }}
                   style={{ width: '100%', height: imgDimensions.height }}
                   progressiveRenderingEnabled
                   resizeMode={'contain'}
                   alt={"Post image"}
                 />
               </View>
               {isFullImg || imgDimensions.height <= 720 ? null : (
                   <TouchableOpacity style={styles.previewButton} onPress={() => setIsFullImg(true)}>
                     <Text>Show full image</Text>
                   </TouchableOpacity>
               )}
             </View>
           ) : null}
           <Markdown
             value={safeDescription}
             theme={{ colors: sch === 'dark' ? mdTheme.dark : mdTheme.light }}
           />
         </View>
       )}
      <View style={styles.iconsRow}>
        <View style={styles.infoPiece}>
          <Icon accessibilityLabel={"total rating"} name={"chevrons-up"} size={24} />
          <Text>
            {post.counts.score} ({Math.ceil(
            (post.counts.upvotes / (post.counts.upvotes + post.counts.downvotes)) * 100)}%)
          </Text>
        </View>
        <View style={{ flex: 1 }} />
        <View style={styles.infoPiece}>
          <Icon accessibilityLabel={"total comments (+ unread)"} name={"message-square"} size={24} />
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
          <Icon
            accessibilityLabel={"bookmark post button"}
            name={"bookmark"}
            size={24}
            color={post.saved ? 'red' : undefined}
          />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => Share.share(
            { url: post.post.ap_id, message: Platform.OS === 'ios' ? '' : post.post.ap_id, title: post.post.name },
            { dialogTitle: post.post.name }
          )}
        >
          <Icon accessibilityLabel={"share post button"} name={"share-2"} size={24} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            Vibration.vibrate(50)
            void apiClient.postStore.ratePost(
              post.post.id, apiClient.loginDetails, Score.Downvote)
          }}
        >
          <Icon
            accessibilityLabel={"downvote post"}
            name={"arrow-down"}
            size={24}
            color={post.my_vote === -1 ? "red" : undefined}
          />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            Vibration.vibrate(50)
            void apiClient.postStore.ratePost(
              post.post.id, apiClient.loginDetails, Score.Upvote)
          }}
        >
          <Icon
            accessibilityLabel={"upvote post"}
            name={"arrow-up"}
            size={24}
            color={post.my_vote === 1 ? "red" : undefined}
          />
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
  imageBox: {
    alignItems: "center",
    gap: 4
  },
  previewButton: {
    width: '100%',
    alignItems: 'center',
    padding: 12,
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
  postImg: { width: '100%', height: 340 },
})

export default observer(Post);