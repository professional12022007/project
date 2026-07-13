import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ActivityIndicator,
  ScrollView, StyleSheet, Alert, BackHandler
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemedStyles, usePalette } from '@/hooks/useThemedStyles';
import { ChevronLeft } from 'lucide-react-native';
import { authService } from '@/lib/api/services/authService';

interface Props { onBack: () => void; }

export function PrivacySecurityScreen({ onBack }: Props) {
  const palette = usePalette();
  const [oldPw, setOldPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const onBackPress = () => {
      onBack();
      return true;
    };
    const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => {
      subscription.remove();
    };
  }, [onBack]);

  const handleChangePassword = async () => {
    if (!oldPw || !newPw || !confirmPw) {
      Alert.alert('Error', 'Please fill in all fields.'); return;
    }
    if (newPw !== confirmPw) {
      Alert.alert('Error', 'New passwords do not match.'); return;
    }
    if (newPw.length < 6) {
      Alert.alert('Error', 'New password must be at least 6 characters.'); return;
    }
    setSaving(true);
    try {
      await authService.changePassword(oldPw, newPw);
      setOldPw(''); setNewPw(''); setConfirmPw('');
      Alert.alert('Success', 'Your password has been changed successfully.', [{ text: 'OK' }]);
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.error ?? 'Failed to change password.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      <View style={s.header}>
        <TouchableOpacity onPress={onBack} activeOpacity={0.7} style={s.backBtn}>
          <ChevronLeft size={22} color={palette.textSecondary} strokeWidth={2} />
        </TouchableOpacity>
        <Text style={s.title}>Privacy & Security</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={s.body} showsVerticalScrollIndicator={false}>
        {/* Change Password */}
        <Text style={s.sectionHeader}>Change Password</Text>
        <View style={s.card}>
          {[
            { label: 'Current Password', val: oldPw, set: setOldPw, placeholder: '••••••••' },
            { label: 'New Password', val: newPw, set: setNewPw, placeholder: 'Minimum 6 characters' },
            { label: 'Confirm New Password', val: confirmPw, set: setConfirmPw, placeholder: '••••••••' },
          ].map((f, i) => (
            <View key={f.label} style={i < 2 ? s.inputGroup : s.inputGroupLast}>
              <Text style={s.inputLabel}>{f.label}</Text>
              <TextInput
                style={s.input}
                value={f.val}
                onChangeText={f.set}
                placeholder={f.placeholder}
                placeholderTextColor={palette.textMuted}
                secureTextEntry
                returnKeyType={i < 2 ? 'next' : 'done'}
                onSubmitEditing={i === 2 ? handleChangePassword : undefined}
              />
            </View>
          ))}

          <TouchableOpacity
            style={[s.saveBtn, saving && s.btnDisabled]}
            onPress={handleChangePassword}
            disabled={saving}
            activeOpacity={0.85}
          >
            {saving
              ? <ActivityIndicator color={palette.white} size="small" />
              : <Text style={s.saveBtnText}>Update Password</Text>}
          </TouchableOpacity>
        </View>

        {/* What data we store */}
        <Text style={s.sectionHeader}>What Data We Store</Text>
        <View style={s.card}>
          <Text style={s.privacyText}>
            BenefitOS stores the following data about you in a secure
            own self-managed instance:{'\n\n'}
            {'• '}Name, email address, and a bcrypt-hashed password{'\n'}
            {'• '}Age, annual income bracket, and home state{'\n'}
            {'• '}Life stage (e.g. Student, Farmer, Senior Citizen){'\n'}
            {'• '}Names of documents you have marked as available{'\n'}
            {'• '}Family relationships, if you belong to a household group{'\n\n'}
            We do not sell your data to any third parties. We do not collect
            device identifiers, location, or usage analytics. All data is used
            solely to match you with relevant government welfare schemes.{'\n\n'}
            There is no client-side encryption of stored data at this time. Your
            data security depends on the security of your backend deployment.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

  const s = useThemedStyles((p) => StyleSheet.create({
    container: { flex: 1, backgroundColor: p.background },
    header: {
      flexDirection: 'row', alignItems: 'center',
      paddingHorizontal: 16, paddingTop: 12, paddingBottom: 16,
      borderBottomWidth: 1, borderBottomColor: p.border,
    },
    backBtn: { width: 40, paddingVertical: 4 },
    title: { flex: 1, textAlign: 'center', color: p.textPrimary, fontSize: 17, fontWeight: '700' },
    body: { padding: 24, paddingBottom: 48 },
    sectionHeader: {
      color: p.textSecondary, fontSize: 13, fontWeight: '700',
      letterSpacing: 0.5, marginBottom: 12, marginTop: 8,
    },
    card: {
      backgroundColor: p.surface, borderRadius: 20,
      borderWidth: 1, borderColor: p.border,
      padding: 20, marginBottom: 24,
    },
    inputGroup: { marginBottom: 16 },
    inputGroupLast: { marginBottom: 20 },
    inputLabel: {
      color: p.textMuted, fontSize: 11, fontWeight: '700',
      letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8,
    },
    input: {
      backgroundColor: p.background, borderWidth: 1,
      borderColor: p.border, borderRadius: 14,
      paddingHorizontal: 16, paddingVertical: 13,
      color: p.textPrimary, fontSize: 15,
    },
    saveBtn: {
      backgroundColor: p.primary, borderRadius: 14,
      paddingVertical: 14, alignItems: 'center',
      shadowColor: p.primary, shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3, shadowRadius: 10, elevation: 5,
    },
    btnDisabled: { opacity: 0.6 },
    saveBtnText: { color: p.white, fontSize: 15, fontWeight: '700' },
    privacyText: { color: p.textSecondary, fontSize: 13, lineHeight: 21 },
  }));
