import React, { useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Building2, ChevronRight, Wallet, CircleCheck as CheckCircle2, FileText, Globe, CircleAlert as AlertCircle, Landmark } from "lucide-react-native";
import { useAuthStore } from "@/store/authStore";
import { useMissedBenefits } from "@/hooks/useMissedBenefits";
import { useThemedStyles, usePalette } from "@/hooks/useThemedStyles";
import type { MissedScheme } from "@/lib/api/services/welfareService";
import type { SchemeStackParamList } from "@/navigation/RootNavigator";
import { SkeletonLoader } from "@/components/ui/SkeletonLoader";

type NavigationProp = NativeStackNavigationProp<SchemeStackParamList>;

const CITIZEN_ID_FALLBACK = "citizen_101";

function formatINR(amount: number): string {
  return `\u20B9${amount.toLocaleString("en-IN")}`;
}

function SchemeCard({ scheme, onPress, palette, s }: { scheme: MissedScheme; onPress: () => void; palette: ReturnType<typeof usePalette>; s: ReturnType<typeof useThemedStyles<any>> }) {
  return (
    <TouchableOpacity activeOpacity={0.78} onPress={onPress} style={s.card}>
      <View style={s.cardHeader}>
        <View style={s.cardIconBox}>
          <Landmark size={20} color={palette.primary} strokeWidth={2} />
        </View>
        <Text style={s.cardTitle}>{scheme.name}</Text>
      </View>

      {scheme.description ? (
        <Text style={s.cardDesc}>{scheme.description}</Text>
      ) : (
        <Text style={s.cardDesc}>{scheme.reason}</Text>
      )}

      <View style={s.tagRow}>
        {scheme.category && (
          <View style={s.tagPrimary}>
            <Text style={s.tagPrimaryText}>{scheme.category}</Text>
          </View>
        )}
        {scheme.governmentLevel && (
          <View style={s.tagSecondary}>
            <Building2 size={11} color={palette.secondary} strokeWidth={2} />
            <Text style={s.tagSecondaryText}>{scheme.governmentLevel}</Text>
          </View>
        )}
        <View style={s.tagSuccess}>
          <CheckCircle2 size={11} color={palette.success} strokeWidth={2} />
          <Text style={s.tagSuccessText}>Eligible</Text>
        </View>
      </View>

      {scheme.benefitAmount > 0 && (
        <View style={s.benefitRow}>
          <Wallet size={16} color={palette.success} strokeWidth={2} />
          <Text style={s.benefitText}>{formatINR(scheme.benefitAmount)} / year</Text>
        </View>
      )}

      <View style={s.cardFooter}>
        <View style={s.footerLeft}>
          {scheme.officialUrl && (
            <View style={s.urlRow}>
              <Globe size={13} color={palette.textMuted} strokeWidth={2} />
              <Text style={s.urlText} numberOfLines={1}>{scheme.officialUrl}</Text>
            </View>
          )}
        </View>
        <View style={s.chevronRow}>
          <Text style={s.viewText}>View Details</Text>
          <ChevronRight size={16} color={palette.primary} strokeWidth={2} />
        </View>
      </View>
    </TouchableOpacity>
  );
}

