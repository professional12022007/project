import React, { useState, useEffect } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Platform, View, Text, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as SecureStore from 'expo-secure-store';

import { HomeScreen } from '@/screens/HomeScreen';
import { ProfileScreen } from '@/screens/ProfileScreen';
import { RoadmapScreen } from '@/screens/RoadmapScreen';
import { AssistantScreen } from '@/screens/AssistantScreen';
import { SchemesScreen } from '@/screens/SchemesScreen';
import { SchemeDetailScreen } from '@/screens/SchemeDetailScreen';
import { LoginScreen } from '@/screens/LoginScreen';
import { SignUpScreen } from '@/screens/SignUpScreen';
import { TabBarIcon } from '@/components/navigation/TabBarIcon';
import { useAuthStore } from '@/store/authStore';
import { useThemeStore } from '@/store/themeStore';
import { authService } from '@/lib/api/services/authService';
import { usePalette } from '@/hooks/useThemedStyles';
import { Shield } from 'lucide-react-native';

export type SchemeStackParamList = {
  SchemesList: undefined;
  SchemeDetail: { schemeId: string; schemeName: string };
};

const SchemeStack = createNativeStackNavigator<SchemeStackParamList>();

function SchemesStackNavigator() {
  const palette = usePalette();
  return (
    <SchemeStack.Navigator screenOptions={{ headerShown: false }}>
      <SchemeStack.Screen name="SchemesList" component={SchemesScreen} />
      <SchemeStack.Screen
        name="SchemeDetail"
        component={SchemeDetailScreen}
        options={{ headerShown: true, headerTintColor: palette.textPrimary, headerStyle: { backgroundColor: palette.surface }, headerTitleStyle: { fontSize: 16, fontWeight: '700' } }}
      />
    </SchemeStack.Navigator>
  );
}

export type BottomTabParamList = {
  Home: undefined;
  Schemes: undefined;
  Profile: { screen?: 'account' | 'notifications' | 'privacy' | 'help' | 'about' | 'graph-visual' | 'documents' } | undefined;
  Roadmap: undefined;
  Assistant: undefined;
};

const Tab = createBottomTabNavigator<BottomTabParamList>();

function MainTabs() {
  const palette = usePalette();
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        // Hide the tab bar when the keyboard is open on Android.
        tabBarHideOnKeyboard: Platform.OS === 'android',
        tabBarStyle: {
          backgroundColor: palette.surface,
          borderTopColor: palette.border,
          borderTopWidth: 1,
          // Dynamically grow to accommodate the phone's gesture bar
          height: 56 + (insets.bottom > 0 ? insets.bottom : 12),
          paddingBottom: insets.bottom > 0 ? insets.bottom : 12,
          paddingTop: 8,
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarActiveTintColor: palette.primary,
        tabBarInactiveTintColor: palette.textMuted,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          letterSpacing: 0.3,
          marginTop: 2,
        },
        tabBarIcon: ({ focused, color, size }) => (
          <TabBarIcon routeName={route.name} focused={focused} color={color} size={size} />
        ),
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Schemes" component={SchemesStackNavigator} />
      <Tab.Screen name="Roadmap" component={RoadmapScreen} />
      <Tab.Screen name="Assistant" component={AssistantScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export function RootNavigator() {
  const palette = usePalette();
  const { isAuthenticated, setToken, setUser, logout } = useAuthStore();
  const { mode, init } = useThemeStore();
  const [sessionRestored, setSessionRestored] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);

  useEffect(() => {
    init();
  }, [init]);

  useEffect(() => {
    async function restore() {
      try {
        const storedToken = await SecureStore.getItemAsync('auth_token');
        const storedUser = await SecureStore.getItemAsync('auth_user');
        
        if (storedToken) {
          setToken(storedToken);
          if (storedUser) {
            try {
              setUser(JSON.parse(storedUser));
            } catch (e) {
              console.warn("Failed to parse stored user:", e);
            }
          }
          
          // Instantly boot if we have a token
          setSessionRestored(true);
          
          // Refresh user session in background
          try {
            const freshUser = await authService.getMe();
            setUser(freshUser);
          } catch (err: any) {
            console.log("[RootNavigator] Background profile sync skipped:", err.message);
            if (err.response?.status === 401 || err.response?.status === 403) {
              logout();
            }
          }
        } else {
          setSessionRestored(true);
        }
      } catch (err) {
        console.warn("Restoring token failed, clearing storage:", err);
        logout();
        setSessionRestored(true);
      }
    }
    restore();
  }, [setToken, setUser, logout]);

  if (!sessionRestored) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: palette.background, gap: 16 }}>
        <View style={{
          width: 64, height: 64, borderRadius: 32,
          backgroundColor: palette.primary,
          alignItems: 'center', justifyContent: 'center',
        }}>
          <Shield size={28} color={palette.white} strokeWidth={2.5} />
        </View>
        <Text style={{ color: palette.textPrimary, fontSize: 22, fontWeight: '800' }}>BenefitOS</Text>
        <ActivityIndicator color={palette.primary} size="small" />
      </View>
    );
  }

  if (!isAuthenticated) {
    if (showSignUp) {
      return <SignUpScreen onNavigateToLogin={() => setShowSignUp(false)} />;
    }
    return <LoginScreen onNavigateToSignUp={() => setShowSignUp(true)} />;
  }

  return <MainTabs />;
}
