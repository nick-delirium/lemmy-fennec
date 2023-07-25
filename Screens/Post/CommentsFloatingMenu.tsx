import React from "react";
import { View, TouchableOpacity, ActivityIndicator } from "react-native";
import { useTheme, Theme } from "@react-navigation/native";
import { observer } from "mobx-react-lite";
import { apiClient } from "../../store/apiClient";
import { Icon, Text } from "../../ThemedComponents";
import { CommentSortTypeMap } from "../../store/commentsStore";
import FAB from "../../components/FAB";
// I know its basically a copy paste of Feed FAB but I'm very lazy
import { commonStyles } from "../../commonStyles";

function splitCamelCase(str: string) {
  return str.replace(/([a-z])([A-Z])/g, "$1 $2");
}

const sortTypes = Object.values(CommentSortTypeMap).map((type) => ({
  label: splitCamelCase(type),
  value: type,
}));

function CommentsFloatingMenu({ isLoading }: { isLoading: boolean }) {
  const { colors } = useTheme();
  const [isSortOpen, setIsSortOpen] = React.useState(false);
  const [isOpen, setIsOpen] = React.useState(false);

  const switchToSort = () => {
    setIsSortOpen(true);
    setIsOpen(false);
  };
  const openMenu = () => {
    setIsOpen(true);
    setIsSortOpen(false);
  };
  const closeAll = () => {
    setIsOpen(false);
    setIsSortOpen(false);
  };

  return (
    <FAB elevated>
      {isSortOpen ? <SortMenu colors={colors} closeSelf={closeAll} /> : null}
      {isOpen ? (
        <View style={{ ...commonStyles.fabMenu, backgroundColor: colors.card }}>
          <TouchableOpacity onPress={() => switchToSort()}>
            <Text style={{ fontWeight: "500" }}>Change sorting type</Text>
          </TouchableOpacity>
        </View>
      ) : null}
      {isLoading ? (
        <View
          style={{ ...commonStyles.fabButton, backgroundColor: colors.card }}
        >
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : (
        <TouchableOpacity onPress={() => (isOpen ? closeAll() : openMenu())}>
          <View
            style={{ ...commonStyles.fabButton, backgroundColor: colors.card }}
          >
            <Icon name={isOpen ? "x" : "menu"} size={24} />
          </View>
        </TouchableOpacity>
      )}
    </FAB>
  );
}

function SortMenu({
  colors,
  closeSelf,
}: {
  colors: Theme["colors"];
  closeSelf: () => void;
}) {
  const setSorting = (
    sort: (typeof CommentSortTypeMap)[keyof typeof CommentSortTypeMap]
  ) => {
    void apiClient.commentsStore.setFilters({ sort: sort });
    void apiClient.commentsStore.getComments(
      apiClient.postStore.singlePost.post.id,
      apiClient.loginDetails
    );
    closeSelf();
  };

  return (
    <View style={{ ...commonStyles.fabMenu, backgroundColor: colors.card }}>
      {sortTypes.map((type) => (
        <TouchableOpacity
          key={type.value}
          onPress={() => setSorting(type.value)}
        >
          <Text style={{ fontWeight: "500" }}>{type.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

export default observer(CommentsFloatingMenu);
