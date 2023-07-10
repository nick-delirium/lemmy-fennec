import React from "react";
import { observer } from "mobx-react-lite";
import { ActivityIndicator } from "react-native";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import CommunityFeed from "./CommunityFeed";
import CommunityInfos from "./CommunityInfos";

const Tab = createMaterialTopTabNavigator();
import { apiClient } from "../../store/apiClient";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { communityStore } from "../../store/communityStore";

function CommunityScreen({
  navigation,
  route,
}: NativeStackScreenProps<any, "Community">) {
  const commId = route.params.id;
  const { community } = apiClient.communityStore;

  React.useEffect(() => {
    const getData = () => {
      console.log("requesting community data");
      if (communityStore.community?.community.id === commId) return;
      if (commId) {
        apiClient.postStore.setPage(1);
        void apiClient.postStore.getPosts(apiClient.loginDetails, commId);
      }
      void apiClient.communityStore.getCommunity(
        commId,
        apiClient.loginDetails
      );
    };

    const unsubscribe = navigation.addListener("focus", () => {
      getData();
    });
    getData();

    if (communityStore.community !== null && apiClient.postStore) {
      navigation.setOptions({
        title: `${communityStore.community.community.title} | ${apiClient.postStore.filters.sort}`,
      });
    }

    return unsubscribe;
  }, [commId, navigation, apiClient.postStore, communityStore.community]);

  if (apiClient.communityStore.isLoading || community === null)
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
