import React from "react";
import { ImageBackground, StyleSheet, Text, View, Image } from "react-native";

const Card = (props) => {
  const { name, image, bio } = props.user;
  return (
    <View style={styles.card}>
      <Image source={{ uri: image }} style={styles.image2} />
      <View style={styles.cardDetails}>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.bio}>{bio}</Text>
      </View>
    </View>
  );
};

export default Card;

const styles = StyleSheet.create({
  card: {
    width: "95%",
    height: "100%",
    borderRadius: 10,

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
    bottom: 5,
    position: "absolute",
    padding: 10,
  },
  name: {
    fontSize: 30,
    color: "white",
    fontWeight: "bold",
  },
  bio: {
    fontSize: 15,
    color: "white",
    lineHeight: 24,
  },
});
