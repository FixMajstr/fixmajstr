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
  useWindowDimensions,
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
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;

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
      <View
        style={[styles.logoContainer, isTablet && styles.logoContainerTablet]}
      >
        <Image
          source={bigTextLogo}
          style={{
            width: isTablet ? 420 : "100%",
            height: isTablet ? 140 : 80,
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
          <Text style={[styles.title, isTablet && styles.titleTablet]}>
            REGISTRACIJA UPORABNIKA
          </Text>

          <View style={styles.formContainer}>
            <View style={isTablet ? styles.rowFields : null}>
              <View style={isTablet ? { flex: 1 } : null}>
                <Text style={[styles.label, isTablet && styles.labelTablet]}>
                  Ime
                </Text>
                <TextInput
                  style={[styles.input, isTablet && styles.inputTablet]}
                  value={fullName}
                  onChangeText={setFullName}
                  autoCapitalize="none"
                />
              </View>

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
            </View>

            <View style={isTablet ? styles.rowFields : null}>
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

              <View style={isTablet ? { flex: 1 } : null}>
                <Text style={[styles.label, isTablet && styles.labelTablet]}>
                  Potrdi geslo
                </Text>
                <TextInput
                  style={[styles.input, isTablet && styles.inputTablet]}
                  value={repeatPassword}
                  onChangeText={setRepeatPassword}
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
                  onPress={handleRegister}
                  activeOpacity={0.85}
                >
                  <Text
                    style={[
                      styles.buttonPrimaryText,
                      isTablet && styles.buttonTextTablet,
                    ]}
                  >
                    Registriraj se
                  </Text>
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
  logoContainerTablet: {
    marginBottom: 48,
    marginTop: 40,
  },
  logoTextTablet: {
    fontSize: 20,
  },
  cardTablet: {
    maxWidth: 620,
    alignSelf: "center",
    borderRadius: 24,
    paddingVertical: 48,
    paddingHorizontal: 48,
    flexGrow: 0,
  },
  titleTablet: {
    fontSize: 36,
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
    marginTop: 50,
    height: 56,
    borderRadius: 14,
    width: 320,
    alignSelf: "center",
  },
  buttonTextTablet: {
    fontSize: 18,
  },
});