export function SchemesScreen() {
  const { user } = useAuthStore();
  const citizenId = user?.id ?? CITIZEN_ID_FALLBACK;
  const { data, isLoading, error, refetch } = useMissedBenefits(citizenId);
  const schemes = data?.missedSchemes ?? null;
  const navigation = useNavigation<NavigationProp>();
  const palette = usePalette();

  useEffect(() => {
    refetch();
  }, [refetch]);

  const handleSchemePress = useCallback((scheme: MissedScheme) => {
    navigation.navigate("SchemeDetail", { schemeId: scheme.id, schemeName: scheme.name });
  }, [navigation]);

  const s = useThemedStyles((p) => StyleSheet.create({
    container: { flex: 1, backgroundColor: p.background },
    headerArea: { paddingHorizontal: 24, paddingTop: 24, paddingBottom: 20 },
    eyebrow: {
      color: p.textSecondary, fontSize: 11, fontWeight: "700",
      letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 4,
    },
    pageTitle: { color: p.textPrimary, fontSize: 30, fontWeight: "800" },
    subtitle: { color: p.textSecondary, fontSize: 14, lineHeight: 20, marginTop: 8 },
    card: {
      backgroundColor: p.surface, borderRadius: 16,
      borderWidth: 1, borderColor: p.border, padding: 16, marginBottom: 14,
    },
    cardHeader: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 8 },
    cardIconBox: {
      width: 36, height: 36, borderRadius: 10,
      backgroundColor: p.primaryA12, alignItems: "center", justifyContent: "center",
    },
    cardTitle: { color: p.textPrimary, fontSize: 15, fontWeight: "700", flex: 1, lineHeight: 21 },
    cardDesc: { color: p.textSecondary, fontSize: 13, lineHeight: 19, marginBottom: 10 },
    tagRow: { flexDirection: "row", gap: 8, flexWrap: "wrap", marginBottom: 10 },
    tagPrimary: {
      backgroundColor: p.primaryA18, borderRadius: 8,
      paddingHorizontal: 8, paddingVertical: 3,
    },
    tagPrimaryText: { color: p.primary, fontSize: 11, fontWeight: "600" },
    tagSecondary: {
      flexDirection: "row", alignItems: "center", gap: 4,
      backgroundColor: p.secondaryA0D, borderRadius: 8,
      paddingHorizontal: 8, paddingVertical: 3,
      borderWidth: 1, borderColor: p.secondaryA44,
    },
    tagSecondaryText: { color: p.secondary, fontSize: 11, fontWeight: "600" },
    tagSuccess: {
      flexDirection: "row", alignItems: "center", gap: 4,
      backgroundColor: p.successA18, borderRadius: 8,
      paddingHorizontal: 8, paddingVertical: 3,
      borderWidth: 1, borderColor: p.successA33,
    },
    tagSuccessText: { color: p.success, fontSize: 11, fontWeight: "600" },
    benefitRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 8 },
    benefitText: { color: p.success, fontSize: 14, fontWeight: "700" },
    cardFooter: {
      flexDirection: "row", justifyContent: "space-between", alignItems: "center",
      paddingTop: 10, borderTopWidth: 1, borderTopColor: p.border,
    },
    footerLeft: { flex: 1, marginRight: 12 },
    urlRow: { flexDirection: "row", alignItems: "center", gap: 6 },
    urlText: { color: p.textMuted, fontSize: 12, flex: 1 },
    chevronRow: { flexDirection: "row", alignItems: "center", gap: 4 },
    viewText: { color: p.primary, fontSize: 12, fontWeight: "600" },
    countRow: { flexDirection: "row", alignItems: "center", marginBottom: 16 },
    countText: { color: p.textPrimary, fontSize: 17, fontWeight: "700", flex: 1 },
    errorArea: { alignItems: "center", paddingTop: 60, paddingHorizontal: 24, gap: 16 },
    errorText: { color: p.error, fontSize: 13, textAlign: "center" },
    retryBtn: { backgroundColor: p.primary, paddingHorizontal: 28, paddingVertical: 12, borderRadius: 14 },
    retryBtnText: { color: p.white, fontWeight: "700" },
    emptyArea: { alignItems: "center", paddingTop: 80, paddingHorizontal: 24, gap: 16 },
    emptyText: { color: p.textSecondary, fontSize: 15, textAlign: "center", lineHeight: 22 },
    skeletonCard: {
      padding: 16, borderRadius: 16, backgroundColor: p.surface,
      borderWidth: 1, borderColor: p.border, gap: 8,
    },
  }));

  return (
    <SafeAreaView style={s.container} edges={["top"]}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={palette.primary} />
        }
      >
        <View style={s.headerArea}>
          <Text style={s.eyebrow}>Recommended for you</Text>
          <Text style={s.pageTitle}>Schemes</Text>
          <Text style={s.subtitle}>Welfare schemes matched to your profile</Text>
        </View>

        {isLoading && !schemes ? (
          <View style={{ paddingHorizontal: 24, gap: 14 }}>
            {[1, 2, 3].map((i) => (
              <View key={i} style={s.skeletonCard}>
                <SkeletonLoader height={18} width="60%" />
                <SkeletonLoader height={14} width="85%" />
                <SkeletonLoader height={14} width="40%" />
              </View>
            ))}
          </View>
        ) : error ? (
          <View style={s.errorArea}>
            <AlertCircle size={32} color={palette.error} strokeWidth={1.5} />
            <Text style={s.errorText}>{error}</Text>
            <TouchableOpacity onPress={refetch} style={s.retryBtn} activeOpacity={0.8}>
              <Text style={s.retryBtnText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : !schemes || schemes.length === 0 ? (
          <View style={s.emptyArea}>
            <FileText size={32} color={palette.textMuted} strokeWidth={1.5} />
            <Text style={s.emptyText}>
              No recommended schemes available at this time. Please check back later or update your profile for better matches.
            </Text>
          </View>
        ) : (
          <View style={{ paddingHorizontal: 24 }}>
            <View style={s.countRow}>
              <Text style={s.countText}>
                {schemes.length} scheme{schemes.length !== 1 ? "s" : ""} matched
              </Text>
            </View>
            {schemes.map((scheme) => (
              <SchemeCard key={scheme.id} scheme={scheme} onPress={() => handleSchemePress(scheme)} palette={palette} s={s} />
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
