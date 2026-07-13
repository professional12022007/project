import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { Settings, Bell, FileText, Shield, Network, Circle as HelpCircle, Info, ChevronRight, Landmark, Map as MapIcon, Share2, LogOut, Sun, Moon } from 'lucide-react-native';
import { BottomTabParamList } from '@/navigation/RootNavigator';
import { useAuthStore } from '@/store/authStore';
import { useThemeStore } from '@/store/themeStore';
import { useThemedStyles, usePalette } from '@/hooks/useThemedStyles';

import { AccountSettingsScreen } from '@/screens/profile/AccountSettingsScreen';
import { NotificationsScreen } from '@/screens/profile/NotificationsScreen';
import { PrivacySecurityScreen } from '@/screens/profile/PrivacySecurityScreen';
import { HelpSupportScreen } from '@/screens/profile/HelpSupportScreen';
import { AboutScreen } from '@/screens/profile/AboutScreen';
import { GraphVisualizer } from '@/screens/profile/GraphVisualizer';
import { MyDocumentsScreen } from '@/screens/profile/MyDocumentsScreen';

type SubScreen = 'account' | 'notifications' | 'privacy' | 'help' | 'about' | 'graph-visual' | 'documents' | null;

type ProfileRouteProp = RouteProp<BottomTabParamList, 'Profile'>;
type ProfileNavProp = BottomTabNavigationProp<BottomTabParamList, 'Profile'>;

