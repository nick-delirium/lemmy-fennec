import React from "react";
import { observer } from "mobx-react-lite";
import { View, FlatList, StyleSheet, Share, ToastAndroid } from "react-native";
import { Text, Icon, TouchableOpacity } from "../../ThemedComponents";
import { apiClient } from "../../store/apiClient";
import { CommentReplyView } from "lemmy-js-client";
import { commonColors, commonStyles } from "../../commonStyles";
import { makeDateString } from "../../utils/utils";
import { useTheme } from "@react-navigation/native";
import FAB from "../../components/FAB";

function Replies() {
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
  return (
    <View style={{ flex: 1 }}>
      <FlatList
        style={styles.container}
        data={apiClient.mentionsStore.replies}
        onRefresh={() =>
          void apiClient.mentionsStore.getReplies(apiClient.loginDetails.jwt)
        }
        refreshing={apiClient.mentionsStore.isLoading}
        renderItem={Reply}
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

function Reply({ item }: { item: CommentReplyView }) {
  const isRead = item.comment_reply.read;
  const dateStr = makeDateString(item.comment_reply.published);
  return (
    <View style={{ ...styles.comment, opacity: isRead ? 0.6 : 1 }}>
      <View style={styles.topRow}>
        <Text customColor={commonColors.author}>{item.creator.name}</Text>
        <Text>in</Text>
        <Text customColor={commonColors.community}>{item.community.name}</Text>
        <Text style={{ marginLeft: "auto" }}>{dateStr}</Text>
      </View>
      <View>
        <Text lines={2} style={commonStyles.title}>
          {item.post.name}
        </Text>
        <Text lines={3} style={commonStyles.text}>
          {item.comment.content}
        </Text>
      </View>
      <View
        style={{
          ...commonStyles.iconsRow,
          flexDirection: apiClient.profileStore.leftHanded
            ? "row-reverse"
            : "row",
        }}
      >
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
        <TouchableOpacity
          simple
          onPressCb={() =>
            ToastAndroid.showWithGravity(
              "This feature is under construction",
              ToastAndroid.SHORT,
              ToastAndroid.CENTER
            )
          }
        >
          <Icon name={"corner-down-right"} size={24} />
        </TouchableOpacity>
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
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
});

export default observer(Replies);
