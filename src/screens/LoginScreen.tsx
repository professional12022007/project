import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Animated,
  Easing,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Shield, Eye, EyeOff, Sun, Moon, CircleCheck as CheckCircle2, RefreshCw } from 'lucide-react-native';
import { authService } from '@/lib/api/services/authService';
import { useAuthStore } from '@/store/authStore';
import { useThemeStore } from '@/store/themeStore';
import { useThemedStyles, usePalette } from '@/hooks/useThemedStyles';

interface Props {
  onNavigateToSignUp: () => void;
}

function generateCaptcha() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = '';
  for (let i = 0; i < 5; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export function LoginScreen({ onNavigateToSignUp }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [captcha, setCaptcha] = useState(generateCaptcha());
  const [captchaInput, setCaptchaInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { setUser, setToken } = useAuthStore();
  const { mode, toggle } = useThemeStore();
  const palette = usePalette();
  const styles = useThemedStyles((p) => StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: p.background,
    },
    scroll: {
      flexGrow: 1,
      paddingHorizontal: 24,
      paddingBottom: 40,
    },
    themeToggleRow: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      paddingTop: 8,
    },
    themeBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingVertical: 8,
      paddingHorizontal: 14,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: p.border,
      backgroundColor: p.surface,
    },
    themeBtnText: {
      color: p.textSecondary,
      fontSize: 13,
      fontWeight: '600',
    },
    logoArea: {
      alignItems: 'center',
      paddingTop: 16,
      paddingBottom: 36,
    },
    logoCircle: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: p.primary,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 16,
    },
    brandName: {
      color: p.textPrimary,
      fontSize: 32,
      fontWeight: '800',
      letterSpacing: -0.5,
      marginBottom: 8,
    },
    tagline: {
      color: p.textSecondary,
      fontSize: 14,
      textAlign: 'center',
      lineHeight: 20,
    },
    card: {
      backgroundColor: p.surface,
      borderRadius: 24,
      borderWidth: 1,
      borderColor: p.border,
      padding: 24,
      marginBottom: 24,
    },
    cardTitle: {
      color: p.textPrimary,
      fontSize: 22,
      fontWeight: '700',
      marginBottom: 6,
    },
    cardSubtitle: {
      color: p.textSecondary,
      fontSize: 14,
      marginBottom: 24,
      lineHeight: 20,
    },
    errorBanner: {
      backgroundColor: p.errorA15,
      borderWidth: 1,
      borderColor: p.errorA40,
      borderRadius: 12,
      paddingHorizontal: 14,
      paddingVertical: 10,
      marginBottom: 20,
    },
    errorText: {
      color: p.error,
      fontSize: 13,
      lineHeight: 18,
    },
    inputGroup: {
      marginBottom: 16,
    },
    inputLabel: {
      color: p.textSecondary,
      fontSize: 12,
      fontWeight: '600',
      letterSpacing: 0.5,
      marginBottom: 8,
      textTransform: 'uppercase',
    },
    input: {
      backgroundColor: p.background,
      borderWidth: 1,
      borderColor: p.border,
      borderRadius: 14,
      paddingHorizontal: 16,
      paddingVertical: 14,
      color: p.textPrimary,
      fontSize: 16,
    },
    passwordRow: {
      position: 'relative',
    },
    eyeBtn: {
      position: 'absolute',
      right: 14,
      top: 0,
      bottom: 0,
      justifyContent: 'center',
      zIndex: 1,
    },
    captchaRow: {
      flexDirection: 'row',
      gap: 10,
      alignItems: 'center',
    },
    captchaBox: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      backgroundColor: p.background,
      borderWidth: 1,
      borderColor: p.border,
      borderRadius: 14,
      paddingHorizontal: 14,
      paddingVertical: 14,
    },
    captchaText: {
      fontSize: 20,
      fontWeight: '800',
      color: p.primary,
      letterSpacing: 4,
      fontStyle: 'italic',
    },
    loginBtn: {
      backgroundColor: p.primary,
      borderRadius: 14,
      paddingVertical: 16,
      alignItems: 'center',
      marginTop: 8,
    },
    loginBtnDisabled: {
      opacity: 0.6,
    },
    loginBtnContent: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    loginBtnText: {
      color: p.white,
      fontSize: 16,
      fontWeight: '700',
      letterSpacing: 0.3,
    },
    divider: {
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: 20,
    },
    dividerLine: {
      flex: 1,
      height: 1,
      backgroundColor: p.border,
    },
    dividerText: {
      color: p.textMuted,
      fontSize: 12,
      marginHorizontal: 12,
      fontWeight: '600',
    },
    signUpLink: {
      alignItems: 'center',
      paddingVertical: 16,
    },
    signUpLinkText: {
      color: p.textSecondary,
      fontSize: 14,
    },
    signUpLinkAccent: {
      color: p.primary,
      fontWeight: '700',
    },
    footer: {
      color: p.textMuted,
      fontSize: 11,
      textAlign: 'center',
      lineHeight: 16,
    },
  }));

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, scaleAnim]);

  const refreshCaptcha = () => {
    setCaptcha(generateCaptcha());
    setCaptchaInput('');
  };

  const handleLogin = async (overrideEmail?: string, overridePassword?: string) => {
    const loginEmail = overrideEmail ?? email.trim().toLowerCase();
    const loginPassword = overridePassword ?? password;

    if (!loginEmail || !loginPassword) {
      setError('Please enter your email and password.');
      return;
    }

    if (!overrideEmail && captchaInput.trim().toUpperCase() !== captcha.toUpperCase()) {
      setError('Captcha verification failed. Please try again.');
      refreshCaptcha();
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await authService.login({ email: loginEmail, password: loginPassword });
      setToken(response.token);
      setUser(response.user);
    } catch (err: any) {
      const msg =
        err?.response?.data?.error ??
        err?.message ??
        'Login failed. Check your credentials and try again.';
      setError(msg);
      refreshCaptcha();
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Theme toggle */}
          <View style={styles.themeToggleRow}>
            <TouchableOpacity
              onPress={toggle}
              style={styles.themeBtn}
              activeOpacity={0.7}
            >
              {mode === 'dark' ? (
                <Sun size={18} color={palette.textSecondary} strokeWidth={2} />
              ) : (
                <Moon size={18} color={palette.textSecondary} strokeWidth={2} />
              )}
              <Text style={styles.themeBtnText}>
                {mode === 'dark' ? 'Light Mode' : 'Dark Mode'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Logo / Brand */}
          <Animated.View
            style={[
              styles.logoArea,
              {
                opacity: fadeAnim,
                transform: [{ scale: scaleAnim }],
              },
            ]}
          >
            <View style={styles.logoCircle}>
              <Shield size={36} color={palette.white} strokeWidth={2.5} />
            </View>
            <Text style={styles.brandName}>BenefitOS</Text>
            <Text style={styles.tagline}>Your Government Benefits, Simplified</Text>
          </Animated.View>

          {/* Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Welcome back</Text>
            <Text style={styles.cardSubtitle}>Sign in to access your welfare dashboard</Text>

            {error ? (
              <View style={styles.errorBanner}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            {/* Email */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="you@example.com"
                placeholderTextColor={palette.textMuted}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                returnKeyType="next"
              />
            </View>

            {/* Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Password</Text>
              <View style={styles.passwordRow}>
                <TextInput
                  style={[styles.input, { flex: 1, paddingRight: 48 }]}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Enter your password"
                  placeholderTextColor={palette.textMuted}
                  secureTextEntry={!showPassword}
                  returnKeyType="next"
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeBtn}
                  activeOpacity={0.7}
                >
                  {showPassword ? (
                    <EyeOff size={20} color={palette.textSecondary} strokeWidth={2} />
                  ) : (
                    <Eye size={20} color={palette.textSecondary} strokeWidth={2} />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* Captcha */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Captcha Verification</Text>
              <View style={styles.captchaRow}>
                <View style={styles.captchaBox}>
                  <Text style={styles.captchaText}>{captcha}</Text>
                  <TouchableOpacity onPress={refreshCaptcha} activeOpacity={0.7}>
                    <RefreshCw size={16} color={palette.textSecondary} strokeWidth={2} />
                  </TouchableOpacity>
                </View>
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  value={captchaInput}
                  onChangeText={setCaptchaInput}
                  placeholder="Enter captcha"
                  placeholderTextColor={palette.textMuted}
                  autoCapitalize="characters"
                  autoCorrect={false}
                  returnKeyType="done"
                />
              </View>
            </View>

            {/* Login button */}
            <TouchableOpacity
              style={[styles.loginBtn, loading && styles.loginBtnDisabled]}
              onPress={() => handleLogin()}
              activeOpacity={0.85}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={palette.white} size="small" />
              ) : (
                <View style={styles.loginBtnContent}>
                  <CheckCircle2 size={18} color={palette.white} strokeWidth={2.5} />
                  <Text style={styles.loginBtnText}>Sign In</Text>
                </View>
              )}
            </TouchableOpacity>

            {/* Sign up link */}
            <TouchableOpacity
              style={styles.signUpLink}
              onPress={onNavigateToSignUp}
              activeOpacity={0.7}
              disabled={loading}
            >
              <Text style={styles.signUpLinkText}>
                Don&apos;t have an account?{' '}
                <Text style={styles.signUpLinkAccent}>Sign up</Text>
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.footer}>
            BenefitOS · Government Welfare Intelligence Platform
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
