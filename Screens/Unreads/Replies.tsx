import React from "react";
import { FlatList, Share, StyleSheet, View } from "react-native";

import { useTheme } from "@react-navigation/native";
import { CommentReplyView } from "lemmy-js-client";
import { observer } from "mobx-react-lite";

import { Icon, Text, TouchableOpacity } from "../../ThemedComponents";
import { commonStyles } from "../../commonStyles";
import FAB from "../../components/FAB";
import MiniComment from "../../components/TinyComment";
import { apiClient } from "../../store/apiClient";
import { preferences } from "../../store/preferences";

function Replies({ navigation }) {
  const { colors } = useTheme();
  const [isOpen, setIsOpen] = React.useState(false);

  // only logged user can see this component
  React.useEffect(() => {
    const unsub = navigation.addListener("focus", () => {
      if (apiClient.mentionsStore.replies.length !== 0) return;
      else {
        void apiClient.mentionsStore.getReplies();
      }
    });

    return () => {
      closeAll();
      unsub();
    };
  }, [apiClient.mentionsStore.replies.length]);

  const openMenu = () => {
    setIsOpen(true);
  };
  const closeAll = () => {
    setIsOpen(false);
  };
  const markAllRead = () => {
    apiClient.mentionsStore.markAllRepliesRead().then(() => {
      void apiClient.mentionsStore.fetchUnreads();
    });
    closeAll();
  };

  const nextPage = () => {
    if (apiClient.mentionsStore.replies.length > 5) {
      apiClient.mentionsStore.setPage(apiClient.mentionsStore.page + 1);
      void apiClient.mentionsStore.getReplies();
    }
  };

  const refresh = () => {
    apiClient.mentionsStore.setPage(1);
    apiClient.mentionsStore.fetchUnreads().then(() => {
      void apiClient.mentionsStore.getReplies();
    });
  };

  const renderItem = ({ item }) => (
    <Reply item={item} navigation={navigation} />
  );
  return (
    <View style={{ flex: 1 }}>
      <FlatList
        style={styles.container}
        data={apiClient.mentionsStore.replies}
        onRefresh={refresh}
        refreshing={apiClient.mentionsStore.isLoading}
        renderItem={renderItem}
        ItemSeparatorComponent={() => (
          <View
            style={{ height: 1, width: "100%", backgroundColor: colors.border }}
          />
        )}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={
          <View style={styles.container}>
            <Text style={styles.empty}>
              No replies yet. Try posting something?
            </Text>
          </View>
        }
      />

      <FAB>
        {isOpen ? (
          <View
            style={{ ...commonStyles.fabMenu, backgroundColor: colors.card }}
          >
            <TouchableOpacity simple onPressCb={markAllRead}>
              <Text>Mark all read</Text>
            </TouchableOpacity>
          </View>
        ) : null}
        <TouchableOpacity
          simple
          onPressCb={() => (isOpen ? closeAll() : openMenu())}
        >
          <View
            style={{
              ...commonStyles.fabButton,
              zIndex: 10,
              elevation: 10,
              backgroundColor: colors.card,
            }}
          >
            <Icon name={isOpen ? "x" : "menu"} size={24} />
          </View>
        </TouchableOpacity>
      </FAB>
    </View>
  );
}

function Reply({
  item,
  navigation,
}: {
  item: CommentReplyView;
  navigation: any;
}) {
  const isRead = item.comment_reply.read;
  return (
    <View style={{ opacity: isRead ? 0.6 : 1, paddingHorizontal: 6 }}>
      <MiniComment
        published={item.comment_reply.published}
        author={item.creator.name}
        communityPic={item.community.icon}
        community={item.community.name}
        title={item.post.name}
        content={item.comment.content}
        isSelf={false}
      />
      <ReplyActions item={item} navigation={navigation} />
    </View>
  );
}

function ReplyActions({
  item,
  navigation,
}: {
  item: CommentReplyView;
  navigation: any;
}) {
  const openReply = () => {
    markRead();
    apiClient.commentsStore.setReplyTo({
      postId: item.post.id,
      parent_id: item.comment.id,
      title: item.post.name,
      community: item.community.name,
      published: item.comment.published,
      author: item.creator.name,
      content: item.comment.content,
      language_id: item.comment.language_id,
    });
    navigation.navigate("CommentWrite");
  };
  const openPost = () => {
    const path = item.comment.path.split(".");
    const replyId = path.findIndex(
      (id) => parseInt(id, 10) === item.comment.id
    );
    const parentId = path.length > 2 ? path[replyId - 1] : path[1];
    navigation.navigate("Post", {
      post: item.post.id,
      parentId: parentId,
      openComment: 0,
    });
  };

  const markRead = () => {
    void apiClient.mentionsStore
      .markReplyRead(item.comment_reply.id)
      .then(() => {
        void apiClient.mentionsStore.fetchUnreads();
      });
  };
  return (
    <View
      style={{
        ...commonStyles.iconsRow,
        flexDirection: preferences.leftHanded ? "row-reverse" : "row",
      }}
    >
      <View style={{ flex: 1 }} />
      <TouchableOpacity simple onPressCb={openPost}>
        <Icon name={"corner-down-right"} size={24} />
      </TouchableOpacity>
      <TouchableOpacity simple onPressCb={openReply}>
        <Icon name={"edit"} size={24} />
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
        <Icon name={"link"} size={24} />
      </TouchableOpacity>
      <TouchableOpacity simple onPressCb={markRead}>
        <Icon name={"check-square"} size={24} />
      </TouchableOpacity>
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
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
});

export default observer(Replies);
