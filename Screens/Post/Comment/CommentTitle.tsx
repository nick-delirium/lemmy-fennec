import React from "react";
import { Icon, Text, TouchableOpacity } from "../../../ThemedComponents";
import { StyleSheet, View } from "react-native";
import { CommentNode } from "../../../store/commentsStore";
import { makeDateString } from "../../../utils/utils";

function CommentTitle({
  comment,
  getAuthor,
}: {
  comment: CommentNode;
  getAuthor?: (author: number) => void;
}) {
  const commentDate = React.useMemo(
    () => makeDateString(comment.comment.published),
    []
  );
  return (
    <View style={styles.topRow}>
      <TouchableOpacity simple onPressCb={() => getAuthor(comment.creator.id)}>
        <View style={styles.row}>
          <Text style={styles.author}>
            u/{comment.creator.display_name || comment.creator.name}
          </Text>
          {comment.post.creator_id === comment.creator.id ? (
            <View style={styles.op}>
              <Text style={styles.opText}>OP</Text>
            </View>
          ) : null}
          {comment.creator.admin ? <Icon name={"shield"} size={16} /> : null}
        </View>
      </TouchableOpacity>
      <Text style={styles.date}>{commentDate}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  date: {
    fontWeight: "300",
    fontSize: 12,
  },
  author: {
    fontSize: 12,
    fontWeight: "500",
    color: "orange",
  },
  row: {
    flexDirection: "row",
    gap: 6,
    alignItems: "center",
  },
  op: {
    borderRadius: 4,
    paddingVertical: 2,
    paddingHorizontal: 4,
    backgroundColor: "red",
  },
  opText: {
    fontSize: 10,
    fontWeight: "600",
  },
});

export default React.memo(CommentTitle);
