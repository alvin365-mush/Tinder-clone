import "react-native-gesture-handler";

//import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
  SafeAreaView,
  Image,
  ActivityIndicator,
} from "react-native";
import Card from "./components/Card";
import users from "./assets/data/users";

import AnimatedStack from "./components/AnimatedStack";
import HomeScreen from "./src/screens/HomeScreen";
import MatchesScreen from "./src/screens/MatchesScreen";
import ProfileScreen from "./src/screens/ProfileScreen";

import {
  Fontisto,
  MaterialCommunityIcons,
  Ionicons,
  FontAwesome5,
  FontAwesome,
} from "@expo/vector-icons";

import Amplify, { Hub, Auth, DataStore } from "aws-amplify";
import { withAuthenticator } from "aws-amplify-react-native";
import config from "./src/aws-exports";
Amplify.configure({
  ...config,
  Analytics: {
    disabled: true,
  },
});

const elon = {
  name: "Elon Musk",
  image: "https://links.papareact.com/l4v",
  bio: "Rocket man with lots of fuel to burn",
};

function App() {
  const [activeScreen, setActiveScreen] = useState("HOME");
  const [userLoading, setUserLoading] = useState(true);
  const [me, setMe] = useState(null);
  const color = "#b5b5b5";

  const activeColor = "#f76c68";

  useEffect(() => {
    // Create listener
    const listener = Hub.listen("datastore", async (hubData) => {
      const { event, data } = hubData.payload;
      if (event === "modelSynced" && data?.model?.name === "User") {
        console.log(`Model finished sync: ${data.model.name}`);
        setUserLoading(false);
        //setMe(user);
      }
    });
    // Remove listener
    return () => listener();
  }, []);
  //console.log(me);
  console.log(userLoading);
  const renderPage = () => {
    if (activeScreen === "HOME") {
      return <HomeScreen userLoading={userLoading} />;
    }
    if (userLoading) {
      return <ActivityIndicator style={{ flex: 1 }} />;
    }
    if (activeScreen === "CHAT") {
      return <MatchesScreen />;
    }
    if (activeScreen === "PROFILE") {
      return <ProfileScreen />;
    }
  };
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.container}>
        <View style={styles.topNav}>
          <Pressable onPress={() => setActiveScreen("HOME")}>
            <MaterialCommunityIcons
              name="clover"
              size={24}
              color={activeScreen === "HOME" ? activeColor : color}
            />
          </Pressable>
          <Pressable>
            <MaterialCommunityIcons
              name="star-four-points"
              size={24}
              color={color}
            />
          </Pressable>
          <Pressable onPress={() => setActiveScreen("CHAT")}>
            <Ionicons
              name="ios-chatbubbles"
              size={30}
              color={activeScreen === "CHAT" ? activeColor : color}
            />
          </Pressable>
          <Pressable onPress={() => setActiveScreen("PROFILE")}>
            <FontAwesome
              name="user"
              size={30}
              color={activeScreen === "PROFILE" ? activeColor : color}
            />
          </Pressable>
        </View>
        {renderPage()}
      </View>
    </SafeAreaView>
  );
}
export default withAuthenticator(App);
const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  topNav: {
    flexDirection: "row",
    marginTop: 30,
    justifyContent: "space-around",
    width: "100%",
    padding: 10,
  },
});
