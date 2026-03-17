import React from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as SecureStore from "expo-secure-store";
import { getMajstrProfile } from "../services/api";
import { colors } from "../theme";
import { fonts } from "../theme";

// MOCK DATA — remove once navigation always passes masterId from a list screen
const MOCK_MASTER = {
  id: "mock-uuid",
  full_name: "Peter Majster",
  description: "Izkušen mojster z več kot 10 leti izkušenj na področju vodovodnih inštalacij in ogrevanja. Zagotavljam kakovostno delo in hitro odzivnost.",
  location: "Maribor",
  avg_rating: 4,
  response_time: "< 2h",
  avatar_url: "https://static.vecteezy.com/system/resources/thumbnails/032/176/191/small/business-avatar-profile-black-icon-man-of-user-symbol-in-trendy-flat-style-isolated-on-male-profile-people-diverse-face-for-social-network-or-web-vector.jpg",
  services: ["Vodovodne inštalacije", "Ogrevanje"],
  phone: "041 123 456",
  email: "peter.majster@email.com",
};

// MOCK DATA — replace : ratings endpoint
const MOCK_RATINGS = [
  { id: "r1", master_id: "mock-uuid", score: 5, comment: "Nice" },
  { id: "r2", master_id: "mock-uuid", score: 4, comment: "Decent" },
  { id: "r3", master_id: "mock-uuid", score: 2, comment: "Ok" },
  { id: "r4", master_id: "mock-uuid", score: 1, comment: "Bad" },
];


import { ROUTES } from "../navigation/routes";

