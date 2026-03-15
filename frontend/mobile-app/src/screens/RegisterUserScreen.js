import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  ScrollView,
  View,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import bigTextLogo from "../../assets/fixmajstr-logo-blue-white.png";
import { KeyboardAvoidingView, Platform } from "react-native";
import { registerUser } from "../services/api";

export default function RegisterUserScreen({ navigation }) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleRegister = async () => {
    const nameRegex = /^[a-zA-ZčšžČŠŽ\s]{2,50}$/;
    if (!fullName) {
      setError("Ime je obvezno!");
      return;
    }
    if (!nameRegex.test(fullName)) {
      setError("Ime ne sme vsebovati številk!");
      return;
    }
    if (!email) {
      setError("Email je obvezen!");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Email ni veljaven!");
      return;
    }
    if (!password) {
      setError("Geslo je obvezno!");
      return;
    }
    if (password.length < 8) {
      setError("Geslo mora imeti vsaj 8 znakov!");
      return;
    }
    if (!repeatPassword) {
      setError("Potrdi geslo!");
      return;
    }
    if (password !== repeatPassword) {
      setError("Gesli se ne ujemata!");
      return;
    }
    try {
      setLoading(true);
      const data = await registerUser(fullName, email, password);
      console.log("Registracija uspešna:", data);
      navigation.navigate("Login");
    } catch (err) {
      setError("Napaka pri registraciji: " + err.message);
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
          <Text style={styles.title}>REGISTRACIJA UPORABNIKA</Text>

          <View style={styles.formContainer}>
            <Text style={styles.label}>Ime</Text>
            <TextInput
              style={styles.input}
              value={fullName}
              onChangeText={setFullName}
              autoCapitalize="none"
            />

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

            <Text style={styles.label}>Potrdi geslo</Text>
            <TextInput
              style={styles.input}
              value={repeatPassword}
              onChangeText={setRepeatPassword}
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
                  onPress={handleRegister}
                  activeOpacity={0.85}
                >
                  <Text style={styles.buttonPrimaryText}>Registriraj se</Text>
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
  logoText: {
    textAlign: "center",
    fontFamily: "LeagueSpartan-Regular",
    fontSize: 16,
    color: "#fff",
    marginTop: 10,
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
  title: {
    fontFamily: "LeagueSpartan-Bold",
    fontSize: 24,
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
    paddingBottom: 80,
  },
  buttonPrimary: {
    width: "100%",
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#497AFF",
    elevation: 4,
  },
  buttonPrimaryText: {
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
