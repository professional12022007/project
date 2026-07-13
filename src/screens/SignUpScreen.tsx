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
  Modal,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Shield, Eye, EyeOff, Sun, Moon, ChevronDown, Check, User, Briefcase } from 'lucide-react-native';
import { authService } from '@/lib/api/services/authService';
import { useAuthStore } from '@/store/authStore';
import { useThemeStore } from '@/store/themeStore';
import { useThemedStyles, usePalette } from '@/hooks/useThemedStyles';

interface Props {
  onBack: () => void;
}

const PROFESSIONS = [
  'Student', 'Government Employee', 'Private Employee', 'Teacher', 'Professor',
  'Doctor', 'Nurse', 'Engineer', 'Software Engineer', 'Farmer',
  'Business Owner', 'Entrepreneur', 'Self Employed', 'Daily Wage Worker',
  'Driver', 'Electrician', 'Mechanic', 'Plumber', 'Carpenter', 'Labourer',
  'Freelancer', 'Shop Owner', 'Vendor', 'Police', 'Army',
  'Lawyer', 'CA', 'Homemaker', 'Retired', 'Pensioner', 'Disabled',
  'Unemployed', 'Other',
];

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
  'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Chandigarh',
  'Puducherry', 'Andaman and Nicobar Islands', 'Dadra and Nagar Haveli and Daman and Diu',
  'Lakshadweep',
];

