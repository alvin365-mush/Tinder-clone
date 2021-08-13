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
} from "react-native";
import Card from "./components/Card";
import users from "./assets/data/users";

import AnimatedStack from "./components/AnimatedStack";

const elon = {
  name: "Elon Musk",
  image: "https://links.papareact.com/l4v",
  bio: "Rocket man with lots of fuel to burn",
};

export default function App() {
  const onSwipeLeft = (user) => {
    console.warn("left Swipe", user.name);
  };
  const onSwipeRight = (user) => {
    console.warn("right Swipe", user.name);
  };
  return (
    <View style={styles.container}>
      <AnimatedStack
        data={users}
        renderItem={({ item }) => <Card user={item} />}
        onSwipeRight={onSwipeRight}
        onSwipeLeft={onSwipeLeft}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
