import React from "react";
import { StyleSheet, View } from "react-native";

import { useTheme } from "@react-navigation/native";
import { observer } from "mobx-react-lite";

import { Text } from "../../ThemedComponents";
import Select from "../../components/Select";
import { apiClient } from "../../store/apiClient";
import { ListingTypeMap } from "../../store/postStore";
import { SearchTypeMap } from "../../store/searchStore";

const searchTypeOptions = Object.values(SearchTypeMap).map((type) => ({
  label: type,
  value: type,
}));
const listingTypeOptions = Object.values(ListingTypeMap).map((type) => ({
  label: type,
  value: type,
}));

function SearchSettings() {
  const { colors } = useTheme();

  return (
    <View style={{ ...styles.searchControls, borderColor: colors.border }}>
      <View style={styles.flex}>
        <Text style={styles.label}>Search type:</Text>
        <Select
          title={"Search type"}
          accessibilityLabel={"Search type picker"}
          value={apiClient.searchStore.type}
          options={searchTypeOptions}
          onChange={(value) => apiClient.searchStore.setSearchType(value)}
        />
      </View>
      <View style={styles.flex}>
        <Text style={styles.label}>Listing type:</Text>
        <Select
          title={"Listing type"}
          accessibilityLabel={"Listing type picker"}
          value={apiClient.searchStore.listingType}
          options={listingTypeOptions}
          onChange={(value) => apiClient.searchStore.setListingType(value)}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, gap: 4 },
  label: { fontSize: 13, opacity: 0.6 },
  searchPage: { flex: 1, padding: 6 },
  searchControls: {
    borderBottomWidth: 1,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    padding: 8,
  },
  inputRow: {
    paddingHorizontal: 6,
    paddingVertical: 12,
    flexDirection: "row",
    gap: 6,
  },
  additionalButtonStyle: { justifyContent: "center" },
});

export default observer(SearchSettings);
