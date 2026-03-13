import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Image,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { submitInquiry } from "../services/api";
import { colors } from "../theme";
import { fonts } from "../theme";

export default function PovprasevanjeScreen({ navigation, route }) {
  const master = route.params?.master ?? null;

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Defensive: if navigated here without a master (e.g. directly from HomeScreen)
  if (!master) {
    return (
      <SafeAreaView style={styles.mainWrapper} edges={["bottom"]}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorBig}>Ni izbranega mojstra.</Text>
          <Text style={styles.errorSub}>
            Pojdite na profil mojstra in tapnite &quot;Povpraševanje&quot;.
          </Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>NAZAJ</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const handleSubmit = async () => {
    if (!message.trim()) {
      setError("Prosimo, opišite vašo težavo.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const result = await submitInquiry({
        master_id: master.id,
        message: message.trim(),
      });
      navigation.navigate("InquirySuccess", {
        status: result.inquiry.status,
        message: result.inquiry.message,
      });
    } catch (err) {
      setError("Napaka pri pošiljanju: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.mainWrapper} edges={["bottom"]}>
      <StatusBar barStyle="light-content" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero header – matches MajstrProfileScreen/RatingScreen pattern */}
        <LinearGradient
          colors={[colors.primaryLightA, "rgba(124,159,255,0.2)", colors.white]}
          style={styles.hero}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
        >
          <View style={styles.header}>
            <Image
              source={require("../../assets/FixMajstr_logo.png")}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>

          <View style={styles.avatarWrapper}>
            {master.user?.avatar_url ? (
              <Image
                source={{ uri: master.user.avatar_url }}
                style={styles.avatar}
              />
            ) : (
              <View style={styles.avatarEmpty}>
                <Text style={styles.avatarEmptyText}>
                  {(master.user?.full_name ?? "?").slice(0, 2).toUpperCase()}
                </Text>
              </View>
            )}
          </View>
        </LinearGradient>

        {/* Master name context */}
        <View style={styles.masterContext}>
          <Text style={styles.screenLabel}>POVPRAŠEVANJE</Text>
          <Text style={styles.masterName}>
            {master.user?.full_name ?? "Mojster"}
          </Text>
          {master.category?.name ? (
            <Text style={styles.categoryText}>{master.category.name}</Text>
          ) : null}
        </View>

        {/* Form */}
        <View style={styles.form}>
          <Text style={styles.label}>OPIS TEŽAVE</Text>
          <TextInput
            style={styles.textArea}
            value={message}
            onChangeText={setMessage}
            placeholder="Npr. Pipa v kopalnici pušča..."
            placeholderTextColor={colors.textMuted}
            multiline
            numberOfLines={5}
            textAlignVertical="top"
          />

          {/* Dodanti fields can be added here (npr. category, urgency, photos…) */}

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          {loading ? (
            <ActivityIndicator
              size="large"
              color={colors.primary}
              style={{ marginTop: 20 }}
            />
          ) : (
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleSubmit}
              activeOpacity={0.8}
            >
              <Text style={styles.primaryButtonText}>POŠLJI POVPRAŠEVANJE</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  mainWrapper: {
    flex: 1,
    backgroundColor: colors.white,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  // Hero
  hero: {
    paddingBottom: 60,
  },
  header: {
    height: 56,
    paddingHorizontal: 20,
    paddingTop: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  logo: {
    width: 40,
    height: 40,
  },
  avatarWrapper: {
    width: 110,
    height: 110,
    borderRadius: 55,
    alignSelf: "center",
    marginBottom: -55,
    borderWidth: 4,
    borderColor: colors.white,
    backgroundColor: colors.border,
    overflow: "hidden",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
  },
  avatar: {
    width: "100%",
    height: "100%",
  },
  avatarEmpty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primaryLight,
  },
  avatarEmptyText: {
    color: colors.white,
    fontSize: 28,
    fontFamily: fonts.bold,
  },
  // Master context
  masterContext: {
    alignItems: "center",
    marginTop: 65,
    marginBottom: 8,
    paddingHorizontal: 20,
  },
  screenLabel: {
    fontSize: 11,
    fontFamily: fonts.medium,
    letterSpacing: 2.5,
    color: colors.textLight,
    marginBottom: 6,
  },
  masterName: {
    fontSize: 24,
    fontFamily: fonts.bold,
    color: colors.textDark,
    marginBottom: 4,
  },
  categoryText: {
    fontSize: 14,
    fontFamily: fonts.regular,
    color: colors.textMedium,
  },
  // Form
  form: {
    paddingHorizontal: 22,
    marginTop: 24,
  },
  label: {
    fontSize: 12,
    fontFamily: fonts.medium,
    letterSpacing: 1,
    color: colors.textDark,
    marginBottom: 8,
  },
  textArea: {
    backgroundColor: colors.backgroundLight,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    fontFamily: fonts.regular,
    color: colors.textDark,
    marginBottom: 20,
    minHeight: 130,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    height: 56,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 6,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    color: colors.white,
    fontSize: 15,
    fontFamily: fonts.bold,
    letterSpacing: 0.5,
  },
  errorText: {
    color: colors.error,
    fontSize: 13,
    fontFamily: fonts.regular,
    marginBottom: 10,
    textAlign: "center",
  },
  // Defensive "no master" state
  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 30,
  },
  errorBig: {
    fontSize: 18,
    fontFamily: fonts.bold,
    color: colors.textDark,
    marginBottom: 10,
    textAlign: "center",
  },
  errorSub: {
    fontSize: 14,
    fontFamily: fonts.regular,
    color: colors.textMedium,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 28,
  },
  backButton: {
    backgroundColor: colors.primary,
    height: 48,
    borderRadius: 12,
    paddingHorizontal: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  backButtonText: {
    color: colors.white,
    fontFamily: fonts.bold,
    fontSize: 13,
    letterSpacing: 1.5,
  },
});
