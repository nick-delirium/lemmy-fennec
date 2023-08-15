import React from "react";
import { Image, Linking, View } from "react-native";

import { useTheme } from "@react-navigation/native";
import { Person } from "lemmy-js-client";

import { Icon, Text, TouchableOpacity } from "../../ThemedComponents";
import { makeDateString } from "../../utils/utils";

function UserRow({
  person,
  hasBanner,
}: {
  person: Person;
  hasBanner?: boolean;
}) {
  const { colors } = useTheme();
  const onProfileUrlPress = async () => {
    try {
      await Linking.openURL(person.actor_id);
    } catch (e) {
      console.error(e);
    }
  };
  return (
    <View style={{ flexDirection: "row", gap: 8, alignItems: "flex-start" }}>
      <View style={{ gap: 8 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <Icon size={24} name={"user"} />
          <View>
            <Text>{person.display_name || `@${person.name}`}</Text>
            <TouchableOpacity onPressCb={onProfileUrlPress} simple>
              <Text style={{ color: colors.border }}>{person.actor_id}</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <Icon size={24} name={"award"} />
          <Text>Joined {makeDateString(person.published)}</Text>
        </View>
      </View>
      {person.avatar ? (
        <Image
          source={{
            uri: person.avatar,
          }}
          style={{
            marginLeft: "auto",
            width: 72,
            height: 72,
            borderRadius: 72,
            marginTop: hasBanner ? -46 : 0,
          }}
        />
      ) : null}
    </View>
  );
}

export default UserRow;