export default function MajstrProfileScreen({ navigation, route }) {
  const masterId = route.params?.masterId;
  const [master, setMaster] = React.useState(route.params?.master ?? MOCK_MASTER);
  const [loading, setLoading] = React.useState(!route.params?.master && !!masterId);
  const [fetchError, setFetchError] = React.useState(null);

  React.useEffect(() => {
    if (masterId && !route.params?.master) {
      setLoading(true);
      getMajstrProfile(masterId)
        .then(setMaster)
        .catch((e) => setFetchError(e.message))
        .finally(() => setLoading(false));
    }
  }, [masterId]);

  // FM-103: true when the logged-in user is the master being viewed
  const [isMaster, setIsMaster] = React.useState(false);
  React.useEffect(() => {
    SecureStore.getItemAsync("user_id").then((userId) => {
      if (userId && master?.user_id) {
        setIsMaster(userId === master.user_id);
      }
    });
  }, [master?.user_id]);

  if (loading) {
    return (
      <SafeAreaView style={styles.mainWrapper} edges={["bottom"]}>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <Text style={{ fontFamily: fonts.regular, color: colors.textLight }}>
            Nalaganje...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (fetchError || !master) {
    return (
      <SafeAreaView style={styles.mainWrapper} edges={["bottom"]}>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 22 }}>
          <Text style={{ fontFamily: fonts.regular, color: colors.error, textAlign: "center" }}>
            {fetchError ?? "Profil mojstra ni bil najden."}
          </Text>
        </View>
      </SafeAreaView>
    );
  }
  //const isMaster = true; //testing master inquiries

  const handleSendInquiry = () => {
    navigation.navigate(ROUTES.POVPRASEVANJE, { master });
  };

  const renderWrenchRating = (rating) => {
    const full = Math.round(rating ?? 0);
    return (
      <View style={styles.wrenchRow}>
        {Array.from({ length: 5 }, (_, i) => (
          <MaterialCommunityIcons
            key={i}
            name="wrench"
            size={22}
            color={i < full ? colors.primary : colors.border}
            style={styles.wrenchIcon}
          />
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.mainWrapper} edges={["bottom"]}>
      <StatusBar barStyle="light-content" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
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
            {master.avatar_url ? (
              <Image
                source={{ uri: master.avatar_url }}
                style={styles.avatar}
              />
            ) : (
              <View style={styles.avatarEmpty}>
                <Text style={styles.avatarEmptyText}>
                  {master.full_name?.slice(0, 2).toUpperCase() ?? "??"}
                </Text>
              </View>
            )}
          </View>
        </LinearGradient>

        <View style={styles.profileInfo}>
          <Text style={styles.masterName}>{master.full_name}</Text>
          <Text style={styles.categoryText}>{master.services?.join(", ")}</Text>
          {renderWrenchRating(master.avg_rating)}
          <View style={styles.infoChips}>
            <View style={styles.chip}>
              <MaterialCommunityIcons
                name="map-marker-outline"
                size={14}
                color={colors.textLight}
              />
              <Text style={styles.chipText}>{master.location}</Text>
            </View>
            {master.response_time ? (
              <View style={styles.chip}>
                <MaterialCommunityIcons
                  name="clock-outline"
                  size={14}
                  color={colors.textLight}
                />
                <Text style={styles.chipText}>Odziv {master.response_time}</Text>
              </View>
            ) : null}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionHeading}>O meni:</Text>
          <Text style={styles.bodyText}>{master.description}</Text>
        </View>


        <View style={styles.section}>
          <Text style={styles.sectionHeading}>Ocene:</Text>
          <ScrollView
            style={styles.reviewsScroll}
            nestedScrollEnabled={true}
            showsVerticalScrollIndicator={false}
          >
            {MOCK_RATINGS.map((rating) => (
              <View key={rating.id} style={styles.reviewCard}>
                <View style={styles.reviewStarRow}>
                  {Array.from({ length: 5 }, (_, i) => (
                    <MaterialCommunityIcons
                      key={i}
                      name="wrench"
                      size={16}
                      color={i < rating.score ? colors.primary : colors.border}
                      style={{ marginRight: 2 }}
                    />
                  ))}
                </View>
                {rating.comment ? (
                  <Text style={styles.reviewComment}>{rating.comment}</Text>
                ) : null}
              </View>
            ))}
          </ScrollView>
        </View>

        <View style={styles.buttonWrapper}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleSendInquiry}
            activeOpacity={0.8}
          >
            <Text style={styles.primaryButtonText}>Povpraševanje</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => navigation.navigate(ROUTES.RATING, { master })}
            activeOpacity={0.8}
          >
            <Text style={styles.secondaryButtonText}>Oceni mojstra</Text>
          </TouchableOpacity>

          {/*FM 103: Only shown when the logged-in user IS this master */}
          {isMaster && (
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => navigation.navigate(ROUTES.RECEIVED_INQUIRIES)}
              activeOpacity={0.8}
            >
              <Text style={styles.secondaryButtonText}>
                Prejeta povpraševanja
              </Text>
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
  profileInfo: {
    alignItems: "center",
    marginTop: 65,
    marginBottom: 10,
    paddingHorizontal: 20,
  },
  masterName: {
    fontSize: 26,
    fontFamily: fonts.bold,
    color: colors.textDark,
    marginBottom: 4,
  },
  categoryText: {
    fontSize: 15,
    fontFamily: fonts.medium,
    color: colors.textMedium,
    marginBottom: 10,
  },
  infoChips: {
    flexDirection: "row",
    gap: 10,
    marginTop: 12,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.backgroundLight,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  chipText: {
    fontSize: 12,
    fontFamily: fonts.regular,
    color: colors.textLight,
  },
  wrenchRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  wrenchIcon: {
    marginHorizontal: 4,
  },
  section: {
    paddingHorizontal: 22,
    marginTop: 24,
  },
  sectionHeading: {
    fontSize: 17,
    fontFamily: fonts.bold,
    color: colors.textDark,
    marginBottom: 10,
  },
  bodyText: {
    fontSize: 14,
    fontFamily: fonts.regular,
    color: colors.textMedium,
    lineHeight: 22,
  },

  reviewsScroll: {
    maxHeight: 220,
  },
  reviewCard: {
    backgroundColor: colors.backgroundLight,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  reviewStarRow: {
    flexDirection: "row",
    marginBottom: 6,
  },
  reviewComment: {
    fontSize: 13,
    fontFamily: fonts.regular,
    color: colors.textMedium,
    lineHeight: 19,
  },
  buttonWrapper: {
    paddingHorizontal: 22,
    marginTop: 32,
    gap: 12,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    height: 56,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    color: colors.white,
    fontSize: 16,
    fontFamily: fonts.bold,
    letterSpacing: 0.3,
  },
  secondaryButton: {
    height: 56,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryButtonText: {
    color: colors.primary,
    fontSize: 16,
    fontFamily: fonts.bold,
    letterSpacing: 0.3,
  },
});
