import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
  Alert,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute, type RouteProp } from "@react-navigation/native";
import { ChevronLeft, Building2, Wallet, FileText, Globe, CircleCheck as CheckCircle2, CircleAlert as AlertCircle, ExternalLink, ListChecks, Info, Users, MapPin, Calendar, IndianRupee } from "lucide-react-native";
import { welfareService, type SchemeDetails } from "@/lib/api/services/welfareService";
import { Palette } from "@/constants/theme";
import type { SchemeStackParamList } from "@/navigation/RootNavigator";

type SchemeRouteProp = RouteProp<SchemeStackParamList, "SchemeDetail">;

function formatINR(amount: number): string {
  return `\u20B9${amount.toLocaleString("en-IN")}`;
}

function SectionCard({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <View style={s.sectionWrap}>
      <View style={s.sectionHeader}>
        {icon}
        <Text style={s.sectionTitle}>{title}</Text>
      </View>
      <View style={s.sectionCard}>
        {children}
      </View>
    </View>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <View style={s.infoRow}>
      <View style={s.infoLeft}>
        {icon}
        <Text style={s.infoLabel}>{label}</Text>
      </View>
      <Text style={s.infoValue}>{value}</Text>
    </View>
  );
}

export function SchemeDetailScreen() {
  const route = useRoute<SchemeRouteProp>();
  const navigation = useNavigation();
  const { schemeId, schemeName } = route.params;
  const [details, setDetails] = useState<SchemeDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDetails = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await welfareService.getSchemeDetails(schemeId);
      setDetails(result);
    } catch (err: any) {
      setError(err?.message || "Unable to load scheme details. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [schemeId]);

  useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);

  useEffect(() => {
    navigation.setOptions({ title: schemeName || "Scheme Details" });
  }, [navigation, schemeName]);

  const handleApply = useCallback(() => {
    if (!details?.officialUrl) {
      Alert.alert("Information", "The official website URL for this scheme is not available. Please visit your nearest government office.");
      return;
    }
    Linking.openURL(details.officialUrl).catch(() => {
      Alert.alert("Error", "Unable to open the official website. Please check your internet connection.");
    });
  }, [details]);

  if (isLoading) {
    return (
      <SafeAreaView style={s.container} edges={["top"]}>
        <View style={s.loadingContainer}>
          <ActivityIndicator color={Palette.primary} size="large" />
        </View>
      </SafeAreaView>
    );
  }

  if (error || !details) {
    return (
      <SafeAreaView style={s.container} edges={["top"]}>
        <View style={s.errorContainer}>
          <AlertCircle size={32} color={Palette.error} strokeWidth={1.5} />
          <Text style={s.errorText}>{error || "Scheme details not available."}</Text>
          <TouchableOpacity onPress={fetchDetails} style={s.retryBtn} activeOpacity={0.8}>
            <Text style={s.retryBtnText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.container} edges={["top"]}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={s.headerArea}>
          <View style={s.headerIconRow}>
            <View style={s.headerIconBox}>
              <Building2 size={24} color={Palette.primary} strokeWidth={2} />
            </View>
            <Text style={s.schemeName}>{details.name}</Text>
          </View>
          <View style={s.tagRow}>
            {details.category && (
              <View style={s.tagPrimary}>
                <Text style={s.tagPrimaryText}>{details.category}</Text>
              </View>
            )}
            {details.governmentLevel && (
              <View style={s.tagSecondary}>
                <Building2 size={11} color={Palette.secondary} strokeWidth={2} />
                <Text style={s.tagSecondaryText}>{details.governmentLevel}</Text>
              </View>
            )}
            {details.benefitAmount > 0 && (
              <View style={s.tagSuccess}>
                <Wallet size={11} color={Palette.success} strokeWidth={2} />
                <Text style={s.tagSuccessText}>{formatINR(details.benefitAmount)}</Text>
              </View>
            )}
          </View>
        </View>

        <SectionCard title="Overview" icon={<Info size={16} color={Palette.textSecondary} strokeWidth={2} />}>
          <Text style={s.bodyText}>
            {details.description || "No description available."}
          </Text>
        </SectionCard>

        <SectionCard title="Eligibility" icon={<CheckCircle2 size={16} color={Palette.textSecondary} strokeWidth={2} />}>
          <InfoRow icon={<Calendar size={16} color={Palette.textMuted} strokeWidth={2} />} label="Min Age" value={details.minAge ? String(details.minAge) : "N/A"} />
          <InfoRow icon={<Calendar size={16} color={Palette.textMuted} strokeWidth={2} />} label="Max Age" value={details.maxAge ? String(details.maxAge) : "N/A"} />
          <InfoRow icon={<IndianRupee size={16} color={Palette.textMuted} strokeWidth={2} />} label="Income Ceiling" value={details.maxIncome ? formatINR(details.maxIncome) : "N/A"} />
          {details.states.length > 0 && (
            <InfoRow icon={<MapPin size={16} color={Palette.textMuted} strokeWidth={2} />} label="States" value={details.states.join(", ")} />
          )}
          {details.stages.length > 0 && (
            <InfoRow icon={<Users size={16} color={Palette.textMuted} strokeWidth={2} />} label="Life Stages" value={details.stages.join(", ")} />
          )}
        </SectionCard>

        <SectionCard title="Benefits" icon={<Wallet size={16} color={Palette.textSecondary} strokeWidth={2} />}>
          <Text style={s.benefitAmount}>
            {details.benefitAmount > 0 ? formatINR(details.benefitAmount) : "Variable"}
          </Text>
          <Text style={s.bodyText}>Financial assistance provided under this scheme.</Text>
        </SectionCard>

        <SectionCard title="Required Documents" icon={<FileText size={16} color={Palette.textSecondary} strokeWidth={2} />}>
          {details.documents.length > 0 ? (
            details.documents.map((doc, i) => (
              <View key={doc.id || i} style={s.docRow}>
                <View style={s.docIconBox}>
                  <FileText size={14} color={Palette.primary} strokeWidth={2} />
                </View>
                <Text style={s.docName}>{doc.name}</Text>
              </View>
            ))
          ) : (
            <Text style={s.bodyText}>No specific documents listed.</Text>
          )}
        </SectionCard>

        <SectionCard title="Application Process" icon={<ListChecks size={16} color={Palette.textSecondary} strokeWidth={2} />}>
          <Text style={s.bodyText}>
            {"1. Gather all required documents listed above.\n2. Visit the official government portal using the button below.\n3. Create an account or log in on the portal.\n4. Fill in the application form and upload documents.\n5. Submit and note your application reference number."}
          </Text>
        </SectionCard>

        {details.officialUrl && (
          <SectionCard title="Official Website" icon={<Globe size={16} color={Palette.textSecondary} strokeWidth={2} />}>
            <Text style={s.urlText}>{details.officialUrl}</Text>
          </SectionCard>
        )}

        {/* Apply Button */}
        <View style={s.applyBtnWrap}>
          <TouchableOpacity onPress={handleApply} style={s.applyBtn} activeOpacity={0.8}>
            <ExternalLink size={18} color={Palette.white} strokeWidth={2.5} />
            <Text style={s.applyBtnText}>Apply on Official Government Website</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Palette.background },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  errorContainer: { flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 24, gap: 16 },
  errorText: { color: Palette.error, fontSize: 14, textAlign: "center" },
  retryBtn: { backgroundColor: Palette.primary, paddingHorizontal: 28, paddingVertical: 12, borderRadius: 14 },
  retryBtnText: { color: Palette.white, fontWeight: "700" },
  headerArea: { paddingHorizontal: 24, paddingTop: 24, paddingBottom: 20 },
  headerIconRow: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 12 },
  headerIconBox: {
    width: 48, height: 48, borderRadius: 14,
    backgroundColor: Palette.primaryA12, alignItems: "center", justifyContent: "center",
  },
  schemeName: { color: Palette.textPrimary, fontSize: 24, fontWeight: "800", lineHeight: 30, flex: 1 },
  tagRow: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  tagPrimary: { backgroundColor: Palette.primaryA18, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  tagPrimaryText: { color: Palette.primary, fontSize: 12, fontWeight: "600" },
  tagSecondary: {
    flexDirection: "row", alignItems: "center", gap: 4,
    backgroundColor: Palette.secondaryA0D, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4,
    borderWidth: 1, borderColor: Palette.secondaryA44,
  },
  tagSecondaryText: { color: Palette.secondary, fontSize: 12, fontWeight: "600" },
  tagSuccess: {
    flexDirection: "row", alignItems: "center", gap: 4,
    backgroundColor: Palette.successA18, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4,
    borderWidth: 1, borderColor: Palette.successA33,
  },
  tagSuccessText: { color: Palette.success, fontSize: 12, fontWeight: "700" },
  sectionWrap: { marginBottom: 16, marginHorizontal: 24 },
  sectionHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 10 },
  sectionTitle: {
    color: Palette.textSecondary, fontSize: 11, fontWeight: "700",
    letterSpacing: 1.5, textTransform: "uppercase",
  },
  sectionCard: {
    backgroundColor: Palette.surface, borderRadius: 16,
    borderWidth: 1, borderColor: Palette.border, padding: 16,
  },
  bodyText: { color: Palette.textSecondary, fontSize: 14, lineHeight: 22 },
  benefitAmount: { color: Palette.textPrimary, fontSize: 18, fontWeight: "700", marginBottom: 6 },
  infoRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 8 },
  infoLeft: { flexDirection: "row", alignItems: "center", gap: 8 },
  infoLabel: { color: Palette.textSecondary, fontSize: 14 },
  infoValue: { color: Palette.textPrimary, fontSize: 14, fontWeight: "600", textAlign: "right" },
  docRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 8 },
  docIconBox: {
    width: 28, height: 28, borderRadius: 8,
    backgroundColor: Palette.primaryA12, alignItems: "center", justifyContent: "center",
  },
  docName: { color: Palette.textPrimary, fontSize: 14, flex: 1 },
  urlText: { color: Palette.primary, fontSize: 14, fontWeight: "600" },
  applyBtnWrap: { paddingHorizontal: 24, marginTop: 8 },
  applyBtn: {
    flexDirection: "row", backgroundColor: Palette.primary,
    borderRadius: 14, paddingVertical: 16, alignItems: "center", justifyContent: "center", gap: 8,
  },
  applyBtnText: { color: Palette.white, fontSize: 15, fontWeight: "700" },
});
