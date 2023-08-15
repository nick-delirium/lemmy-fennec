import React from "react";
import { StyleSheet, View } from "react-native";

import { useActionSheet } from "@expo/react-native-action-sheet";
import { useTheme } from "@react-navigation/native";

import { Icon, Text, TouchableOpacity } from "../../../ThemedComponents";
import { commonColors, commonStyles } from "../../../commonStyles";
import { Score, apiClient } from "../../../store/apiClient";
import { preferences } from "../../../store/preferences";
import { shortenNumbers } from "../../../utils/utils";

function CommentIconRow({
  scoreColor,
  openReporting,
  shareComment,
  downvoteComment,
  upvoteComment,
  replyToComment,
  score,
  upvotes,
  downvotes,
  my_vote,
  child_count,
  onCopy,
  editComment,
  selfComment,
}: {
  scoreColor: string;
  score: number;
  upvotes: number;
  downvotes: number;
  my_vote: number;
  selfComment?: boolean;
  child_count: number;
  openReporting: () => void;
  shareComment: () => void;
  downvoteComment: () => void;
  upvoteComment: () => void;
  openCommenting?: () => void;
  replyToComment?: () => void;
  onCopy: () => void;
  editComment?: () => void;
}) {
  const { showActionSheetWithOptions } = useActionSheet();
  const { colors } = useTheme();

  const openMenu = React.useCallback(() => {
    const options = ["Report", "Copy", "Cancel"];

    const icons = [
      <Icon name={"alert-circle"} size={24} />,
      <Icon name={"copy"} size={24} />,
      <Icon name={"x"} size={24} />,
    ];
    if (apiClient.loginDetails?.jwt && selfComment) {
      options.splice(1, 0, "Edit");
      icons.splice(1, 0, <Icon name={"edit-2"} size={24} />);
    }
    const textStyle = {
      color: colors.text,
    };
    const containerStyle = {
      backgroundColor: colors.card,
    };
    const cancelIndex = options.findIndex((o) => o === "Cancel");
    const destructiveIndex = options.findIndex((o) => o === "Report");
    const copyIndex = options.findIndex((o) => o === "Copy");
    const editIndex = options.findIndex((o) => o === "Edit");
    showActionSheetWithOptions(
      {
        options,
        icons,
        cancelButtonIndex: cancelIndex,
        destructiveButtonIndex: destructiveIndex,
        textStyle,
        containerStyle,
      },
      (selectedIndex: number) => {
        switch (selectedIndex) {
          case 0:
            openReporting();
            break;
          case copyIndex:
            onCopy();
            break;
          case editIndex:
            editComment();
            break;
          default:
            break;
        }
      }
    );
  }, [apiClient.loginDetails?.jwt]);

  const votingButtons = React.useMemo(() => {
    const buttons = [
      <TouchableOpacity
        key={"downvotebuttoncomment"}
        style={commonStyles.touchableIcon}
        feedback
        simple
        onPressCb={downvoteComment}
      >
        <Icon
          accessibilityLabel={"downvote comment"}
          name={"arrow-down"}
          size={24}
          color={my_vote === Score.Downvote ? commonColors.downvote : undefined}
        />
      </TouchableOpacity>,
      <TouchableOpacity
        key={"upvotebuttoncomment"}
        style={commonStyles.touchableIcon}
        feedback
        onPressCb={upvoteComment}
        simple
      >
        <Icon
          accessibilityLabel={"upvote comment"}
          name={"arrow-up"}
          size={24}
          color={my_vote === Score.Upvote ? commonColors.upvote : undefined}
        />
      </TouchableOpacity>,
    ];
    return preferences.swapVotingButtons ? buttons.reverse() : buttons;
  }, [preferences.swapVotingButtons, my_vote]);
  return (
    <View
      style={{
        ...styles.bottomRow,
        flexDirection: preferences.leftHanded ? "row-reverse" : "row",
      }}
    >
      <View style={styles.infoPiece}>
        <Icon
          accessibilityLabel={"total rating (upvote percent)"}
          name={"chevrons-up"}
          size={24}
          color={scoreColor}
        />
        <Text customColor={scoreColor}>
          {shortenNumbers(score)} (
          {score !== 0 ? Math.ceil((upvotes / (upvotes + downvotes)) * 100) : 0}
          %)
        </Text>
      </View>

      <View style={{ flex: 1 }} />
      {apiClient.loginDetails?.jwt ? (
        <TouchableOpacity
          style={commonStyles.touchableIcon}
          simple
          onPressCb={openMenu}
        >
          <Icon name={"more-vertical"} size={24} />
        </TouchableOpacity>
      ) : null}
      <TouchableOpacity
        simple
        style={{ ...styles.infoPiece, ...commonStyles.touchableIcon }}
        onPressCb={replyToComment}
      >
        <Icon
          accessibilityLabel={"Write a comment on this comment"}
          name={"message-square"}
          size={24}
        />
        <Text>{child_count}</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={commonStyles.touchableIcon}
        simple
        onPressCb={shareComment}
      >
        <Icon
          accessibilityLabel={"share comment button"}
          name={"share-2"}
          size={24}
        />
      </TouchableOpacity>
      {votingButtons}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 8,
    borderBottomWidth: 1,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  infoPiece: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
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
  bottomRow: {
    gap: 12,
    paddingTop: 4,
    paddingBottom: 4,
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

export default React.memo(CommentIconRow);
