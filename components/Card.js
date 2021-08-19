import React from "react";
import { ImageBackground, StyleSheet, Text, View, Image } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Octicons } from "@expo/vector-icons";
import { S3Image } from "aws-amplify-react-native";
const color1 = "rgba(0, 224, 255, 1)";
const color2 = "#0, 133, 255, 1";

const Card = (props) => {
  console.log(props);
  const { name, image, bio, gender, age } = props.user;

  return (
    <View style={styles.card}>
      {image?.startsWith("http") ? (
        <Image source={{ uri: image }} style={styles.image2} />
      ) : (
        <S3Image imgKey={image} style={styles.image2} />
      )}

      <LinearGradient
        // Background Linear Gradient
        colors={["transparent", "rgba(0,0,0,0.8)"]}
        style={styles.cardDetails}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.age}>{age}</Text>
          <Octicons name="info" size={24} color="white" />
        </View>
        {gender === "FEMALE" && <Text style={styles.userType}>👩</Text>}
        {gender === "MALE" && <Text style={styles.userType}>👨</Text>}

        <Text style={styles.bio}>{bio}</Text>
      </LinearGradient>
    </View>
  );
};

export default Card;

const styles = StyleSheet.create({
  card: {
    width: "100%",
    height: "100%",
    borderRadius: 10,
    backgroundColor: "#fefefe",

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.36,
    shadowRadius: 6.68,

    elevation: 11,
  },
  image2: {
    ...StyleSheet.absoluteFill,
    width: "100%",
    height: "100%",
    borderRadius: 10,
  },
  image: {
    overflow: "hidden",
    width: "100%",
    height: "100%",
    justifyContent: "flex-end",
  },
  cardDetails: {
    bottom: 0,
    width: "100%",
    position: "absolute",
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    padding: 10,
  },
  name: {
    fontSize: 30,
    color: "white",
    fontWeight: "bold",
  },
  age: {
    fontSize: 30,
    color: "white",
    paddingHorizontal: 15,
  },
  info: { fontSize: 20, color: "white", paddingHorizontal: 2 },
  bio: {
    fontSize: 15,
    color: "white",
    lineHeight: 24,
  },
  userType: {
    fontSize: 20,
  },
});
