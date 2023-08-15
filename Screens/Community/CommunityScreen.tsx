import React from "react";
import { ActivityIndicator } from "react-native";

import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { observer } from "mobx-react-lite";

import { apiClient } from "../../store/apiClient";
import { communityStore } from "../../store/communityStore";
import CommunityFeed from "./CommunityFeed";
import CommunityInfos from "./CommunityInfos";

const Tab = createMaterialTopTabNavigator();

function CommunityScreen({
  navigation,
  route,
}: NativeStackScreenProps<any, "Community">) {
  const commId = route.params.id;
  const name = route.params.name;
  const { community } = apiClient.communityStore;

  const fetchedName = community?.community.name;
  const fetchedId = community?.community.id;

  React.useEffect(() => {
    const nameWithoutInst =
      name && name.includes("@") ? name.split("@")[0] : name;
    const getData = () => {
      if (
        (fetchedId === commId || fetchedName === nameWithoutInst) &&
        apiClient.postStore.communityPosts.length > 0
      ) {
        return;
      } else {
        if (commId || name) {
          apiClient.postStore.setCommPage(1);
          void apiClient.postStore.getPosts(
            apiClient.loginDetails,
            commId,
            name
          );
          void apiClient.communityStore.getCommunity(
            apiClient.loginDetails,
            commId,
            name
          );
        }
      }
    };

    const unsubscribe = navigation.addListener("focus", () => {
      getData();
    });
    getData();

    return unsubscribe;
  }, [
    commId,
    name,
    apiClient.postStore.communityPosts.length,
    fetchedName,
    fetchedId,
  ]);

  React.useEffect(() => {
    if (communityStore.community !== null && apiClient.postStore) {
      navigation.setOptions({
        title: `${communityStore.community.community.title} | ${apiClient.postStore.filters.sort}`,
      });
    }
  }, [navigation, apiClient.postStore, communityStore.community]);

  if (apiClient.communityStore.isLoading || !community)
    return <ActivityIndicator />;

  return (
    <Tab.Navigator initialRouteName={"CommunityFeed"}>
      <Tab.Screen
        options={{
          tabBarLabel: "Posts",
        }}
        name={"CommunityFeed"}
        component={CommunityFeed}
      />
      <Tab.Screen
        options={{
          tabBarLabel: "About",
        }}
        name={"CommunityInfos"}
        component={CommunityInfos}
      />
    </Tab.Navigator>
  );
}

export default observer(CommunityScreen);
