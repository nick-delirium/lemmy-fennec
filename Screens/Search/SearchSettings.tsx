import React from "react";
import { observer } from "mobx-react-lite";
import { StyleSheet, View } from "react-native";
import { Text } from "../../ThemedComponents";
import { Picker } from "@react-native-picker/picker";
import { apiClient } from "../../store/apiClient";
import { SearchTypeMap } from "../../store/searchStore";
import { ListingTypeMap } from "../../store/postStore";
import { useTheme } from "@react-navigation/native";

function SearchSettings() {
  const { colors } = useTheme();

  return (
    <View style={{ ...styles.searchControls, borderColor: colors.border }}>
      <View style={styles.flex}>
        <Text>Search type:</Text>
        <Picker
          style={{
            height: 50,
            color: colors.text,
            borderColor: colors.border,
            borderWidth: 1,
          }}
          selectedValue={apiClient.searchStore.type}
          mode={"dropdown"}
          dropdownIconColor={colors.text}
          itemStyle={{ color: colors.text, backgroundColor: colors.card }}
          onValueChange={(itemValue) =>
            apiClient.searchStore.setSearchType(itemValue)
          }
        >
          {Object.values(SearchTypeMap).map((type) => (
            <Picker.Item key={type} label={type} value={type} />
          ))}
        </Picker>
      </View>
      <View style={styles.flex}>
        <Text>Listing type:</Text>
        <Picker
          style={{
            height: 50,
            color: colors.text,
            borderColor: colors.border,
            borderWidth: 1,
          }}
          selectedValue={apiClient.searchStore.listingType}
          mode={"dropdown"}
          dropdownIconColor={colors.text}
          itemStyle={{ color: colors.text, backgroundColor: colors.card }}
          onValueChange={(itemValue) =>
            apiClient.searchStore.setListingType(itemValue)
          }
        >
          {Object.values(ListingTypeMap).map((type) => (
            <Picker.Item key={type} label={type} value={type} />
          ))}
        </Picker>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  searchPage: { flex: 1, padding: 6 },
  searchControls: {
    borderBottomWidth: 1,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
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
