import React from "react";
import { FlatList, Share, StyleSheet, View } from "react-native";

import { useTheme } from "@react-navigation/native";
import { CommentView } from "lemmy-js-client";
import { observer } from "mobx-react-lite";

import { Icon, Text, TouchableOpacity } from "../../ThemedComponents";
import { commonColors, commonStyles } from "../../commonStyles";
import Pagination from "../../components/Pagination";
// import FAB from "../../components/FAB";
import MiniComment from "../../components/TinyComment";
import { apiClient } from "../../store/apiClient";
import { preferences } from "../../store/preferences";

// TODO: FAB with sort type

function OwnComments({ navigation }) {
  const { colors } = useTheme();
  const comments = apiClient.profileStore.userProfile?.comments ?? [];

  const refresh = () => {
    apiClient.profileStore.setProfilePage(1);
    void apiClient.profileStore.getProfile({
      person_id: apiClient.profileStore.userProfile.person_view.person.id,
      limit: 30,
    });
  };

  const getPost = (comment: CommentView) => {
    navigation.navigate("Post", {
      post: comment.post.id,
      openComment: 0,
      parentId: comment.comment.path.split(".")[1],
    });
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

  const renderItem = ({ item }) => <OwnComment item={item} getPost={getPost} />;
  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={comments}
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
        keyExtractor={(item) => item.comment.id.toString()}
        renderItem={renderItem}
      />
      <Pagination
        page={apiClient.profileStore.profilePage}
        nextPage={nextPage}
        prevPage={prevPage}
        itemsLength={comments?.length ?? 0}
      />
    </View>
  );
}

function OwnComment({
  item,
  getPost,
}: {
  item: CommentView;
  getPost: (comment: CommentView) => void;
}) {
  return (
    <View>
      <MiniComment
        published={item.comment.published}
        author={""}
        isSelf
        communityPic={item.community.icon}
        community={item.community.name}
        title={item.post.name}
        content={item.comment.content}
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
              url: item.comment.ap_id,
              message: item.comment.ap_id,
            })
          }
        >
          <Icon
            name={"share-2"}
            accessibilityLabel={"share comment button"}
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

export default observer(OwnComments);
