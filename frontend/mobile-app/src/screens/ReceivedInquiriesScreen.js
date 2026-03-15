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
import { getReceivedInquiries, updateInquiryStatus } from "../services/api";
import { colors } from "../theme";
import { fonts } from "../theme";

function parseApiError(err) {
  if (!err.response) return "Napaka v omrežju. Preverite internetno povezavo.";
  switch (err.response.status) {
    case 401:
      return "Seja je potekla. Prijavite se ponovno.";
    case 403:
      return "Nimate dovoljenja za to dejanje.";
    case 409:
      return "Povpraševanje je bilo že obdelano.";
    case 422:
      return "Neveljavni podatki.";
    default:
      return `Napaka (${err.response.status}). Poskusite znova.`;
  }
}

const VALID_STATUSES = ["accepted", "rejected"];

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

function InquiryItem({ item, expanded, onToggle, onStatusUpdate }) {
  const cfg = STATUS_CONFIG[item.status] ?? STATUS_CONFIG.pending;
  const isPending = item.status === "pending";
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState(null);

  const handleAction = async (newStatus) => {
    if (!VALID_STATUSES.includes(newStatus)) return;
    setActionError(null);
    setActionLoading(true);
    try {
      await onStatusUpdate(item.id, newStatus);
    } catch (err) {
      setActionError(parseApiError(err));
    } finally {
      setActionLoading(false);
    }
  };

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
            {item.message ?? "(brez sporočila)"}
          </Text>
          <Text style={styles.cardDate}>{formatDate(item.created_at)}</Text>
        </View>
        <View style={[styles.badge, { backgroundColor: cfg.color }]}>
          <Text style={styles.badgeText}>{cfg.label}</Text>
        </View>
      </View>

      {/* Expanded: approve / deny actions */}
      {expanded && isPending && (
        <View style={styles.actions}>
          {actionLoading ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <>
              <TouchableOpacity
                style={[styles.actionBtn, styles.acceptBtn]}
                onPress={() => handleAction("accepted")}
                disabled={actionLoading}
                activeOpacity={0.8}
              >
                <Text style={styles.actionBtnText}>SPREJMI</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionBtn, styles.rejectBtn]}
                onPress={() => handleAction("rejected")}
                disabled={actionLoading}
                activeOpacity={0.8}
              >
                <Text style={styles.actionBtnText}>ZAVRNI</Text>
              </TouchableOpacity>
            </>
          )}
          {actionError ? (
            <Text style={styles.actionError}>{actionError}</Text>
          ) : null}
        </View>
      )}
    </TouchableOpacity>
  );
}

export default function ReceivedInquiriesScreen() {
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
      const data = await getReceivedInquiries();
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

  const handleStatusUpdate = async (id, status) => {
    if (!VALID_STATUSES.includes(status)) return;
    await updateInquiryStatus(id, status);

    setInquiries((prev) =>
      prev.map((inq) => (inq.id === id ? { ...inq, status } : inq)),
    );
    setExpandedId(null);
  };

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
        ListHeaderComponent={
          <Text style={styles.heading}>PREJETA POVPRAŠEVANJA</Text>
        }
        ListEmptyComponent={
          error ? (
            <Text style={styles.emptyError}>{error}</Text>
          ) : (
            <Text style={styles.emptyText}>Ni prejetih povpraševanj.</Text>
          )
        }
        renderItem={({ item }) => (
          <InquiryItem
            item={item}
            expanded={expandedId === item.id}
            onToggle={() => toggleExpand(item.id)}
            onStatusUpdate={handleStatusUpdate}
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
  actions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  actionBtn: {
    flex: 1,
    height: 44,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  acceptBtn: {
    backgroundColor: "#4caf50",
  },
  rejectBtn: {
    backgroundColor: colors.error,
  },
  actionBtnText: {
    color: colors.white,
    fontFamily: fonts.bold,
    fontSize: 13,
    letterSpacing: 1,
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
  actionError: {
    fontSize: 12,
    fontFamily: fonts.regular,
    color: colors.error,
    marginTop: 8,
    textAlign: "center",
    width: "100%",
  },
});
