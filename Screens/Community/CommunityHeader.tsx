import React from "react";
import { observer } from "mobx-react-lite";
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Image,
  useColorScheme,
  Linking,
} from "react-native";
import { useTheme } from "@react-navigation/native";
import { apiClient } from "../../store/apiClient";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Text, TouchableOpacity } from "../../ThemedComponents";
import { mdTheme } from "../../commonStyles";
import Markdown from "react-native-marked";

function CommunityHeader({
  navigation,
  route,
}: NativeStackScreenProps<any, "Community">) {
  const [showDescription, setShowDescription] = React.useState(false);
  const { colors } = useTheme();
  const sch = useColorScheme();
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
      {community.community.description ? (
        <View>
          <TouchableOpacity
            onPressCb={() => setShowDescription(!showDescription)}
          >
            <Text>{showDescription ? "Hide" : "Show"} description</Text>
          </TouchableOpacity>
          {showDescription ? (
            <Markdown
              value={community.community.description}
              theme={{
                colors: sch === "dark" ? mdTheme.dark : mdTheme.light,
              }}
            />
          ) : null}
        </View>
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
  wrapper: { flex: 1, width: "100%" },
});

export default observer(CommunityHeader);