export function SignUpScreen({ onBack }: Props) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [age, setAge] = useState('');
  const [income, setIncome] = useState('');
  const [state, setState] = useState('');
  const [profession, setProfession] = useState('');
  const [showProfessionModal, setShowProfessionModal] = useState(false);
  const [showStateModal, setShowStateModal] = useState(false);
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
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingTop: 8,
    },
    backBtn: {
      paddingVertical: 8,
      paddingHorizontal: 14,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: p.border,
      backgroundColor: p.surface,
    },
    backText: {
      color: p.textSecondary,
      fontSize: 14,
      fontWeight: '600',
    },
    themeBtn: {
      padding: 10,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: p.border,
      backgroundColor: p.surface,
    },
    logoArea: {
      alignItems: 'center',
      paddingTop: 8,
      paddingBottom: 28,
    },
    logoCircle: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: p.primary,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 12,
    },
    brandName: {
      color: p.textPrimary,
      fontSize: 28,
      fontWeight: '800',
      marginBottom: 6,
    },
    tagline: {
      color: p.textSecondary,
      fontSize: 14,
    },
    card: {
      backgroundColor: p.surface,
      borderRadius: 24,
      borderWidth: 1,
      borderColor: p.border,
      padding: 24,
      marginBottom: 24,
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
    inputWithIcon: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: p.background,
      borderWidth: 1,
      borderColor: p.border,
      borderRadius: 14,
      paddingHorizontal: 16,
      paddingVertical: 14,
      gap: 10,
    },
    inputInline: {
      flex: 1,
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
    rowPair: {
      flexDirection: 'row',
    },
    dropdownBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: p.background,
      borderWidth: 1,
      borderColor: p.border,
      borderRadius: 14,
      paddingHorizontal: 16,
      paddingVertical: 14,
      gap: 10,
    },
    dropdownText: {
      color: p.textPrimary,
      fontSize: 16,
    },
    signupBtn: {
      backgroundColor: p.primary,
      borderRadius: 14,
      paddingVertical: 16,
      alignItems: 'center',
      marginTop: 8,
    },
    signupBtnDisabled: {
      opacity: 0.6,
    },
    signupBtnText: {
      color: p.white,
      fontSize: 16,
      fontWeight: '700',
    },
    footer: {
      color: p.textMuted,
      fontSize: 11,
      textAlign: 'center',
      lineHeight: 16,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'flex-end',
    },
    modalContent: {
      backgroundColor: p.surface,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      maxHeight: '70%',
      paddingBottom: 40,
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 20,
      borderBottomWidth: 1,
      borderBottomColor: p.border,
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: p.textPrimary,
    },
    modalClose: {
      color: p.primary,
      fontSize: 14,
      fontWeight: '600',
    },
    modalItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: p.border,
    },
    modalItemText: {
      color: p.textPrimary,
      fontSize: 15,
    },
  }));

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const handleSignUp = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      setError('Please fill in your name, email, and password.');
      return;
    }
    if (!state) {
      setError('Please select your state.');
      return;
    }
    if (!profession) {
      setError('Please select your profession.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await authService.register({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        age: age.trim(),
        income: income.trim(),
        state,
        profession,
      });
      setToken(response.token);
      setUser(response.user);
    } catch (err: any) {
      const msg =
        err?.response?.data?.error ??
        err?.message ??
        'Registration failed. Please try again.';
      setError(msg);
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
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onBack} style={styles.backBtn} activeOpacity={0.7}>
              <Text style={styles.backText}>Back</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={toggle} style={styles.themeBtn} activeOpacity={0.7}>
              {mode === 'dark' ? (
                <Sun size={18} color={palette.textSecondary} strokeWidth={2} />
              ) : (
                <Moon size={18} color={palette.textSecondary} strokeWidth={2} />
              )}
            </TouchableOpacity>
          </View>

          {/* Logo */}
          <Animated.View style={[styles.logoArea, { opacity: fadeAnim }]}>
            <View style={styles.logoCircle}>
              <Shield size={30} color={palette.white} strokeWidth={2.5} />
            </View>
            <Text style={styles.brandName}>BenefitOS</Text>
            <Text style={styles.tagline}>Create your account to get started</Text>
          </Animated.View>

          {/* Card */}
          <View style={styles.card}>
            {error ? (
              <View style={styles.errorBanner}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Full Name</Text>
              <View style={styles.inputWithIcon}>
                <User size={18} color={palette.textMuted} strokeWidth={2} />
                <TextInput
                  style={styles.inputInline}
                  value={name}
                  onChangeText={setName}
                  placeholder="Enter your full name"
                  placeholderTextColor={palette.textMuted}
                  returnKeyType="next"
                />
              </View>
            </View>

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

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Password</Text>
              <View style={styles.passwordRow}>
                <TextInput
                  style={[styles.input, { flex: 1, paddingRight: 48 }]}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="At least 6 characters"
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

            <View style={styles.rowPair}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                <Text style={styles.inputLabel}>Age</Text>
                <TextInput
                  style={styles.input}
                  value={age}
                  onChangeText={setAge}
                  placeholder="21"
                  placeholderTextColor={palette.textMuted}
                  keyboardType="numeric"
                  returnKeyType="next"
                />
              </View>
              <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                <Text style={styles.inputLabel}>Annual Income</Text>
                <TextInput
                  style={styles.input}
                  value={income}
                  onChangeText={setIncome}
                  placeholder="180000"
                  placeholderTextColor={palette.textMuted}
                  keyboardType="numeric"
                  returnKeyType="next"
                />
              </View>
            </View>

            {/* State dropdown */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>State</Text>
              <TouchableOpacity
                style={styles.dropdownBtn}
                onPress={() => setShowStateModal(true)}
                activeOpacity={0.7}
              >
                <Text style={[styles.dropdownText, !state && { color: palette.textMuted }]}>
                  {state || 'Select your state'}
                </Text>
                <ChevronDown size={18} color={palette.textSecondary} strokeWidth={2} />
              </TouchableOpacity>
            </View>

            {/* Profession dropdown */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Profession</Text>
              <TouchableOpacity
                style={styles.dropdownBtn}
                onPress={() => setShowProfessionModal(true)}
                activeOpacity={0.7}
              >
                <Briefcase size={18} color={palette.textMuted} strokeWidth={2} />
                <Text style={[styles.dropdownText, { flex: 1, marginLeft: 10 }, !profession && { color: palette.textMuted }]}>
                  {profession || 'Select your profession'}
                </Text>
                <ChevronDown size={18} color={palette.textSecondary} strokeWidth={2} />
              </TouchableOpacity>
            </View>

            {/* Sign up button */}
            <TouchableOpacity
              style={[styles.signupBtn, loading && styles.signupBtnDisabled]}
              onPress={handleSignUp}
              activeOpacity={0.85}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={palette.white} size="small" />
              ) : (
                <Text style={styles.signupBtnText}>Create Account</Text>
              )}
            </TouchableOpacity>
          </View>

          <Text style={styles.footer}>
            BenefitOS · Government Welfare Intelligence Platform
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Profession Modal */}
      <Modal visible={showProfessionModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Profession</Text>
              <TouchableOpacity onPress={() => setShowProfessionModal(false)}>
                <Text style={styles.modalClose}>Close</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={PROFESSIONS}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => {
                    setProfession(item);
                    setShowProfessionModal(false);
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={styles.modalItemText}>{item}</Text>
                  {profession === item && <Check size={18} color={palette.primary} strokeWidth={2.5} />}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>

      {/* State Modal */}
      <Modal visible={showStateModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select State</Text>
              <TouchableOpacity onPress={() => setShowStateModal(false)}>
                <Text style={styles.modalClose}>Close</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={INDIAN_STATES}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => {
                    setState(item);
                    setShowStateModal(false);
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={styles.modalItemText}>{item}</Text>
                  {state === item && <Check size={18} color={palette.primary} strokeWidth={2.5} />}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

