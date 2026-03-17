import React, { useEffect, useRef } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  Animated,
  useWindowDimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import bigTextLogo from "../../assets/fixmajstr-logo-blue-white.png";

import { ROUTES } from "../navigation/routes";

export default function WelcomeScreen({ navigation }) {
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoY = useRef(new Animated.Value(30)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;
  const taglineY = useRef(new Animated.Value(20)).current;
  const buttonOpacity = useRef(new Animated.Value(0)).current;
  const buttonY = useRef(new Animated.Value(20)).current;
  const decorOpacity = useRef(new Animated.Value(0)).current;
  const { width, height } = useWindowDimensions();
  const isTablet = width >= 768;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(200),
      Animated.parallel([
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(logoY, {
          toValue: 0,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(decorOpacity, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }),
      ]),
      Animated.delay(100),
      Animated.parallel([
        Animated.timing(taglineOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(taglineY, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
      Animated.delay(150),
      Animated.parallel([
        Animated.timing(buttonOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(buttonY, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, []);

  return (
    <LinearGradient
      colors={["#7C9FFF", "#497AFF", "#275CED"]}
      start={{ x: 0.3, y: 0 }}
      end={{ x: 0.7, y: 1 }}
      style={styles.container}
    >
      <Animated.View
        style={[
          styles.decorCircleLarge,
          {
            opacity: decorOpacity,
            width: width * 1.1,
            height: width * 1.1,
            borderRadius: width * 0.55,
            top: -width * 0.45,
            left: -width * 0.05,
          },
        ]}
      />
      <Animated.View
        style={[
          styles.decorCircleSmall,
          {
            opacity: decorOpacity,
            width: width * 0.5,
            height: width * 0.5,
            borderRadius: width * 0.25,
            bottom: height * 0.18,
            right: -width * 0.15,
          },
        ]}
      />
      <Animated.View
        style={[
          styles.decorCircleMedium,
          {
            opacity: decorOpacity,
            width: width * 0.7,
            height: width * 0.7,
            borderRadius: width * 0.35,
            bottom: -width * 0.2,
            left: -width * 0.2,
          },
        ]}
      />

      <View style={styles.content}>
        <Animated.View
          style={[
            styles.logoContainer,
            { opacity: logoOpacity, transform: [{ translateY: logoY }] },
          ]}
        >
          <Image
            source={bigTextLogo}
            style={{
              width: isTablet ? width * 0.5 : width * 0.72,
              height: isTablet ? 110 : 70,
            }}
            resizeMode="contain"
          />
        </Animated.View>

        <Animated.View style={[styles.divider, { opacity: taglineOpacity }]} />

        <Animated.Text
          style={[
            styles.tagline,
            isTablet && styles.taglineTablet,
            { opacity: taglineOpacity, transform: [{ translateY: taglineY }] },
          ]}
        >
          Mojster en klik vstran
        </Animated.Text>

        <Animated.Text
          style={[
            styles.subtitle,
            isTablet && styles.subtitleTablet,
            { opacity: taglineOpacity, transform: [{ translateY: taglineY }] },
          ]}
        >
          Ali že imaš uporabniški račun?
        </Animated.Text>
      </View>

      <Animated.View
        style={[
          styles.bottomContainer,
          isTablet && styles.bottomContainerTablet,
          { opacity: buttonOpacity, transform: [{ translateY: buttonY }] },
        ]}
      >
        <TouchableOpacity
          style={[styles.button, isTablet && styles.buttonTablet]}
          onPress={() => navigation.navigate(ROUTES.LOGIN)}
          activeOpacity={0.85}
        >
          <Text
            style={[styles.buttonText, isTablet && styles.buttonTextTablet]}
          >
            DA
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.buttonOutline, isTablet && styles.buttonTablet, { marginTop: 16 }]}
          onPress={() => navigation.navigate(ROUTES.REGISTER_USER)}
          activeOpacity={0.85}
        >
          <Text
            style={[styles.buttonOutlineText, isTablet && styles.buttonTextTablet]}
          >
            NE
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 80,
    paddingBottom: 60,
    paddingHorizontal: 32,
    overflow: "hidden",
  },
  decorCircleLarge: {
    position: "absolute",
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  decorCircleSmall: {
    position: "absolute",
    backgroundColor: "rgba(255,255,255,0.07)",
  },
  decorCircleMedium: {
    position: "absolute",
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 8,
  },
  divider: {
    width: 48,
    height: 2,
    backgroundColor: "rgba(255,255,255,0.5)",
    borderRadius: 2,
    marginVertical: 8,
  },
  tagline: {
    fontFamily: "LeagueSpartan-Bold",
    fontSize: 22,
    color: "#fff",
    letterSpacing: 0.5,
    textAlign: "center",
    fontWeight: "700",
  },
  taglineTablet: {
    fontSize: 32,
  },
  subtitle: {
    fontFamily: "LeagueSpartan-Regular",
    fontSize: 15,
    color: "rgba(255,255,255,0.75)",
    textAlign: "center",
    lineHeight: 22,
    marginTop: 4,
  },
  subtitleTablet: {
    fontSize: 20,
    lineHeight: 30,
  },
  bottomContainer: {
    width: "100%",
    alignItems: "center",
    gap: 16,
  },
  bottomContainerTablet: {
    alignItems: "center",
  },
  button: {
    width: "100%",
    height: 54,
    borderRadius: 16,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#1a3a8f",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  buttonTablet: {
    width: 320,
    height: 62,
    borderRadius: 20,
  },
  buttonText: {
    fontFamily: "LeagueSpartan-Bold",
    fontSize: 17,
    color: "#275CED",
    fontWeight: "800",
    letterSpacing: 1,
  },
  buttonTextTablet: {
    fontSize: 20,
  },
  buttonOutline: {
    width: "100%",
    height: 54,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonOutlineText: {
    fontFamily: "LeagueSpartan-Bold",
    fontSize: 17,
    color: "#fff",
    fontWeight: "800",
    letterSpacing: 1,
  },
});
