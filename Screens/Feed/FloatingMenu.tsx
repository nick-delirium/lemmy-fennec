import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { useTheme, Theme } from "@react-navigation/native";
import { observer } from "mobx-react-lite";
import { Score, apiClient } from "../../store/apiClient";
import { Icon, Text } from "../../ThemedComponents";
import { SortTypeMap, ListingTypeMap } from "../../store/postStore";

function splitCamelCase(str: string) {
  return str.replace(/([a-z])([A-Z])/g, "$1 $2");
}

const sortTypes = Object.values(SortTypeMap).map((type) => ({
  label: splitCamelCase(type),
  value: type,
}));
const listingTypes = Object.values(ListingTypeMap).map((type) => ({
  label: splitCamelCase(type),
  value: type,
}));

function FloatingMenu() {
  const { colors } = useTheme();
  const [isSortOpen, setIsSortOpen] = React.useState(false);
  const [isListingOpen, setIsListingOpen] = React.useState(false);
  const [isOpen, setIsOpen] = React.useState(false);

  const switchToSort = () => {
    setIsSortOpen(true);
    setIsListingOpen(false);
    setIsOpen(false);
  };
  const switchToListing = () => {
    setIsListingOpen(true);
    setIsSortOpen(false);
    setIsOpen(false);
  };
  const openMenu = () => {
    setIsOpen(true);
    setIsSortOpen(false);
    setIsListingOpen(false);
  };
  const closeAll = () => {
    setIsOpen(false);
    setIsSortOpen(false);
    setIsListingOpen(false);
  };

  // yeah this sounds dumb so I'll just leave it here for now until they'll make a filter for it
  const hideRead = () => {
    const newPosts = apiClient.postStore.posts.filter(
      (post) => post.read === false
    );
    apiClient.postStore.setPosts(newPosts);
  };

  const refresh = () => {
    void apiClient.postStore.getPosts(apiClient.loginDetails);
  };

  return (
    <View style={styles.container}>
      {isSortOpen ? <SortMenu colors={colors} closeSelf={closeAll} /> : null}
      {isListingOpen ? (
        <ListingMenu colors={colors} closeSelf={closeAll} />
      ) : null}
      {isOpen ? (
        <View style={{ ...styles.menu, backgroundColor: colors.card }}>
          <TouchableOpacity onPress={() => switchToSort()}>
            <Text style={styles.bold}>Change sorting type</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => switchToListing()}>
            <Text style={styles.bold}>Change feed type</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => refresh()}>
            <Text style={styles.bold}>Refresh</Text>
          </TouchableOpacity>
        </View>
      ) : null}
      <TouchableOpacity onPress={() => (isOpen ? closeAll() : openMenu())}>
        <View style={{ ...styles.button, backgroundColor: colors.card }}>
          <Icon name={isOpen ? "x" : "menu"} size={24} />
        </View>
      </TouchableOpacity>
    </View>
  );
}

function SortMenu({
  colors,
  closeSelf,
}: {
  colors: Theme["colors"];
  closeSelf: () => void;
}) {
  const setSorting = (sort: (typeof SortTypeMap)[keyof typeof SortTypeMap]) => {
    void apiClient.postStore.setFilters({ sort: sort });
    void apiClient.postStore.getPosts(apiClient.loginDetails);
    closeSelf();
  };

  return (
    <View style={{ ...styles.menu, backgroundColor: colors.card }}>
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

function ListingMenu({
  colors,
  closeSelf,
}: {
  colors: Theme["colors"];
  closeSelf: () => void;
}) {
  const setListing = (
    listing: (typeof ListingTypeMap)[keyof typeof ListingTypeMap]
  ) => {
    void apiClient.postStore.setFilters({ type: listing });
    void apiClient.postStore.getPosts(apiClient.loginDetails);
    closeSelf();
  };
  return (
    <View style={{ ...styles.menu, backgroundColor: colors.card }}>
      {listingTypes.map((type) => (
        <TouchableOpacity
          key={type.value}
          onPress={() => setListing(type.value)}
        >
          <Text style={{ fontWeight: "500" }}>{type.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  bold: {
    fontWeight: "500",
  },
  button: {
    padding: 12,
    maxWidth: 46,
    alignItems: "center",
    borderRadius: 24,
  },
  menu: {
    flexDirection: "column",
    gap: 16,
    padding: 12,
    borderRadius: 6,
  },
  container: {
    position: "absolute",
    alignItems: "flex-end",
    bottom: 16,
    right: 16,
    gap: 12,
  },
});

export default observer(FloatingMenu);
