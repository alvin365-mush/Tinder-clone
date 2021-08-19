import React, { useEffect, useState } from "react";
import {
  Image,
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Pressable,
  TextInput,
  Alert,
  TouchableOpacity,
  Button,
} from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import users from "../../assets/data/users";
import { Auth, DataStore, Storage } from "aws-amplify";
import { Picker } from "@react-native-picker/picker";
import { User } from "../models";
import NumericInput from "react-native-numeric-input";
import * as ImagePicker from "expo-image-picker";
import { S3Image } from "aws-amplify-react-native";
import { FontAwesome } from "@expo/vector-icons";

const ProfileScreen = () => {
  const [currentUser, setUser] = useState(null);
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [age, setAge] = useState();
  const [gender, setGender] = useState();
  const [lookingFor, setLookingFor] = useState();
  const [image, setImage] = useState(null);

  const isNotValid = () => {
    //console.warn(name, bio, gender, lookingFor, age);
    return name && bio && gender && lookingFor;
  };

  useEffect(() => {
    const getCurrentUser = async () => {
      const authUser = await Auth.currentAuthenticatedUser();
      console.log("authUser", authUser.attributes.sub);
      const dbUsers = await DataStore.query(User, (u) =>
        u.sub("eq", authUser.attributes.sub)
      );

      if (!dbUsers || dbUsers.length === 0) {
        return;
      }
      const dbUser = dbUsers[0];
      setUser(dbUser);

      console.warn(dbUsers);

      setName(dbUser.name);
      setAge(dbUser.age);
      setBio(dbUser.bio);
      setGender(dbUser.gender);
      setLookingFor(dbUser.lookingFor);
    };
    getCurrentUser();
  }, []);
  //console.log("age", age);
  const save = async () => {
    if (!isNotValid()) {
      return;
    }
    let newImage;
    if (image) {
      newImage = await uploadImage();
    }
    if (currentUser) {
      //console.log("User", user.length);
      const updatedUser = User.copyOf(currentUser, (updated) => {
        updated.name = name;
        updated.bio = bio;
        updated.age = age;
        updated.gender = gender;
        updated.lookingFor = lookingFor;
        if (newImage) {
          updated.image = newImage;
        }
      });

      await DataStore.save(updatedUser);
      setImage(null);
    } else {
      ///create new user
      const AuthUser = await Auth.currentAuthenticatedUser();
      console.log("AuthUser", Auth.currentAuthenticatedUser());
      const newUser = new User({
        sub: AuthUser.attributes.sub,
        name: name,
        bio,
        gender,
        lookingFor,
        age,
        image: newImage,
        //image: "https://links.papareact.com/l4v",
      });
      await DataStore.save(newUser);
    }

    Alert.alert("User saved successfully");
  };
  useEffect(() => {
    (async () => {
      if (Platform.OS !== "web") {
        const { status } =
          await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
          alert("Sorry, we need camera roll permissions to make this work!");
        }
      }
    })();
  }, []);
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [3, 4],
      quality: 1,
    });

    console.log(result);

    if (!result.cancelled) {
      setImage(result.uri);
    }
  };

  const signOut = async () => {
    await DataStore.clear();
    Auth.signOut();
  };

  const uploadImage = async () => {
    try {
      const response = await fetch(image);

      const blob = await response.blob();

      const urlParts = image.split(".");
      const extension = urlParts[urlParts.length - 1];

      const key = `${currentUser.id}.${extension}`;

      await Storage.put(key, blob);

      return key;
    } catch (e) {
      console.log(e);
    }
    return "";
  };
  console.log("currentUser", currentUser);
  const renderImage = () => {
    if (image) {
      return (
        <Image
          source={{ uri: image }}
          style={{
            width: 150,
            height: 150,
            borderRadius: 80,
          }}
        />
      );
    }
    if (currentUser?.image?.startsWith("http")) {
      return (
        <Image
          source={{ uri: currentUser?.image }}
          style={{
            width: 150,
            height: 150,
            borderRadius: 80,
          }}
        />
      );
    }
    return (
      <S3Image
        imgKey={currentUser?.image}
        style={{
          width: 150,
          height: 150,
          borderRadius: 80,
        }}
      />
    );
  };
  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <Text style={styles.title}>Profile</Text>
          <View style={{ flexDirection: "row", position: "relative" }}>
            <TouchableOpacity
              onPress={pickImage}
              style={{
                position: "absolute",
                bottom: 0,
                right: 75,
                elevation: 10,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "center",
                  alignItems: "center",
                  padding: 2,
                  backgroundColor: "#F63A6E",
                  width: 50,
                  height: 50,
                  borderRadius: 105,
                  alignSelf: "center",
                }}
              >
                <FontAwesome name="camera-retro" size={20} color="white" />
              </View>
            </TouchableOpacity>
            <View
              style={{
                width: "100%",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              {renderImage()}
            </View>
          </View>
          <TextInput
            style={styles.input}
            placeholder="Name..."
            value={name}
            onChangeText={setName}
          />
          <TextInput
            style={styles.input}
            placeholder="Bio..."
            multiline
            numberOfLines={3}
            value={bio}
            onChangeText={setBio}
          />
          <View style={{ marginHorizontal: 10 }}>
            <Text style={styles.labelText}>Age</Text>
            <NumericInput
              value={age}
              onChange={(value) => setAge(value)}
              onLimitReached={(isMax, msg) => console.log(isMax, msg)}
              totalWidth={240}
              totalHeight={30}
              iconSize={25}
              step={1}
              maxValue={99}
              minValue={18}
              valueType="real"
              rounded
              textColor="#B0228C"
              iconStyle={{ color: "white" }}
              rightButtonBackgroundColor="#EA3788"
              leftButtonBackgroundColor="#E56B70"
            />
          </View>

          <View style={styles.label}>
            <Text style={styles.labelText}>Gender</Text>
            <Picker
              selectedValue={gender}
              onValueChange={(itemValue, itemIndex) => setGender(itemValue)}
            >
              <Picker.Item label="Male" value="MALE" />
              <Picker.Item label="Female" value="FEMALE" />
              <Picker.Item label="Other" value="OTHER" />
            </Picker>
          </View>
          <View style={styles.label}>
            <Text style={styles.labelText}>Looking for</Text>
            <Picker
              selectedValue={lookingFor}
              onValueChange={(itemValue2, itemIndex) =>
                setLookingFor(itemValue2)
              }
            >
              <Picker.Item label="Male" value="MALE" />
              <Picker.Item label="Female" value="FEMALE" />
              <Picker.Item label="Other" value="OTHER" />
            </Picker>
          </View>

          <TouchableOpacity onPress={save} style={styles.saveBtn}>
            <Text style={styles.btntext}>Save</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={signOut} style={styles.signoutBtn}>
            <Text style={styles.btntext}>Sign Out</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default ProfileScreen;
const styles = StyleSheet.create({
  root: {
    width: "100%",
    marginHorizontal: 10,
    flex: 1,
    backgroundColor: "#ededed",
  },
  container: {
    padding: 10,
    height: "100%",
  },
  title: {
    fontWeight: "bold",
    fontSize: 24,
    color: "#F63A6E",
  },
  label: {
    margin: 10,
    borderBottomColor: "lightgray",
    borderBottomWidth: 2,
    color: "lightgray",
  },
  labelText: { color: "gray", marginVertical: 5 },

  input: {
    margin: 10,
    borderBottomColor: "lightgray",
    borderBottomWidth: 2,
  },
  saveBtn: {
    backgroundColor: "#F63A6E",
    height: 30,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 30,
    margin: 20,
  },
  btntext: {
    fontWeight: "bold",
    fontSize: 18,
    color: "#fff",
  },
  signoutBtn: {
    backgroundColor: "#F63A6E",
    height: 30,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 30,
    margin: 20,
  },
});
