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
import { Palette } from '@/constants/theme';

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

  const handleDemoLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await authService.login({
        email: 'rajesh@benefitos.dev',
        password: 'password123',
      });
      setToken(response.token);
      setUser(response.user);
    } catch {
      try {
        const regResponse = await authService.register({
          name: 'Rajesh Kumar',
          email: 'rajesh@benefitos.dev',
          password: 'password123',
          age: '21',
          income: '180000',
          state: 'Uttar Pradesh',
          profession: 'Student',
        });
        setToken(regResponse.token);
        setUser(regResponse.user);
      } catch (regErr: any) {
        const msg =
          regErr?.response?.data?.error ??
          regErr?.message ??
          'Demo access failed. Please try signing up manually.';
        setError(msg);
      }
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
                <Sun size={18} color={Palette.textSecondary} strokeWidth={2} />
              ) : (
                <Moon size={18} color={Palette.textSecondary} strokeWidth={2} />
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
              <Shield size={36} color={Palette.white} strokeWidth={2.5} />
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
                placeholderTextColor={Palette.textMuted}
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
                  placeholderTextColor={Palette.textMuted}
                  secureTextEntry={!showPassword}
                  returnKeyType="next"
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeBtn}
                  activeOpacity={0.7}
                >
                  {showPassword ? (
                    <EyeOff size={20} color={Palette.textSecondary} strokeWidth={2} />
                  ) : (
                    <Eye size={20} color={Palette.textSecondary} strokeWidth={2} />
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
                    <RefreshCw size={16} color={Palette.textSecondary} strokeWidth={2} />
                  </TouchableOpacity>
                </View>
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  value={captchaInput}
                  onChangeText={setCaptchaInput}
                  placeholder="Enter captcha"
                  placeholderTextColor={Palette.textMuted}
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
                <ActivityIndicator color={Palette.white} size="small" />
              ) : (
                <View style={styles.loginBtnContent}>
                  <CheckCircle2 size={18} color={Palette.white} strokeWidth={2.5} />
                  <Text style={styles.loginBtnText}>Sign In</Text>
                </View>
              )}
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Demo shortcut */}
            <TouchableOpacity
              style={styles.demoBtn}
              onPress={handleDemoLogin}
              activeOpacity={0.8}
              disabled={loading}
            >
              <Text style={styles.demoBtnText}>Continue as Rajesh Kumar</Text>
              <Text style={styles.demoBtnSub}>Demo account — instant access</Text>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Palette.background,
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
    borderColor: Palette.border,
    backgroundColor: Palette.surface,
  },
  themeBtnText: {
    color: Palette.textSecondary,
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
    backgroundColor: Palette.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  brandName: {
    color: Palette.textPrimary,
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  tagline: {
    color: Palette.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  card: {
    backgroundColor: Palette.surface,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: Palette.border,
    padding: 24,
    marginBottom: 24,
  },
  cardTitle: {
    color: Palette.textPrimary,
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 6,
  },
  cardSubtitle: {
    color: Palette.textSecondary,
    fontSize: 14,
    marginBottom: 24,
    lineHeight: 20,
  },
  errorBanner: {
    backgroundColor: Palette.errorA15,
    borderWidth: 1,
    borderColor: Palette.errorA40,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 20,
  },
  errorText: {
    color: Palette.error,
    fontSize: 13,
    lineHeight: 18,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    color: Palette.textSecondary,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  input: {
    backgroundColor: Palette.background,
    borderWidth: 1,
    borderColor: Palette.border,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: Palette.textPrimary,
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
    backgroundColor: Palette.background,
    borderWidth: 1,
    borderColor: Palette.border,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  captchaText: {
    fontSize: 20,
    fontWeight: '800',
    color: Palette.primary,
    letterSpacing: 4,
    fontStyle: 'italic',
  },
  loginBtn: {
    backgroundColor: Palette.primary,
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
    color: Palette.white,
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
    backgroundColor: Palette.border,
  },
  dividerText: {
    color: Palette.textMuted,
    fontSize: 12,
    marginHorizontal: 12,
    fontWeight: '600',
  },
  demoBtn: {
    backgroundColor: Palette.primaryA12,
    borderWidth: 1,
    borderColor: Palette.primaryA44,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginBottom: 4,
  },
  demoBtnText: {
    color: Palette.primary,
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  demoBtnSub: {
    color: Palette.textMuted,
    fontSize: 12,
  },
  signUpLink: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  signUpLinkText: {
    color: Palette.textSecondary,
    fontSize: 14,
  },
  signUpLinkAccent: {
    color: Palette.primary,
    fontWeight: '700',
  },
  footer: {
    color: Palette.textMuted,
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 16,
  },
});
