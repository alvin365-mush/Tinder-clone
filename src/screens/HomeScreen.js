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
import Card from "../../components/Card";

import AnimatedStack from "../../components/AnimatedStack";

import {
  Fontisto,
  MaterialCommunityIcons,
  Ionicons,
  FontAwesome5,
  FontAwesome,
  Entypo,
} from "@expo/vector-icons";
import { Auth, DataStore } from "aws-amplify";
import { User, Match } from "../models";
const elon = {
  name: "Elon Musk",
  image: "https://links.papareact.com/l4v",
  bio: "Rocket man with lots of fuel to burn",
};

export default function HomeScreen({ userLoading }) {
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [matchesIds, setMatchesIds] = useState(null); // all user ids of people who we already matched
  /* const [currentIndex, setCurrentIndex] = useState(0);
  const currentProfile = users[currentIndex]; */

  const [me, setMe] = useState(null);
  useEffect(() => {
    if (userLoading || !me || matchesIds === null) {
      return;
    }
    const fetchUsers = async () => {
      let fetchedUsers = await DataStore.query(User, (user) =>
        user.gender("eq", me.lookingFor)
      );

      fetchedUsers = fetchedUsers.filter((u) => !matchesIds.includes(u.id));

      setUsers(fetchedUsers);
    };
    fetchUsers();
  }, [userLoading, me, matchesIds]);
  //console.log("currentUser", me.length());

  useEffect(() => {
    if (!me) {
      return;
    }
    const fetchMatches = async () => {
      const result = await DataStore.query(Match, (m) =>
        m
          .isMatch("eq", true)
          .or((m1) => m1.User1ID("eq", me.id).User2ID("eq", me.id))
      );
      setMatchesIds(
        result.map((match) =>
          match.User1ID === me.id ? match.User2ID : match.User1ID
        )
      );
    };
    fetchMatches();
  }, [me]);

  useEffect(() => {
    const getCurrentUser = async () => {
      const user = await Auth.currentAuthenticatedUser();

      const dbUsers = await DataStore.query(User, (u) =>
        u.sub("eq", user.attributes.sub)
      );

      if (!dbUsers || dbUsers.length === 0) {
        return;
      } else {
        setMe(dbUsers[0]);
        console.log("Me", me);
      }
    };
    getCurrentUser();
  }, [userLoading]);
  //console.log(currentUser);
  const onSwipeLeft = () => {
    if (!currentUser || !me) {
      return;
    }
    console.warn("left Swipe", currentUser.name);
  };
  const onSwipeRight = async () => {
    if (!currentUser || !me) {
      return;
    }
    const myMatches = await DataStore.query(Match, (match) =>
      match.User1ID("eq", me.id).User2ID("eq", currentUser.id)
    );

    if (myMatches.length > 0) {
      console.warn("You already swiped right to this user");
      return;
    }

    const hisMatches = await DataStore.query(Match, (match) =>
      match.User1ID("eq", currentUser.id).User2ID("eq", me.id)
    );

    if (hisMatches.length > 0) {
      const hisMatch = hisMatches[0];
      DataStore.save(
        Match.copyOf(hisMatch, (updated) => (updated.isMatch = true))
      );
      return;
    }
    //else
    console.warn("sending him match request");
    const newMatch = new Match({
      User1ID: me.id,
      User2ID: currentUser.id,
      isMatch: false,
    });
    console.log(newMatch);
    DataStore.save(newMatch);
    console.warn("right Swipe", currentUser.name);
  };
  const color = "#30";
  /* useEffect(() => {
    setCurrentUser(currentProfile);
  }, [currentProfile]);
  const handleRemoveItem = (e) => {
    const name = e.target.getAttribute("name");
    setCurrentIndex(currentIndex + 1);
  }; */
  return (
    <View style={styles.container}>
      <AnimatedStack
        data={users}
        renderItem={({ item }) => <Card user={item} />}
        setCurrentUser={setCurrentUser}
        onSwipeRight={onSwipeRight}
        onSwipeLeft={onSwipeLeft}
      />
      <View style={styles.bottomNav}>
        <View style={styles.button}>
          <FontAwesome name="undo" size={30} color="#FBD88B" />
        </View>
        <View style={styles.button}>
          <Entypo name="cross" size={30} color="#F76C6B" />
        </View>
        <View style={styles.button}>
          <FontAwesome name="star" size={30} color="#3AB4CC" />
        </View>
        <View style={styles.button}>
          <FontAwesome name="heart" size={30} color="#4FCC94" />
        </View>
        <View style={styles.button}>
          <Ionicons name="flash" size={30} color="#A65CD2" />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: "100%",
    flex: 1,
    backgroundColor: "#ededed",
  },
  bottomNav: {
    flexDirection: "row",
    marginTop: 30,
    justifyContent: "space-around",
    width: "100%",
    padding: 10,
  },
  button: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
    padding: 10,
    borderRadius: 50,
  },
});
