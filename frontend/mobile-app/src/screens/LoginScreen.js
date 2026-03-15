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

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleLogin = async () => {
    try {
      setLoading(true);
      const data = await loginUser(email, password);
      console.log("Login uspešen:", data);
      await SecureStore.setItemAsync("access_token", data.access_token);
      await SecureStore.setItemAsync("user_id", data.user_id);
      navigation.navigate("Home");
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
      <View style={styles.logoContainer}>
        <Image
          source={bigTextLogo}
          style={{ width: "100%", height: 80 }}
          resizeMode="contain"
        />
        <Text style={styles.logoText}>Mojster en klik vstran</Text>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1, width: "100%" }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          style={{ width: "100%" }}
          contentContainerStyle={styles.card}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.loginTitle}>PRIJAVA</Text>

          <View style={styles.formContainer}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Text style={styles.label}>Geslo</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={true}
            />

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
                  style={styles.buttonPrimary}
                  onPress={handleLogin}
                  activeOpacity={0.85}
                >
                  <Text style={styles.buttonPrimaryText}>Prijavi se</Text>
                </TouchableOpacity>

                <Text style={styles.dividerText}>ali se registriraj kot</Text>

                <TouchableOpacity
                  style={styles.buttonOutline}
                  onPress={() => navigation.navigate("RegisterUser")}
                  activeOpacity={0.85}
                >
                  <Text style={styles.buttonOutlineText}>Uporabnik</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.buttonOutline}
                  onPress={() => navigation.navigate("RegisterMajstr")}
                  activeOpacity={0.85}
                >
                  <Text style={styles.buttonOutlineText}>Mojster</Text>
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
});
