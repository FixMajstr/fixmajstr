import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from "react-native";
import bigTextLogo from "../../assets/FixMajstr_txt.png";
import { registerMajstr } from "../services/api";

export default function RegisterMajstrScreen({ navigation }) {
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
      const data = await registerMajstr(fullName, email, password);
      console.log("Registracija uspešna:", data);
      navigation.navigate("Login");
    } catch (err) {
      setError("Napaka pri registraciji: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Image
          source={bigTextLogo}
          style={{ width: "90%", height: 80 }}
          resizeMode="contain"
        />
      </View>

      <View style={styles.content}>
        <Text style={styles.loginTitle}>REGISTER MAJSTR</Text>
        <View style={styles.formContainer}>
          <Text style={styles.label}>NAME</Text>
          <TextInput
            style={styles.input}
            value={fullName}
            onChangeText={setFullName}
            autoCapitalize="none"
          />
          <Text style={styles.label}>EMAIL</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text style={styles.label}>PASSWORD</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            secureTextEntry={true}
          />

          <Text style={styles.label}>CONFIRM PASSWORD</Text>
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
              color="#6b7ab5"
              style={{ marginTop: 20 }}
            />
          ) : (
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, styles.buttonRegisterMajstr]}
                onPress={handleRegister}
              >
                <Text style={styles.buttonText}>REGISTER MAJSTR</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "flex-start",
    paddingTop: 50,
    padding: 30,
  },
  content: {
    width: "100%",
    alignItems: "center",
  },
  logoContainer: {
    marginBottom: 60,
    width: "100%",
    alignItems: "center",
  },
  logoText: {
    fontSize: 36,
    fontWeight: "900",
    letterSpacing: 2,
    color: "#1a1a2e",
  },
  loginTitle: {
    fontSize: 14,
    letterSpacing: 3,
    color: "#888",
    marginBottom: 30,
  },
  formContainer: {
    width: "100%",
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 1,
    color: "#333",
    marginBottom: 6,
  },
  input: {
    width: "100%",
    height: 44,
    backgroundColor: "#e8e8e8",
    borderRadius: 6,
    paddingHorizontal: 12,
    marginBottom: 16,
    fontSize: 14,
  },
  buttonContainer: {
    marginTop: 10,
    gap: 10,
  },
  button: {
    width: "100%",
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonRegisterMajstr: {
    backgroundColor: "#8b9fd4",
  },
  buttonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1.5,
  },
  errorText: {
    color: "red",
    fontSize: 13,
    marginBottom: 10,
    textAlign: "center",
  },
});
