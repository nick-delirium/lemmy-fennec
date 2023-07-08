import React from "react";
import { observer } from "mobx-react-lite";
import { View, FlatList, StyleSheet, Share } from "react-native";
import { Text, Icon, TouchableOpacity } from "../../ThemedComponents";
import { apiClient } from "../../store/apiClient";
import { CommentView } from "lemmy-js-client";
import { commonStyles, commonColors } from "../../commonStyles";
import { useTheme } from "@react-navigation/native";
// import FAB from "../../components/FAB";
import MiniComment from "../../components/TinyComment";
import Pagination from "../../components/Pagination";

// TODO: FAB with sort type

function OwnComments({ navigation }) {
  const { colors } = useTheme();
  const comments = apiClient.profileStore.userProfile?.comments ?? [];

  const refresh = () => {
    apiClient.profileStore.setProfilePage(1);
    void apiClient.profileStore.getProfile(apiClient.loginDetails, {
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
    void apiClient.profileStore.getProfile(apiClient.loginDetails, {
      person_id: apiClient.profileStore.userProfile.person_view.person.id,
      limit: 30,
    });
  };
  const prevPage = () => {
    if (apiClient.profileStore.profilePage === 1) return;
    apiClient.profileStore.setProfilePage(
      apiClient.profileStore.profilePage - 1
    );
    void apiClient.profileStore.getProfile(apiClient.loginDetails, {
      person_id: apiClient.profileStore.userProfile.person_view.person.id,
      limit: 30,
    });
  };

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
        renderItem={({ item }) => <OwnComment item={item} getPost={getPost} />}
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
        community={item.community.name}
        title={item.post.name}
        content={item.comment.content}
      />
      <View
        style={{
          ...commonStyles.iconsRow,
          flexDirection: apiClient.profileStore.leftHanded
            ? "row-reverse"
            : "row",
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
          <Icon name={"share-2"} size={24} />
        </TouchableOpacity>
        <View style={styles.row}>
          <Icon name={"arrow-up"} color={commonColors.upvote} size={24} />
          <Text customColor={commonColors.upvote}>{item.counts.upvotes}</Text>
        </View>
        <View style={styles.row}>
          <Icon name={"arrow-down"} color={commonColors.downvote} size={24} />
          <Text customColor={commonColors.downvote}>
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
  paddedRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
});

export default observer(OwnComments);
