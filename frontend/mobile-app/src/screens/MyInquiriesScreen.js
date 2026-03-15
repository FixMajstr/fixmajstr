import React, { useState, useEffect, useCallback } from "react";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getMyInquiries } from "../services/api";
import { colors } from "../theme";
import { fonts } from "../theme";

const STATUS_CONFIG = {
  pending: { label: "V ČAKANJU", color: colors.textLight },
  accepted: { label: "SPREJETO", color: "#4caf50" },
  rejected: { label: "ZAVRNJENO", color: colors.error },
};

function formatDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString("sl-SI", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function InquiryItem({ item, expanded, onToggle }) {
  const cfg = STATUS_CONFIG[item.status] ?? STATUS_CONFIG.pending;
  const preview = item.message
    ? item.message.length > 70
      ? item.message.slice(0, 67) + "…"
      : item.message
    : "(brez sporočila)";

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onToggle}
      activeOpacity={0.75}
    >
      {/* Row */}
      <View style={styles.cardHeader}>
        <View style={styles.cardHeaderLeft}>
          <Text
            style={styles.cardPreview}
            numberOfLines={expanded ? undefined : 2}
          >
            {expanded ? (item.message ?? "(brez sporočila)") : preview}
          </Text>
          <Text style={styles.cardDate}>{formatDate(item.created_at)}</Text>
        </View>
        <View style={[styles.badge, { backgroundColor: cfg.color }]}>
          <Text style={styles.badgeText}>{cfg.label}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function MyInquiriesScreen() {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [expandedId, setExpandedId] = useState(null);

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);
    try {
      const data = await getMyInquiries();
      setInquiries(data.inquiries ?? []);
    } catch (err) {
      setError("Napaka pri nalaganju: " + err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const toggleExpand = (id) =>
    setExpandedId((prev) => (prev === id ? null : id));

  if (loading) {
    return (
      <SafeAreaView style={styles.wrapper} edges={["bottom"]}>
        <ActivityIndicator
          size="large"
          color={colors.primary}
          style={{ marginTop: 60 }}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.wrapper} edges={["bottom"]}>
      <StatusBar barStyle="dark-content" />
      <FlatList
        data={inquiries}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => load(true)}
            tintColor={colors.primary}
          />
        }
        ListHeaderComponent={<Text style={styles.heading}>MOJE POIZVEDBE</Text>}
        ListEmptyComponent={
          error ? (
            <Text style={styles.emptyError}>{error}</Text>
          ) : (
            <Text style={styles.emptyText}>
              Nimate še nobenih povpraševanj.
            </Text>
          )
        }
        renderItem={({ item }) => (
          <InquiryItem
            item={item}
            expanded={expandedId === item.id}
            onToggle={() => toggleExpand(item.id)}
          />
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: colors.white,
  },
  list: {
    padding: 20,
    paddingBottom: 40,
    flexGrow: 1,
  },
  heading: {
    fontSize: 12,
    fontFamily: fonts.bold,
    letterSpacing: 2.5,
    color: colors.textLight,
    marginBottom: 20,
    marginTop: 6,
  },
  card: {
    backgroundColor: colors.backgroundLight,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  cardHeaderLeft: {
    flex: 1,
  },
  cardPreview: {
    fontSize: 14,
    fontFamily: fonts.regular,
    color: colors.textDark,
    lineHeight: 20,
    marginBottom: 6,
  },
  cardDate: {
    fontSize: 12,
    fontFamily: fonts.regular,
    color: colors.textMuted,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-start",
    flexShrink: 0,
  },
  badgeText: {
    color: colors.white,
    fontFamily: fonts.bold,
    fontSize: 10,
    letterSpacing: 0.8,
  },
  emptyText: {
    fontSize: 15,
    fontFamily: fonts.regular,
    color: colors.textMedium,
    textAlign: "center",
    marginTop: 60,
  },
  emptyError: {
    fontSize: 14,
    fontFamily: fonts.regular,
    color: colors.error,
    textAlign: "center",
    marginTop: 60,
  },
});
