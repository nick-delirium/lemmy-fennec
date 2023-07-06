import React from "react";
import { observer } from "mobx-react-lite";
import { View, FlatList, StyleSheet, Share, ToastAndroid } from "react-native";
import { Text, Icon, TouchableOpacity } from "../../ThemedComponents";
import { apiClient } from "../../store/apiClient";
import { CommentReplyView } from "lemmy-js-client";
import { commonStyles } from "../../commonStyles";
import { useTheme, NavigationProp } from "@react-navigation/native";
import FAB from "../../components/FAB";
import MiniComment from "../../components/TinyComment";

function Replies({ navigation }) {
  const { colors } = useTheme();
  const [isOpen, setIsOpen] = React.useState(false);

  // only logged user can see this component
  React.useEffect(() => {
    void apiClient.mentionsStore.getReplies(apiClient.loginDetails.jwt);
    return () => {
      closeAll();
    };
  }, []);

  const openMenu = () => {
    setIsOpen(true);
  };
  const closeAll = () => {
    setIsOpen(false);
  };
  const markAllRead = () => {
    void apiClient.mentionsStore.markAllRepliesRead(apiClient.loginDetails.jwt);
    closeAll();
  };

  const nextPage = () => {
    if (apiClient.mentionsStore.replies.length > 0) {
      apiClient.mentionsStore.setPage(apiClient.mentionsStore.page + 1);
      void apiClient.mentionsStore.getReplies(apiClient.loginDetails.jwt);
    }
  };

  const refresh = () => {
    apiClient.mentionsStore.setPage(1);
    void apiClient.mentionsStore.getReplies(apiClient.loginDetails.jwt);
  };
  return (
    <View style={{ flex: 1 }}>
      <FlatList
        style={styles.container}
        data={apiClient.mentionsStore.replies}
        onRefresh={refresh}
        onEndReached={nextPage}
        refreshing={apiClient.mentionsStore.isLoading}
        renderItem={({ item }) => <Reply item={item} navigation={navigation} />}
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
    apiClient.commentsStore.setReplyTo({
      postId: item.post.id,
      parent_id: item.comment.id,
      title: item.post.name,
      community: item.community.name,
      published: item.comment.published,
      author: item.creator.name,
      content: item.comment.content,
    });
    navigation.navigate("CommentWrite");
  };
  const openPost = () => {
    navigation.navigate("Post", { post: item.post.id });
  };
  return (
    <View
      style={{
        ...commonStyles.iconsRow,
        flexDirection: apiClient.profileStore.leftHanded
          ? "row-reverse"
          : "row",
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
      <TouchableOpacity
        simple
        onPressCb={() =>
          apiClient.mentionsStore.markReplyRead(
            apiClient.loginDetails.jwt,
            item.comment_reply.id
          )
        }
      >
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
