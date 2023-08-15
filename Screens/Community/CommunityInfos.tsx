import React from "react";
import { Image, Linking, ScrollView, StyleSheet, View } from "react-native";

import { useTheme } from "@react-navigation/native";
import { observer } from "mobx-react-lite";

import { Text, TouchableOpacity } from "../../ThemedComponents";
import MdRenderer from "../../components/MdRenderer";
import { apiClient } from "../../store/apiClient";

function CommunityInfos({ navigation, route }) {
  const { colors } = useTheme();
  const { community } = apiClient.communityStore;
  React.useEffect(() => {
    if (community === null && !apiClient.communityStore.isLoading) {
      void apiClient.communityStore.getCommunity(
        apiClient.loginDetails,
        route.params.id,
        route.params.name
      );
    }
  }, [community, navigation]);

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

  const toggleBlockCommunity = () => {
    void apiClient.communityStore.blockCommunity(
      community.community.id,
      !community.blocked,
      apiClient.loginDetails
    );
  };

  const canPost =
    !community?.community.posting_restricted_to_mods ||
    apiClient.profileStore.moderatedCommunities.findIndex(
      (c) => c.community.id === community.community.id
    ) !== -1;

  console.log(canPost);
  return (
    <ScrollView style={styles.wrapper}>
      <View style={styles.header}>
        {community.community.icon ? (
          <Image
            source={{ uri: community.community.icon }}
            style={styles.communityIcon}
          />
        ) : null}
        {/* title information and link */}
        <View>
          <Text style={styles.title}>{community.community.name}</Text>

          <View style={styles.titleRow}>
            {community.community.nsfw ? (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>NSFW</Text>
              </View>
            ) : null}
            <TouchableOpacity onPressCb={onProfileUrlPress} simple>
              <Text style={{ color: colors.border }}>
                {community.community.actor_id}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
      {/* counters */}
      <View style={styles.counts}>
        <Text style={styles.counter}>{community.counts.posts} posts</Text>
        <Text style={styles.counter}>
          {community.counts.subscribers} subscribers
        </Text>
        <Text style={styles.counter}>
          {community.counts.users_active_day} daily users
        </Text>
      </View>
      <View style={styles.buttons}>
        {showFollow ? (
          <>
            <TouchableOpacity onPressCb={follow}>
              <Text>{followingStr}</Text>
            </TouchableOpacity>
            {canPost ? (
              <TouchableOpacity onPressCb={createPost}>
                <Text>New Post</Text>
              </TouchableOpacity>
            ) : null}
            <TouchableOpacity
              onPressCb={toggleBlockCommunity}
              style={{ backgroundColor: "red" }}
            >
              <Text>{community.blocked ? "Unblock" : "Block"}</Text>
            </TouchableOpacity>
          </>
        ) : null}
      </View>
      {community.community.description ? (
        <ScrollView
          horizontal
          contentContainerStyle={{ width: "100%", height: "100%" }}
        >
          <MdRenderer value={community.community.description} />
        </ScrollView>
      ) : null}
    </ScrollView>
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
  counter: {
    fontSize: 16,
    fontWeight: "500",
  },
  communityIcon: { width: 56, height: 56, borderRadius: 48 },
  title: { fontSize: 22, fontWeight: "bold", flex: 1 },
  titleRow: {
    gap: 8,
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  wrapper: { flex: 1, width: "100%", paddingHorizontal: 6 },
  buttons: { flexDirection: "row", gap: 8, flex: 1 },
  badge: {
    backgroundColor: "red",
    borderRadius: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  badgeText: { color: "white", fontWeight: "bold", fontSize: 12 },
});

export default observer(CommunityInfos);
