import React from "react";
import { observer } from "mobx-react-lite";
import {
  ActivityIndicator,
  View,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from "react-native";
import { apiClient } from "../../store/apiClient";
import Post from "../Feed/Post";
import { useTheme } from "@react-navigation/native";
import CommentsFloatingMenu from "./CommentsFloatingMenu";
import CommentFlatList from "./CommentsFlatlist";
import { TextInput, TouchableOpacity, Icon } from "../../ThemedComponents";
import useKeyboard from "../../utils/useKeyboard";
import { useHeaderHeight } from "@react-navigation/elements";

function PostScreen() {
  const post = apiClient.postStore.singlePost;
  const { colors } = useTheme();
  const keyboardHeight = useKeyboard();
  const height = useHeaderHeight();
  React.useEffect(() => {
    if (apiClient.commentsStore.api) {
      void apiClient.commentsStore.getComments(
        post.post.id,
        apiClient.loginDetails
      );
    }
  }, [apiClient.commentsStore.api]);

  if (!post) return <ActivityIndicator />;

  return (
    <View style={{ flex: 1 }}>
      <CommentFlatList
        header={<Post post={post} isExpanded />}
        refreshing={apiClient.commentsStore.isLoading}
        comments={apiClient.commentsStore.commentTree}
        colors={colors}
      />
      <CommentsFloatingMenu isLoading={apiClient.commentsStore.isLoading} />
      {/* adding this later <KeyboardAvoidingView*/}
      {/*    behavior={Platform.OS === "ios" ? "padding" : "height"}*/}
      {/*    style={{ position: 'absolute', bottom: 0, width: '100%' }}*/}
      {/*  >*/}
      {/*    <View style={{ ...styles.inputRow, backgroundColor: colors.card }}>*/}
      {/*      <TextInput style={{ flex: 1 }} />*/}
      {/*      <TouchableOpacity style={styles.additionalButtonStyle} isSecondary onPressCb={() => console.log('Keyboard.dismiss()')}>*/}
      {/*        <Icon name={"send"} accessibilityLabel={'Send text'} size={24} />*/}
      {/*      </TouchableOpacity>*/}
      {/*    </View>*/}
      {/*</KeyboardAvoidingView>*/}
    </View>
  );
}
//
// const styles = StyleSheet.create({
//   inputRow: { paddingHorizontal: 6, paddingVertical: 12, flexDirection: 'row', gap: 6 },
//   additionalButtonStyle: { justifyContent: 'center' },
// })

export default observer(PostScreen);
