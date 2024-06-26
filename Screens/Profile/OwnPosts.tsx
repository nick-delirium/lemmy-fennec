import React from "react";
import { FlatList, Share, StyleSheet, View } from "react-native";

import { useTheme } from "@react-navigation/native";
import { PostView } from "lemmy-js-client";
import { observer } from "mobx-react-lite";

import { Icon, Text, TouchableOpacity } from "../../ThemedComponents";
import { commonColors, commonStyles } from "../../commonStyles";
import Pagination from "../../components/Pagination";
import MiniComment from "../../components/TinyComment";
import { apiClient } from "../../store/apiClient";
import { preferences } from "../../store/preferences";

// TODO: FAB with sort type

function OwnPosts({ navigation }) {
  const { colors } = useTheme();
  const posts = apiClient.profileStore.userProfile?.posts ?? [];

  const refresh = () => {
    apiClient.profileStore.setProfilePage(1);
    void apiClient.profileStore.getProfile({
      person_id: apiClient.profileStore.userProfile.person_view.person.id,
      limit: 30,
    });
  };

  const getPost = (post: PostView) => {
    navigation.navigate("Post", { post: post.post.id });
  };

  const nextPage = () => {
    apiClient.profileStore.setProfilePage(
      apiClient.profileStore.profilePage + 1
    );
    void apiClient.profileStore.getProfile({
      person_id: apiClient.profileStore.userProfile.person_view.person.id,
      limit: 30,
    });
  };

  const prevPage = () => {
    if (apiClient.profileStore.profilePage === 1) return;
    apiClient.profileStore.setProfilePage(
      apiClient.profileStore.profilePage - 1
    );
    void apiClient.profileStore.getProfile({
      person_id: apiClient.profileStore.userProfile.person_view.person.id,
      limit: 30,
    });
  };

  const renderItem = ({ item }) => <OwnPost item={item} getPost={getPost} />;
  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={posts}
        onRefresh={refresh}
        style={styles.container}
        refreshing={apiClient.profileStore.isLoading}
        ItemSeparatorComponent={() => (
          <View
            style={{ height: 1, width: "100%", backgroundColor: colors.border }}
          />
        )}
        ListEmptyComponent={
          <View style={styles.container}>
            <Text style={styles.empty}>Nothing is here for now...</Text>
          </View>
        }
        keyExtractor={(item) => item.post.id.toString()}
        renderItem={renderItem}
      />
      <Pagination
        page={apiClient.profileStore.profilePage}
        nextPage={nextPage}
        prevPage={prevPage}
        itemsLength={posts?.length ?? 0}
      />
    </View>
  );
}

function OwnPost({
  item,
  getPost,
}: {
  item: PostView;
  getPost: (post: PostView) => void;
}) {
  return (
    <View>
      <MiniComment
        published={item.post.published}
        author={""}
        isSelf
        community={item.community.name}
        communityPic={item.community.icon}
        title={item.post.name}
        content={item.post.body}
      />
      <View
        style={{
          ...commonStyles.iconsRow,
          flexDirection: preferences.leftHanded ? "row-reverse" : "row",
        }}
      >
        <View style={{ flex: 1 }} />
        <TouchableOpacity simple onPressCb={() => getPost(item)}>
          <Icon name={"corner-down-right"} size={24} />
        </TouchableOpacity>
        <TouchableOpacity
          simple
          onPressCb={() =>
            Share.share({
              url: item.post.ap_id,
              message: item.post.ap_id,
            })
          }
        >
          <Icon
            name={"share-2"}
            accessibilityLabel={"share post button"}
            size={24}
          />
        </TouchableOpacity>
        <View style={styles.row}>
          <Icon
            name={"arrow-up"}
            color={preferences.voteColors.upvote}
            size={24}
          />
          <Text customColor={preferences.voteColors.upvote}>
            {item.counts.upvotes}
          </Text>
        </View>
        <View style={styles.row}>
          <Icon
            name={"arrow-down"}
            color={preferences.voteColors.downvote}
            size={24}
          />
          <Text customColor={preferences.voteColors.downvote}>
            {item.counts.downvotes}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  comment: {
    paddingVertical: 8,
  },
  empty: {
    fontSize: 16,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
});

export default observer(OwnPosts);
