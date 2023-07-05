import React from "react";
import { Image, View, Linking } from "react-native";
import { Icon, Text, TouchableOpacity } from "../../ThemedComponents";
import { Person } from "lemmy-js-client";
import { makeDateString } from "../../utils/utils";
import { useTheme } from "@react-navigation/native";

function UserRow({ person }: { person: Person }) {
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
            <Text>
              {person.display_name
                ? `${person.display_name} (@${person.name})`
                : `@${person.name}`}
            </Text>
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
          }}
        />
      ) : null}
    </View>
  );
}

export default UserRow;
