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
import Animated, {
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withSpring,
  interpolate,
  runOnJS,
} from "react-native-reanimated";
import { PanGestureHandler } from "react-native-gesture-handler";
import Like from "../assets/images/LIKE.png";
import Nope from "../assets/images/nope.png";

const elon = {
  name: "Elon Musk",
  image: "https://links.papareact.com/l4v",
  bio: "Rocket man with lots of fuel to burn",
};
const ROTATION = 60;
const SWIPE_VELOCITY = 800;

const AnimatedStack = (props) => {
  const { data, renderItem, onSwipeRight, onSwipeLeft, setCurrentUser } = props;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [eventVelocity, setEventVelocity] = useState(0);
  const [nextIndex, setNextIndex] = useState(currentIndex + 1);

  const currentProfile = data[currentIndex];
  const nextProfile = data[nextIndex];
  const { width: screenWidth } = useWindowDimensions();

  const hiddenTranslateX = 2 * screenWidth;

  const translateX = useSharedValue(0);
  const rotate = useDerivedValue(
    () =>
      interpolate(translateX.value, [0, hiddenTranslateX], [0, ROTATION]) +
      "deg"
  );

  const cardStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: translateX.value,
      },
      { rotate: rotate.value },
    ],
  }));
  const nextCardStyle = useAnimatedStyle(() => ({
    transform: [
      {
        scale: interpolate(
          translateX.value,
          [-hiddenTranslateX, 0, hiddenTranslateX],
          [1, 0.85, 1]
        ),
      },
    ],
    opacity: interpolate(
      translateX.value,
      [-hiddenTranslateX, 0, hiddenTranslateX],
      [1, 0.6, 1]
    ),
  }));
  const likeStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [0, hiddenTranslateX / 10], [0, 1]),
  }));
  const nopeStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [0, -hiddenTranslateX / 10], [0, 1]),
  }));

  const gestureHandler = useAnimatedGestureHandler({
    onStart: (_, context) => {
      context.startX = translateX.value;
      //console.warn("Touch Start");
    },
    onActive: (event, context) => {
      translateX.value = context.startX + event.translationX;
      //console.log("Touch x:", event.translationX);
    },
    onEnd: (event) => {
      setEventVelocity(event.velocityX);
      if (Math.abs(event.velocityX) < SWIPE_VELOCITY) {
        translateX.value = withSpring(0);

        return;
      }
      translateX.value = withSpring(
        hiddenTranslateX * Math.sign(event.velocityX),
        //event.velocityX > 0 ? hiddenTranslateX : -hiddenTranslateX, //or hiddenTranslate * Math.sign(event.velocityX)
        {}, //wait for animation to complete
        () => runOnJS(setCurrentIndex)(currentIndex + 1)
      );
      const onSwipe = event.velocityX > 0 ? onSwipeRight : onSwipeLeft; //javascript
      onSwipe && runOnJS(onSwipe)();

      //console.log("Ended");
    },
  });

  useEffect(() => {
    translateX.value = 0;
    setNextIndex(currentIndex + 1);
  }, [currentIndex, translateX]);

  useEffect(() => {
    setCurrentUser(currentProfile);
  }, [currentProfile, setCurrentUser]);
  return (
    <View style={styles.root}>
      {nextProfile && (
        <View style={styles.nextCardContainer}>
          <Animated.View style={[styles.animatedCard, nextCardStyle]}>
            {renderItem({ item: nextProfile })}
          </Animated.View>
        </View>
      )}
      {currentProfile ? (
        <PanGestureHandler onGestureEvent={gestureHandler}>
          <Animated.View style={[styles.animatedCard, cardStyle]}>
            <Animated.Image
              source={Like}
              style={[styles.like, { left: 10 }, likeStyle]}
              resizeMode="contain"
            />
            <Animated.Image
              source={Nope}
              style={[styles.like, { right: 10 }, nopeStyle]}
              resizeMode="contain"
            />
            {renderItem({ item: currentProfile })}
          </Animated.View>
        </PanGestureHandler>
      ) : (
        <View style={{ justifyContent: "center", alignItems: "center" }}>
          <Text>Oops! 🤭 </Text>
          <Text>You ran out of people</Text>
        </View>
      )}
    </View>
  );
};
export default AnimatedStack;
const styles = StyleSheet.create({
  root: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  animatedCard: {
    width: "95%",
    height: "90%",
    justifyContent: "center",
    alignItems: "center",
    elevation: 2,
  },
  nextCardContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
  },
  like: {
    width: 100,
    height: 100,
    position: "absolute",
    top: 10,
    zIndex: 30,
    elevation: 11,
  },
});
