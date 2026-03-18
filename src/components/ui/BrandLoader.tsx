import { useEffect, useRef } from "react";
import {
  Animated,
  Easing,
  Image,
  StyleSheet,
  Text,
  View,
} from "react-native";

type BrandLoaderProps = {
  text?: string;
  fullscreen?: boolean;
  size?: number;
};

export default function BrandLoader({
  text = "Cargando...",
  fullscreen = true,
  size = 86,
}: BrandLoaderProps) {
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const rotateLoop = Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 1300,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );

    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.06,
          duration: 650,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 650,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    rotateLoop.start();
    pulseLoop.start();

    return () => {
      rotateLoop.stop();
      pulseLoop.stop();
    };
  }, [rotateAnim, scaleAnim]);

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <View style={[styles.container, fullscreen && styles.fullscreen]}>
      <Animated.View
        style={[
          styles.logoWrapper,
          {
            width: size,
            height: size,
            transform: [{ rotate }, { scale: scaleAnim }],
          },
        ]}
      >
        <Image
          source={require("../../../assets/images/logo-v-icon.png")}
          style={styles.logo}
          resizeMode="contain"
        />
      </Animated.View>

      <Text style={styles.text}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  fullscreen: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  logoWrapper: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },
  logo: {
    width: "100%",
    height: "100%",
  },
  text: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
    textAlign: "center",
  },
});