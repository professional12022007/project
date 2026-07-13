import React, { useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ChevronLeft, MapPin, TrendingUp, FileText, CircleCheck as CheckCircle2, Circle, Target, Award, Briefcase, GraduationCap, Heart, Hop as Home, Users, Baby, BriefcaseBusiness, ArrowRight } from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";
import type { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { useAuthStore } from "@/store/authStore";
import { useRoadmap } from "@/hooks/useRoadmap";
import { useThemedStyles, usePalette } from "@/hooks/useThemedStyles";
import type { BottomTabParamList } from "@/navigation/RootNavigator";
import { SkeletonLoader } from "@/components/ui/SkeletonLoader";

type NavProp = BottomTabNavigationProp<BottomTabParamList>;

interface Props {
  onBack?: () => void;
}

export function RoadmapScreen({ onBack }: Props) {
  const { user } = useAuthStore();
  const citizenId = user?.id ?? "citizen_101";
  const { data, isLoading, error, refetch } = useRoadmap(citizenId);
  const navigation = useNavigation<NavProp>();
  const palette = usePalette();

  const STAGE_ICONS: Record<string, { icon: React.ReactNode; color: string }> = {
    Student: { icon: <GraduationCap size={20} color={palette.primary} strokeWidth={2} />, color: palette.primary },
    Internship: { icon: <Briefcase size={20} color={palette.secondary} strokeWidth={2} />, color: palette.secondary },
    Graduate: { icon: <Award size={20} color={palette.success} strokeWidth={2} />, color: palette.success },
    Employment: { icon: <BriefcaseBusiness size={20} color={palette.primary} strokeWidth={2} />, color: palette.primary },
    Marriage: { icon: <Heart size={20} color={palette.error} strokeWidth={2} />, color: palette.error },
    Family: { icon: <Users size={20} color={palette.secondary} strokeWidth={2} />, color: palette.secondary },
    "Senior Citizen": { icon: <Home size={20} color={palette.amber} strokeWidth={2} />, color: palette.amber },
    "senior-citizen": { icon: <Home size={20} color={palette.amber} strokeWidth={2} />, color: palette.amber },
  };

  function getStageIcon(stage: string) {
    return STAGE_ICONS[stage] || { icon: <Circle size={20} color={palette.textMuted} strokeWidth={2} />, color: palette.textMuted };
  }

  const s = useThemedStyles((p) => StyleSheet.create({
    container: { flex: 1, backgroundColor: p.background },
    header: {
      flexDirection: "row", alignItems: "center",
      paddingHorizontal: 16, paddingTop: 12, paddingBottom: 16,
      borderBottomWidth: 1, borderBottomColor: p.border,
    },
    backBtn: { width: 40, paddingVertical: 4 },
    headerTitleRow: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
    title: { color: p.textPrimary, fontSize: 17, fontWeight: "700" },
    body: { padding: 20, paddingBottom: 60 },
    stageCard: {
      backgroundColor: p.surface,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: p.border,
      borderLeftWidth: 4,
      padding: 18,
      marginBottom: 8,
    },
    stageHeader: { flexDirection: "row", alignItems: "center", gap: 14 },
    stageIconBox: {
      width: 44, height: 44, borderRadius: 12,
      alignItems: "center", justifyContent: "center",
    },
    stageLabel: { fontSize: 11, fontWeight: "700", textTransform: "uppercase", color: p.textMuted, letterSpacing: 0.8, marginBottom: 4 },
    stageName: { fontSize: 18, fontWeight: "700", color: p.textPrimary },
    arrowRow: { alignItems: "center", paddingVertical: 8 },
    sectionTitle: {
      fontSize: 11, fontWeight: "700", textTransform: "uppercase",
      color: p.textMuted, letterSpacing: 0.8, marginTop: 24, marginBottom: 12,
    },
    card: {
      backgroundColor: p.surface, borderRadius: 20,
      borderWidth: 1, borderColor: p.border, overflow: "hidden",
    },
    oppRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 14, gap: 12 },
    oppIcon: { width: 32, height: 32, borderRadius: 8, backgroundColor: p.successA18, alignItems: "center", justifyContent: "center" },
    oppText: { flex: 1, fontSize: 14, color: p.textPrimary, fontWeight: "500" },
    actionRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 16, gap: 14 },
    actionIcon: { width: 36, height: 36, borderRadius: 10, backgroundColor: p.primaryA12, alignItems: "center", justifyContent: "center" },
    actionTitle: { fontSize: 15, fontWeight: "600", color: p.textPrimary, marginBottom: 3 },
    actionDesc: { fontSize: 12, color: p.textSecondary, lineHeight: 17 },
    progressRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 20, paddingVertical: 24 },
    progressStep: { alignItems: "center", gap: 8 },
    progressStepText: { fontSize: 12, fontWeight: "600", color: p.textSecondary, textAlign: "center" },
    progressLine: { flex: 1, height: 3, marginHorizontal: 12, borderRadius: 2 },
    errorCard: { alignItems: "center", paddingTop: 40, gap: 20 },
    errorText: { color: p.error, fontSize: 14, textAlign: "center" },
    retryBtn: { backgroundColor: p.primary, paddingHorizontal: 28, paddingVertical: 12, borderRadius: 14 },
    retryBtnText: { color: p.white, fontWeight: "700" },
    skeletonCard: {
      padding: 18, borderRadius: 20, backgroundColor: p.surface,
      borderWidth: 1, borderColor: p.border, gap: 8,
    },
  }));

  useEffect(() => {
    refetch();
  }, [refetch]);

  const currentStage = data?.currentStage ?? "Loading...";
  const nextStage = data?.nextStage ?? "N/A";
  const opportunities = data?.opportunities ?? [];

  const currentIcon = getStageIcon(currentStage);
  const nextIcon = getStageIcon(nextStage);

  return (
    <SafeAreaView style={s.container} edges={["top"]}>
      <View style={s.header}>
        {onBack && (
          <TouchableOpacity onPress={onBack} activeOpacity={0.7} style={s.backBtn}>
            <ChevronLeft size={22} color={palette.textSecondary} strokeWidth={2} />
          </TouchableOpacity>
        )}
        <View style={s.headerTitleRow}>
          <MapPin size={18} color={palette.textPrimary} strokeWidth={2} />
          <Text style={s.title}>Your Welfare Roadmap</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={s.body}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={palette.primary} />
        }
      >
        {isLoading && !data ? (
          <View style={{ gap: 16 }}>
            <View style={s.skeletonCard}>
              <SkeletonLoader height={20} width="40%" />
              <SkeletonLoader height={14} width="70%" />
            </View>
            <View style={s.skeletonCard}>
              <SkeletonLoader height={20} width="30%" />
              <SkeletonLoader height={14} width="60%" />
            </View>
          </View>
        ) : error ? (
          <View style={s.errorCard}>
            <Text style={s.errorText}>{error}</Text>
            <TouchableOpacity onPress={refetch} style={s.retryBtn}>
              <Text style={s.retryBtnText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* Current Stage Card */}
            <View style={[s.stageCard, { borderLeftColor: currentIcon.color }]}>
              <View style={s.stageHeader}>
                <View style={[s.stageIconBox, { backgroundColor: currentIcon.color + "22" }]}>
                  {currentIcon.icon}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.stageLabel}>Current Life Stage</Text>
                  <Text style={s.stageName}>{currentStage}</Text>
                </View>
              </View>
            </View>

            {/* Arrow */}
            <View style={s.arrowRow}>
              <ArrowRight size={24} color={palette.textMuted} strokeWidth={2} />
            </View>

            {/* Next Stage Card */}
            {nextStage && nextStage !== "Terminal State" && nextStage !== "N/A" ? (
              <View style={[s.stageCard, { borderLeftColor: nextIcon.color }]}>
                <View style={s.stageHeader}>
                  <View style={[s.stageIconBox, { backgroundColor: nextIcon.color + "22" }]}>
                    {nextIcon.icon}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={s.stageLabel}>Next Life Stage</Text>
                    <Text style={s.stageName}>{nextStage}</Text>
                  </View>
                </View>
              </View>
            ) : (
              <View style={[s.stageCard, { borderLeftColor: palette.textMuted }]}>
                <View style={s.stageHeader}>
                  <View style={[s.stageIconBox, { backgroundColor: palette.border }]}>
                    <CheckCircle2 size={20} color={palette.textMuted} strokeWidth={2} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={s.stageLabel}>Journey Complete</Text>
                    <Text style={s.stageName}>No further stages</Text>
                  </View>
                </View>
              </View>
            )}

            {/* Opportunities Section */}
            {opportunities.length > 0 && (
              <>
                <Text style={s.sectionTitle}>Upcoming Benefits at Next Stage</Text>
                <View style={s.card}>
                  {opportunities.map((opp, idx) => (
                    <View key={idx} style={[s.oppRow, idx < opportunities.length - 1 && { borderBottomWidth: 1, borderBottomColor: palette.border }]}>
                      <View style={s.oppIcon}>
                        <TrendingUp size={16} color={palette.success} strokeWidth={2} />
                      </View>
                      <Text style={s.oppText}>{opp}</Text>
                    </View>
                  ))}
                </View>
              </>
            )}

            {/* Recommended Actions */}
            <Text style={s.sectionTitle}>Recommended Actions</Text>
            <View style={s.card}>
              <TouchableOpacity
                style={[s.actionRow, { borderBottomWidth: 1, borderBottomColor: palette.border }]}
                onPress={() => navigation.navigate("Schemes")}
                activeOpacity={0.7}
              >
                <View style={s.actionIcon}>
                  <FileText size={18} color={palette.primary} strokeWidth={2} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.actionTitle}>View Eligible Schemes</Text>
                  <Text style={s.actionDesc}>Check schemes matched to your profile</Text>
                </View>
                <ArrowRight size={16} color={palette.textMuted} strokeWidth={2} />
              </TouchableOpacity>

              <TouchableOpacity
                style={[s.actionRow, { borderBottomWidth: 1, borderBottomColor: palette.border }]}
                onPress={() => navigation.navigate("Profile", { screen: "documents" })}
                activeOpacity={0.7}
              >
                <View style={s.actionIcon}>
                  <FileText size={18} color={palette.amber} strokeWidth={2} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.actionTitle}>Upload Documents</Text>
                  <Text style={s.actionDesc}>Prepare for upcoming stage eligibility</Text>
                </View>
                <ArrowRight size={16} color={palette.textMuted} strokeWidth={2} />
              </TouchableOpacity>

              <TouchableOpacity
                style={s.actionRow}
                onPress={() => navigation.navigate("Assistant")}
                activeOpacity={0.7}
              >
                <View style={s.actionIcon}>
                  <Target size={18} color={palette.secondary} strokeWidth={2} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.actionTitle}>Ask AI Assistant</Text>
                  <Text style={s.actionDesc}>Get personalized guidance for your next stage</Text>
                </View>
                <ArrowRight size={16} color={palette.textMuted} strokeWidth={2} />
              </TouchableOpacity>
            </View>

            {/* Progress Indicator */}
            <Text style={s.sectionTitle}>Journey Progress</Text>
            <View style={s.card}>
              <View style={s.progressRow}>
                <View style={s.progressStep}>
                  <CheckCircle2 size={24} color={palette.success} strokeWidth={2} />
                  <Text style={s.progressStepText}>{currentStage}</Text>
                </View>
                <View style={[s.progressLine, { backgroundColor: palette.primary }]} />
                <View style={s.progressStep}>
                  <Circle size={24} color={palette.primary} strokeWidth={2} />
                  <Text style={s.progressStepText}>{nextStage !== "Terminal State" ? nextStage : "Complete"}</Text>
                </View>
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

