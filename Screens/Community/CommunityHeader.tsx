import React from "react";
import { observer } from "mobx-react-lite";
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Image,
  Linking,
} from "react-native";
import { useTheme } from "@react-navigation/native";
import { apiClient } from "../../store/apiClient";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Text, TouchableOpacity, Icon } from "../../ThemedComponents";
import MdRenderer from "../../components/MdRenderer";

function CommunityHeader({
  navigation,
  route,
}: NativeStackScreenProps<any, "Community">) {
  const [showDescription, setShowDescription] = React.useState(false);
  const { colors } = useTheme();
  const { community } = apiClient.communityStore;
  React.useEffect(() => {
    if (community === null && !apiClient.communityStore.isLoading) {
      void apiClient.communityStore.getCommunity(
        route.params.id,
        apiClient.loginDetails
      );
    }
  }, [community, navigation]);

  if (apiClient.communityStore.isLoading || community === null)
    return <ActivityIndicator />;

  const onProfileUrlPress = async () => {
    try {
      await Linking.openURL(community.community.actor_id);
    } catch (e) {
      console.error(e);
    }
  };

  const showFollow = Boolean(apiClient.loginDetails?.jwt);
  const isFollowing = community.subscribed === "Subscribed";
  const followingStr =
    community.subscribed === "Pending"
      ? community.subscribed
      : isFollowing
      ? "Unsubscribe"
      : "Subscribe";

  const follow = () => {
    if (community.subscribed === "Pending") return;
    void apiClient.communityStore.followCommunity(
      community.community.id,
      !isFollowing,
      apiClient.loginDetails
    );
  };

  const createPost = () => {
    navigation.navigate("PostWrite", {
      communityName: community.community.name,
      communityId: community.community.id,
    });
  };
  return (
    <View style={styles.wrapper}>
      <View style={styles.header}>
        {community.community.icon ? (
          <Image
            source={{ uri: community.community.icon }}
            style={styles.communityIcon}
          />
        ) : null}
        <View>
          <Text style={styles.title}>{community.community.name}</Text>
          <TouchableOpacity onPressCb={onProfileUrlPress} simple>
            <Text style={{ color: colors.border }}>
              {community.community.actor_id}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.counts}>
        <Text>{community.counts.posts} posts</Text>
        <Text>{community.counts.subscribers} subscribers</Text>
        <Text>{community.counts.users_active_day} daily users</Text>
      </View>
      <View style={styles.buttons}>
        {community.community.description ? (
          <TouchableOpacity
            style={{ flexDirection: "row" }}
            onPressCb={() => setShowDescription(!showDescription)}
          >
            <Icon
              name={showDescription ? "chevron-up" : "chevron-down"}
              size={18}
              color={"white"}
            />
            <Text>Description</Text>
          </TouchableOpacity>
        ) : null}
        {showFollow ? (
          <TouchableOpacity onPressCb={follow}>
            <Text>{followingStr}</Text>
          </TouchableOpacity>
        ) : null}
        {showFollow && !community?.community.posting_restricted_to_mods ? (
          <TouchableOpacity onPressCb={createPost}>
            <Text>New Post</Text>
          </TouchableOpacity>
        ) : null}
      </View>
      {showDescription ? (
        <MdRenderer value={community.community.description} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", padding: 8, gap: 8 },
  counts: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    justifyContent: "space-between",
  },
  communityIcon: { width: 48, height: 48, borderRadius: 48 },
  title: { fontSize: 22, fontWeight: "bold" },
  wrapper: { flex: 1, width: "100%", paddingHorizontal: 6 },
  buttons: { flexDirection: "row", gap: 8, flex: 1 },
});

export default observer(CommunityHeader);
