import React, { useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { Bell, Map as MapIcon, MessageSquare, Landmark, Upload, TrendingUp, FileText, ChevronRight, Sun, Moon, Wallet, CircleCheck as CheckCircle2, Clock } from 'lucide-react-native';
import { useAuthStore } from '@/store/authStore';
import { useThemeStore } from '@/store/themeStore';
import { useWelfareScore } from '@/hooks/useWelfareScore';
import { useMissedBenefits } from '@/hooks/useMissedBenefits';
import { Palette } from '@/constants/theme';
import { WelfareScoreCard } from '@/components/ui/WelfareScoreCard';
import { MissedBenefitsSection } from '@/components/ui/MissedBenefitsSection';
import { SkeletonLoader } from '@/components/ui/SkeletonLoader';
import type { BottomTabParamList } from '@/navigation/RootNavigator';

type NavProp = BottomTabNavigationProp<BottomTabParamList>;

const CITIZEN_ID_FALLBACK = 'citizen_101';

export function HomeScreen() {
  const { user } = useAuthStore();
  const { mode, toggle } = useThemeStore();
  const citizenId = user?.id ?? CITIZEN_ID_FALLBACK;
  const { data: welfareData, isLoading: welfareLoading, refetch: refetchWelfare } = useWelfareScore(citizenId);
  const { data: missedData, isLoading: missedLoading, refetch: refetchMissed } = useMissedBenefits(citizenId);
  const navigation = useNavigation<NavProp>();

  useFocusEffect(
    useCallback(() => {
      refetchWelfare();
      refetchMissed();
    }, [refetchWelfare, refetchMissed])
  );

  const missedSchemes = missedData?.missedSchemes ?? [];
  const unreadCount = 3;

  const quickActions = [
    { title: 'Roadmap', desc: 'View your future welfare journey', icon: <MapIcon size={22} color={Palette.primary} strokeWidth={2} />, onPress: () => navigation.navigate('Roadmap') },
    { title: 'Assistant', desc: 'Ask questions about your schemes', icon: <MessageSquare size={22} color={Palette.primary} strokeWidth={2} />, onPress: () => navigation.navigate('Assistant') },
    { title: 'Schemes', desc: 'View matched schemes', icon: <Landmark size={22} color={Palette.primary} strokeWidth={2} />, onPress: () => navigation.navigate('Schemes') },
    { title: 'Upload Documents', desc: 'Complete verification', icon: <Upload size={22} color={Palette.primary} strokeWidth={2} />, onPress: () => navigation.navigate('Profile', { screen: 'documents' }) },
  ];

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={welfareLoading} onRefresh={refetchWelfare} tintColor={Palette.primary} />}
      >
        {/* Header */}
        <View style={s.header}>
          <View>
            <Text style={s.greeting}>Welcome back,</Text>
            <Text style={s.userName}>{user?.name ?? 'Citizen'}</Text>
          </View>
          <View style={s.headerRight}>
            <TouchableOpacity onPress={toggle} style={s.themeBtn} activeOpacity={0.7}>
              {mode === 'dark' ? (
                <Sun size={18} color={Palette.textSecondary} strokeWidth={2} />
              ) : (
                <Moon size={18} color={Palette.textSecondary} strokeWidth={2} />
              )}
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => navigation.navigate('Profile', { screen: 'notifications' })}
              style={s.bellBtn}
              activeOpacity={0.7}
            >
              <Bell size={18} color={Palette.textPrimary} strokeWidth={2} />
              {unreadCount > 0 && <View style={s.bellDot} />}
            </TouchableOpacity>
          </View>
        </View>

        {/* Welfare Score */}
        <View style={{ paddingHorizontal: 24, marginBottom: 20 }}>
          {welfareLoading && !welfareData ? (
            <View style={s.skeletonCard}>
              <SkeletonLoader height={20} width="50%" />
              <SkeletonLoader height={14} width="80%" />
            </View>
          ) : (
            <WelfareScoreCard
              score={welfareData?.score ?? 0}
              currentBenefits={welfareData?.currentBenefits ?? 0}
              potentialBenefits={welfareData?.potentialBenefits ?? 0}
            />
          )}
        </View>

        {/* Summary Cards */}
        <View style={s.summaryRow}>
          <View style={s.summaryCard}>
            <Wallet size={18} color={Palette.success} strokeWidth={2} />
            <Text style={s.summaryValue}>
              {'\u20B9'}{(welfareData?.currentBenefits ?? 0).toLocaleString('en-IN')}
            </Text>
            <Text style={s.summaryLabel}>Current Benefits</Text>
          </View>
          <View style={s.summaryCard}>
            <TrendingUp size={18} color={Palette.primary} strokeWidth={2} />
            <Text style={s.summaryValue}>
              {'\u20B9'}{(welfareData?.potentialBenefits ?? 0).toLocaleString('en-IN')}
            </Text>
            <Text style={s.summaryLabel}>Potential Benefits</Text>
          </View>
        </View>

        <View style={s.summaryRow}>
          <View style={s.summaryCard}>
            <Landmark size={18} color={Palette.secondary} strokeWidth={2} />
            <Text style={s.summaryValue}>{missedSchemes.length}</Text>
            <Text style={s.summaryLabel}>Eligible Schemes</Text>
          </View>
          <View style={s.summaryCard}>
            <CheckCircle2 size={18} color={Palette.success} strokeWidth={2} />
            <Text style={s.summaryValue}>0</Text>
            <Text style={s.summaryLabel}>Claimed Schemes</Text>
          </View>
        </View>

        {/* Missed Benefits Section */}
        {missedLoading ? (
          <View style={{ paddingHorizontal: 24, marginBottom: 20 }}>
            <View style={s.skeletonCard}>
              <SkeletonLoader height={18} width="40%" />
              <SkeletonLoader height={14} width="70%" />
            </View>
          </View>
        ) : (
          <MissedBenefitsSection schemes={missedSchemes} isLoading={missedLoading} error={null} />
        )}

        {/* Quick Actions */}
        <Text style={s.sectionTitle}>Quick Actions</Text>
        <View style={s.quickActionsGrid}>
          {quickActions.map((action) => (
            <TouchableOpacity
              key={action.title}
              style={s.quickActionCard}
              activeOpacity={0.78}
              onPress={action.onPress}
            >
              <View style={s.quickActionIconBox}>
                {action.icon}
              </View>
              <Text style={s.quickActionTitle}>{action.title}</Text>
              <Text style={s.quickActionDesc}>{action.desc}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Palette.background },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 24, paddingTop: 16, paddingBottom: 20,
  },
  greeting: { color: Palette.textSecondary, fontSize: 13, marginBottom: 2 },
  userName: { color: Palette.textPrimary, fontSize: 22, fontWeight: '700' },
  headerRight: { flexDirection: 'row', gap: 10 },
  themeBtn: {
    padding: 10, borderRadius: 20, borderWidth: 1,
    borderColor: Palette.border, backgroundColor: Palette.surface,
  },
  bellBtn: {
    padding: 10, borderRadius: 20, borderWidth: 1,
    borderColor: Palette.border, backgroundColor: Palette.surface,
  },
  bellDot: {
    position: 'absolute', top: 8, right: 8,
    width: 8, height: 8, borderRadius: 4, backgroundColor: Palette.error,
  },
  summaryRow: { flexDirection: 'row', gap: 12, paddingHorizontal: 24, marginBottom: 12 },
  summaryCard: {
    flex: 1, borderRadius: 16, backgroundColor: Palette.surface,
    borderWidth: 1, borderColor: Palette.border,
    padding: 16, gap: 6,
  },
  summaryValue: { color: Palette.textPrimary, fontSize: 18, fontWeight: '800' },
  summaryLabel: { color: Palette.textMuted, fontSize: 12 },
  sectionTitle: {
    color: Palette.textSecondary, fontSize: 11, fontWeight: '700',
    letterSpacing: 1.5, textTransform: 'uppercase',
    paddingHorizontal: 24, marginTop: 24, marginBottom: 14,
  },
  quickActionsGrid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 12, paddingHorizontal: 24,
  },
  quickActionCard: {
    width: '48%', borderRadius: 16, backgroundColor: Palette.surface,
    borderWidth: 1, borderColor: Palette.border, padding: 16,
    alignItems: 'center', gap: 8,
  },
  quickActionIconBox: {
    width: 44, height: 44, borderRadius: 12,
    backgroundColor: Palette.primaryA12, alignItems: 'center', justifyContent: 'center',
  },
  quickActionTitle: { color: Palette.textPrimary, fontSize: 14, fontWeight: '700' },
  quickActionDesc: { color: Palette.textMuted, fontSize: 11, textAlign: 'center', lineHeight: 15 },
  skeletonCard: {
    padding: 18, borderRadius: 20, backgroundColor: Palette.surface,
    borderWidth: 1, borderColor: Palette.border, gap: 8,
  },
});