export function ProfileScreen() {
  const { user, logout } = useAuthStore();
  const { mode, toggle } = useThemeStore();
  const palette = usePalette();
  const [activeScreen, setActiveScreen] = useState<SubScreen>(null);
  const route = useRoute<ProfileRouteProp>();
  const navigation = useNavigation<ProfileNavProp>();

  const MENU_ITEMS: { label: string; icon: React.ReactNode; screen: SubScreen }[] = [
    { label: 'Account Settings', icon: <Settings size={20} color={palette.primary} strokeWidth={2} />, screen: 'account' },
    { label: 'Notifications', icon: <Bell size={20} color={palette.primary} strokeWidth={2} />, screen: 'notifications' },
    { label: 'My Documents', icon: <FileText size={20} color={palette.primary} strokeWidth={2} />, screen: 'documents' },
    { label: 'Privacy & Security', icon: <Shield size={20} color={palette.primary} strokeWidth={2} />, screen: 'privacy' },
    { label: 'My Welfare Network', icon: <Network size={20} color={palette.primary} strokeWidth={2} />, screen: 'graph-visual' },
    { label: 'Help & Support', icon: <HelpCircle size={20} color={palette.primary} strokeWidth={2} />, screen: 'help' },
    { label: 'About', icon: <Info size={20} color={palette.primary} strokeWidth={2} />, screen: 'about' },
  ];

  const s = useThemedStyles((p) => StyleSheet.create({
    container: { flex: 1, backgroundColor: p.background },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, paddingTop: 16, paddingBottom: 8 },
    pageTitle: { color: p.textPrimary, fontSize: 30, fontWeight: '800' },
    themeBtn: {
      padding: 10, borderRadius: 20, borderWidth: 1,
      borderColor: p.border, backgroundColor: p.surface,
    },
    avatarArea: { alignItems: 'center', paddingVertical: 32 },
    avatarCircle: {
      width: 96, height: 96, borderRadius: 48,
      backgroundColor: p.primary,
      alignItems: 'center', justifyContent: 'center', marginBottom: 16,
    },
    avatarText: { color: p.white, fontSize: 36, fontWeight: '800' },
    userName: { color: p.textPrimary, fontSize: 22, fontWeight: '700', marginBottom: 4 },
    userEmail: { color: p.textSecondary, fontSize: 14, marginBottom: 4 },
    userProfession: { color: p.textMuted, fontSize: 13, marginBottom: 12 },
    memberBadge: {
      paddingHorizontal: 14, paddingVertical: 4, borderRadius: 20,
      backgroundColor: p.primaryA18, borderWidth: 1, borderColor: p.primaryA33,
    },
    memberBadgeText: { color: p.primary, fontSize: 12, fontWeight: '600' },
    statsRow: { flexDirection: 'row', gap: 12, marginHorizontal: 24, marginBottom: 32 },
    statCard: {
      flex: 1, borderRadius: 16, backgroundColor: p.surface,
      borderWidth: 1, borderColor: p.border,
      padding: 16, alignItems: 'center', gap: 6,
    },
    statValue: { color: p.primary, fontSize: 18, fontWeight: '800' },
    statLabel: { color: p.textMuted, fontSize: 12 },
    menuCard: {
      marginHorizontal: 24, borderRadius: 20, backgroundColor: p.surface,
      borderWidth: 1, borderColor: p.border, overflow: 'hidden',
    },
    menuRow: {
      flexDirection: 'row', alignItems: 'center',
      paddingHorizontal: 16, paddingVertical: 16, gap: 14,
    },
    menuIconBox: {
      width: 36, height: 36, borderRadius: 10,
      backgroundColor: p.primaryA12, alignItems: 'center', justifyContent: 'center',
    },
    menuLabel: { flex: 1, color: p.textPrimary, fontSize: 15, fontWeight: '500' },
    logoutBtn: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
      marginHorizontal: 24, marginTop: 16,
      borderRadius: 14, paddingVertical: 14,
      backgroundColor: p.errorA15, borderWidth: 1, borderColor: p.errorA40,
    },
    logoutText: { color: p.error, fontSize: 15, fontWeight: '700' },
  }));

  useEffect(() => {
    if (route.params?.screen) {
      const screenParam = route.params.screen;
      Promise.resolve().then(() => {
        setActiveScreen(screenParam);
        navigation.setParams({ screen: undefined });
      });
    }
  }, [route.params?.screen, navigation]);

  if (activeScreen === 'account') return <AccountSettingsScreen onBack={() => setActiveScreen(null)} />;
  if (activeScreen === 'notifications') return <NotificationsScreen onBack={() => setActiveScreen(null)} />;
  if (activeScreen === 'privacy') return <PrivacySecurityScreen onBack={() => setActiveScreen(null)} />;
  if (activeScreen === 'help') return <HelpSupportScreen onBack={() => setActiveScreen(null)} />;
  if (activeScreen === 'about') return <AboutScreen onBack={() => setActiveScreen(null)} />;
  if (activeScreen === 'graph-visual') return <GraphVisualizer onBack={() => setActiveScreen(null)} />;
  if (activeScreen === 'documents') return <MyDocumentsScreen onBack={() => setActiveScreen(null)} />;

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={s.header}>
          <Text style={s.pageTitle}>Profile</Text>
          <TouchableOpacity onPress={toggle} style={s.themeBtn} activeOpacity={0.7}>
            {mode === 'dark' ? (
              <Sun size={18} color={palette.textSecondary} strokeWidth={2} />
            ) : (
              <Moon size={18} color={palette.textSecondary} strokeWidth={2} />
            )}
          </TouchableOpacity>
        </View>

        <View style={s.avatarArea}>
          <View style={s.avatarCircle}>
            <Text style={s.avatarText}>
              {user?.name?.charAt(0)?.toUpperCase() ?? 'U'}
            </Text>
          </View>
          <Text style={s.userName}>{user?.name ?? 'User Name'}</Text>
          <Text style={s.userEmail}>{user?.email ?? 'user@example.com'}</Text>
          {user?.profession && (
            <Text style={s.userProfession}>{user.profession}</Text>
          )}
          <View style={s.memberBadge}>
            <Text style={s.memberBadgeText}>BenefitOS Member</Text>
          </View>
        </View>

        <View style={s.statsRow}>
          {[
            { label: 'Schemes', value: '0', icon: <Landmark size={16} color={palette.primary} strokeWidth={2} />, onPress: () => navigation.navigate('Schemes') },
            { label: 'Roadmap', value: '5', icon: <MapIcon size={16} color={palette.primary} strokeWidth={2} />, onPress: () => navigation.navigate('Roadmap') },
            { label: 'Graph', value: 'View', icon: <Network size={16} color={palette.primary} strokeWidth={2} />, onPress: () => setActiveScreen('graph-visual') },
          ].map((stat) => (
            <TouchableOpacity
              key={stat.label}
              style={s.statCard}
              activeOpacity={0.7}
              onPress={stat.onPress}
            >
              {stat.icon}
              <Text style={s.statValue}>{stat.value}</Text>
              <Text style={s.statLabel}>{stat.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={s.menuCard}>
          {MENU_ITEMS.map((item, idx) => (
            <TouchableOpacity
              key={item.label}
              style={[s.menuRow, idx < MENU_ITEMS.length - 1 && { borderBottomWidth: 1, borderBottomColor: palette.border }]}
              activeOpacity={0.7}
              onPress={() => setActiveScreen(item.screen)}
            >
              <View style={s.menuIconBox}>{item.icon}</View>
              <Text style={s.menuLabel}>{item.label}</Text>
              <ChevronRight size={18} color={palette.textMuted} strokeWidth={2} />
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={s.logoutBtn} onPress={logout} activeOpacity={0.8}>
          <LogOut size={18} color={palette.error} strokeWidth={2} />
          <Text style={s.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

