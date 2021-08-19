import React, {
  useState,
  useEffect,
  useLayoutEffect,
  useCallback,
} from "react";
import {
  Image,
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  RefreshControl,
} from "react-native";
import { ScrollView } from "react-native-gesture-handler";
//import users from "../../assets/data/users";
import { Auth, DataStore, Hub, syncExpression } from "aws-amplify";
import { User, Match } from "../models";
import { S3Image } from "aws-amplify-react-native";

const wait = (timeout) => {
  return new Promise((resolve) => setTimeout(resolve, timeout));
};
const MatchesScreen = ({ user }) => {
  const [matches, setMatches] = useState([]);
  const [me, setMe] = useState(null);
  const [fetch, setFetch] = useState(false);
  const [refreshing, setRefreshing] = React.useState(false);
  //console.log(user);
  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchMatches();
    wait(2000).then(() => setRefreshing(false));
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
        //console.log("Me", me);
      }
    };
    getCurrentUser();
  }, [me]);

  const fetchMatches = async () => {
    const result = await DataStore.query(Match, (m) =>
      m
        .isMatch("eq", true)
        .or((m1) => m1.User1ID("eq", me.id).User2ID("eq", me.id))
    );

    //console.warn([...result]);
    setMatches([...result]);
  };
  useEffect(() => {
    if (!me) {
      return;
    }

    fetchMatches();
  }, [me]);

  useEffect(() => {
    const subscription = DataStore.observe(Match).subscribe((msg) => {
      //console.log(msg.opType, msg.element);
      if (msg.opType === "UPDATE") {
        const newMatch = msg.element;

        if (
          newMatch.isMatch &&
          (newMatch.User1ID === me.id || newMatch.User2ID === me.id)
        ) {
          //console.log("++There is anew match++");
          //console.log(msg.model, msg.opType, msg.element);
          fetchMatches();
        }
      }
    });
    return () => subscription.unsubscribe();
  }, [me]);
  const updateMatch = async () => {
    const result2 = await DataStore.query(Match, (m) =>
      m.or((m1) => m1.User1ID("eq", me.id).User2ID("eq", me.id))
    );
    console.log(result2);
    await DataStore.save(new Match(result2));
    //setMatches(result2);
  };
  //console.log(matches);

  const renderItem = () => {
    if (!refreshing) {
      return;
    }
  };
  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.container}>
        <Text style={styles.title}>New Matches</Text>
        <View style={styles.users}>
          <ScrollView
            horizontal
            showHorizontalScrollInicator={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          >
            {matches?.map((match) => {
              const matchUser =
                match?.User1?.id == me.id ? match.User2 : match.User1;
              if (!match.User1 || !match.User2) {
                return (
                  <View style={styles.user} key={match.id}>
                    <Image source={{}} style={styles.image} />
                    <Text style={styles.name}>New match</Text>
                  </View>
                );
              }

              if (matchUser?.image?.startsWith("http")) {
                return (
                  <View key={matchUser?.id} style={styles.user}>
                    <Image
                      source={{ uri: matchUser?.image }}
                      style={styles.image}
                    />
                    <Text style={styles.name}>{matchUser?.name}</Text>
                  </View>
                );
              }
              return (
                <View key={matchUser?.id} style={styles.user}>
                  <S3Image imgKey={matchUser?.image} style={styles.image} />
                  <Text style={styles.name}>{matchUser?.name}</Text>
                </View>
              );
            })}
          </ScrollView>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default MatchesScreen;

export function useForceUpdate() {
  const [, setTick] = useState(0);
  const update = useCallback(() => {
    setTick((tick) => tick + 1);
  }, []);
  return update;
}

const styles = StyleSheet.create({
  root: {
    width: "100%",
    height: "100%",
    marginHorizontal: 10,
    flex: 1,
    backgroundColor: "#ededed",
  },
  container: { padding: 10 },
  title: {
    fontWeight: "bold",
    fontSize: 24,
    color: "#F63A6E",
  },
  users: {
    height: "43%",
    flexDirection: "row",
  },
  user: {
    width: 90,
    height: 90,
    margin: 10,
    borderWidth: 2,
    padding: 3,
    borderColor: "#F63A6E",
    borderRadius: 50,
  },
  image: {
    width: "100%",
    height: "100%",
    borderRadius: 50,
  },
  name: {
    textAlign: "center",
    marginTop: 5,
    fontWeight: "bold",
    color: "#F63A6E",
  },
});
