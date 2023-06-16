import React from "react";
import { Image, View } from "react-native";
import { Icon, Text } from "../../ThemedComponents";
import { Person } from "lemmy-js-client";

function UserRow({ person }: { person: Person }) {
  return (
    <View style={{ flexDirection: 'row', gap: 8, alignItems: 'flex-start' }}>
      <View style={{ gap: 8 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Icon size={24} name={"info"} />
          <Text>
            {person.display_name || `@${person.name}`}
            {'\n'}
            ({person.actor_id})
          </Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Icon size={24} name={"award"} />
          <Text>Joined: {person.published}</Text>
        </View>
      </View>
      {person.avatar
       ? (
         <Image
           source={{
             uri: person.avatar,
           }}
           style={{ marginLeft: 'auto', width: 72, height: 72, borderRadius: 72 }}
         />
       ) : null}
    </View>
  )
}

export default UserRow;