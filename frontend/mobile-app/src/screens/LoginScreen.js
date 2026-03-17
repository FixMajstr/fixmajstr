import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { loginUser } from "../services/api";
import { KeyboardAvoidingView, Platform } from "react-native";
import bigTextLogo from "../../assets/fixmajstr-logo-blue-white.png";
import * as SecureStore from "expo-secure-store";
import { useWindowDimensions } from "react-native";

import { ROUTES } from "../navigation/routes";

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;

  const handleLogin = async () => {
    try {
      setLoading(true);
      const data = await loginUser(email, password);
      console.log("Login uspešen:", data);
      await SecureStore.setItemAsync("access_token", data.access_token);
      await SecureStore.setItemAsync("user_id", String(data.user_id));
      await SecureStore.setItemAsync("user_role", data.role || "client");
      navigation.navigate(ROUTES.HOME);
    } catch (err) {
      setError("Napaka pri prijavi: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={["#7C9FFF", "#275CED"]}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 0.33 }}
      style={styles.container}
    >
      <View
        style={[styles.logoContainer, isTablet && styles.logoContainerTablet]}
      >
        <Image
          source={bigTextLogo}
          style={{
            width: isTablet ? 520 : "100%",
            height: isTablet ? 160 : 80,
          }}
          resizeMode="contain"
        />
        <Text style={[styles.logoText, isTablet && styles.logoTextTablet]}>
          Mojster en klik vstran
        </Text>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1, width: "100%" }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          style={{ width: "100%" }}
          contentContainerStyle={[styles.card, isTablet && styles.cardTablet]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Text
            style={[styles.loginTitle, isTablet && styles.loginTitleTablet]}
          >
            PRIJAVA
          </Text>

          <View style={styles.formContainer}>
            <View style={isTablet ? styles.rowFields : null}>
              <View style={isTablet ? { flex: 1 } : null}>
                <Text style={[styles.label, isTablet && styles.labelTablet]}>
                  Email
                </Text>
                <TextInput
                  style={[styles.input, isTablet && styles.inputTablet]}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View style={isTablet ? { flex: 1 } : null}>
                <Text style={[styles.label, isTablet && styles.labelTablet]}>
                  Geslo
                </Text>
                <TextInput
                  style={[styles.input, isTablet && styles.inputTablet]}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={true}
                />
              </View>
            </View>

            {error && <Text style={styles.errorText}>{error}</Text>}

            {loading ? (
              <ActivityIndicator
                size="large"
                color="#497AFF"
                style={{ marginTop: 24 }}
              />
            ) : (
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={[
                    styles.buttonPrimary,
                    isTablet && styles.buttonTablet,
                  ]}
                  onPress={handleLogin}
                  activeOpacity={0.85}
                >
                  <Text
                    style={[
                      styles.buttonPrimaryText,
                      isTablet && styles.buttonTextTablet,
                    ]}
                  >
                    Prijavi se
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.buttonOutline, { marginTop: 16 }]}
                  onPress={() => navigation.navigate(ROUTES.WELCOME)}
                  activeOpacity={0.85}
                >
                  <Text style={styles.buttonOutlineText}>Nazaj</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-start",
    paddingTop: 64,
  },
  logoContainer: {
    marginBottom: 40,
    width: "100%",
    alignItems: "center",
    paddingVertical: 16,
  },
  card: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 20,
    paddingVertical: 36,
    paddingHorizontal: 28,
    shadowColor: "#1a3a8f",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 10,
    flexGrow: 1,
  },
  loginTitle: {
    fontFamily: "LeagueSpartan-Bold",
    fontSize: 32,
    letterSpacing: 1.5,
    color: "#275CED",
    textAlign: "center",
    marginBottom: 28,
    fontWeight: "800",
  },
  formContainer: {
    width: "100%",
  },
  label: {
    fontFamily: "LeagueSpartan-Bold",
    fontSize: 18,
    color: "#555",
    marginBottom: 6,
    marginLeft: 2,
  },
  input: {
    width: "100%",
    height: 46,
    backgroundColor: "#f0f3ff",
    borderRadius: 10,
    paddingHorizontal: 14,
    marginBottom: 18,
    fontSize: 15,
    fontFamily: "LeagueSpartan-Regular",
    color: "#1a1a2e",
    borderWidth: 1.5,
    borderColor: "transparent",
  },
  buttonContainer: {
    marginTop: 8,
    gap: 10,
    paddingBottom: 50,
  },
  buttonPrimary: {
    width: "100%",
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#80A2FF",
    elevation: 4,
  },
  buttonPrimaryText: {
    color: "#fff",
    fontFamily: "LeagueSpartan-Bold",
    fontSize: 14,
    fontWeight: "700",
  },
  dividerText: {
    textAlign: "center",
    fontFamily: "LeagueSpartan-Regular",
    fontSize: 16,
    color: "#999",
    marginVertical: 2,
  },
  logoText: {
    textAlign: "center",
    fontFamily: "LeagueSpartan-Regular",
    fontSize: 16,
    color: "#fff",
    marginTop: 10,
  },
  buttonOutline: {
    width: "100%",
    height: 48,
    borderRadius: 12,
    marginBottom: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#497AFF",
    elevation: 4,
  },
  buttonOutlineText: {
    color: "#fff",
    fontFamily: "LeagueSpartan-Bold",
    fontSize: 16,
    fontWeight: "700",
  },
  errorText: {
    color: "#e03c3c",
    fontFamily: "LeagueSpartan-Regular",
    fontSize: 13,
    marginBottom: 10,
    textAlign: "center",
  },
  logoContainerTablet: {
    marginBottom: 48,
    marginTop: 50,
  },
  logoTextTablet: {
    fontSize: 20,
  },
  cardTablet: {
    maxWidth: 560,
    alignSelf: "center",
    borderRadius: 24,
    paddingVertical: 48,
    paddingHorizontal: 48,
    flexGrow: 0,
  },
  loginTitleTablet: {
    fontSize: 40,
    marginBottom: 36,
  },
  rowFields: {
    flexDirection: "row",
    gap: 16,
  },
  labelTablet: {
    fontSize: 20,
  },
  inputTablet: {
    height: 54,
    fontSize: 17,
    borderRadius: 12,
  },
  buttonTablet: {
    height: 56,
    borderRadius: 14,
  },
  rowButtons: {
    flexDirection: "row",
    gap: 12,
  },
  buttonOutlineTablet: {
    flex: 1,
    height: 56,
    borderRadius: 14,
  },
  buttonTextTablet: {
    fontSize: 18,
  },
  dividerTextTablet: {
    fontSize: 18,
  },
});
