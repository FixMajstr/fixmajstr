import React from "react";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { colors } from "../theme";
import { fonts } from "../theme";

export default function InquirySuccessScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>POVPRAŠEVANJE POSLANO</Text>

      <View style={styles.badge}>
        <Text style={styles.badgeText}>V ČAKANJU</Text>
      </View>

      <Text style={styles.hint}>
        Mojster bo pregledal vaše povpraševanje. Status preverite v Mojih
        poizvedbah.
      </Text>

      <TouchableOpacity
        style={styles.primaryButton}
        onPress={() => navigation.navigate("MyInquiries")}
        activeOpacity={0.8}
      >
        <Text style={styles.primaryButtonText}>MOJE POIZVEDBE</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.secondaryButton}
        onPress={() => navigation.goBack()}
        activeOpacity={0.8}
      >
        <Text style={styles.secondaryButtonText}>NAZAJ</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
    padding: 30,
  },
  title: {
    fontSize: 14,
    fontFamily: fonts.bold,
    letterSpacing: 3,
    color: colors.textLight,
    marginBottom: 24,
  },
  badge: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.textLight,
    marginBottom: 20,
  },
  badgeText: {
    color: colors.white,
    fontFamily: fonts.bold,
    fontSize: 13,
    letterSpacing: 1.5,
  },
  hint: {
    fontSize: 14,
    fontFamily: fonts.regular,
    color: colors.textMedium,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 32,
    paddingHorizontal: 10,
  },
  primaryButton: {
    width: "100%",
    height: 56,
    borderRadius: 14,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    color: colors.white,
    fontFamily: fonts.bold,
    fontSize: 15,
    letterSpacing: 0.5,
  },
  secondaryButton: {
    width: "100%",
    height: 56,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryButtonText: {
    color: colors.primary,
    fontFamily: fonts.bold,
    fontSize: 15,
    letterSpacing: 0.5,
  },
});
