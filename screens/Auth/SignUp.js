import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  StatusBar, ScrollView, Alert, ActivityIndicator,
  KeyboardAvoidingView, Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api';

const LIMITS = {
  firstName: 150,
  lastName: 150,
  email: 254,
  phone: 15,
  password: 128,
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function FieldError({ msg }) {
  if (!msg) return null;
  return <Text style={styles.fieldError}>{msg}</Text>;
}

export default function SignUp({ navigation }) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e = {};
    if (!firstName.trim()) e.firstName = 'First name is required.';
    else if (firstName.trim().length > LIMITS.firstName) e.firstName = `Max ${LIMITS.firstName} characters.`;

    if (!lastName.trim()) e.lastName = 'Last name is required.';
    else if (lastName.trim().length > LIMITS.lastName) e.lastName = `Max ${LIMITS.lastName} characters.`;

    if (!email.trim()) e.email = 'Email is required.';
    else if (!EMAIL_RE.test(email.trim())) e.email = 'Enter a valid email address.';
    else if (email.trim().length > LIMITS.email) e.email = `Max ${LIMITS.email} characters.`;

    if (phone.trim() && phone.trim().length > LIMITS.phone) e.phone = `Max ${LIMITS.phone} characters.`;

    if (!password) e.password = 'Password is required.';
    else if (password.length < 8) e.password = 'Password must be at least 8 characters.';
    else if (password.length > LIMITS.password) e.password = `Max ${LIMITS.password} characters.`;
    else if (/^\d+$/.test(password))
      e.password = 'Password cannot be entirely numeric.';

    if (!confirmPassword) e.confirmPassword = 'Please confirm your password.';
    else if (confirmPassword !== password) e.confirmPassword = 'Passwords do not match.';

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSignUp = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await api.auth.mobileRegister(
        firstName.trim(),
        lastName.trim(),
        email.trim().toLowerCase(),
        phone.trim() || null,
        password,
      );
      navigation.replace('OTPVerification', { email: email.trim().toLowerCase() });
    } catch (err) {
      Alert.alert('Registration Failed', err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const charCount = (val, limit) => {
    const n = val.length;
    if (n >= limit * 0.85) return `${n}/${limit}`;
    return null;
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F5F8FF" />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Start your study abroad journey</Text>

          {/* Name row */}
          <View style={styles.row}>
            <View style={[styles.field, { flex: 1, marginRight: 8 }]}>
              <Text style={styles.label}>First Name *</Text>
              <TextInput
                style={[styles.input, errors.firstName && styles.inputError]}
                placeholder="Laiba"
                value={firstName}
                onChangeText={t => { setFirstName(t); setErrors(p => ({ ...p, firstName: null })); }}
                autoCapitalize="words"
                maxLength={LIMITS.firstName}
              />
              {charCount(firstName, LIMITS.firstName) && (
                <Text style={styles.charCount}>{charCount(firstName, LIMITS.firstName)}</Text>
              )}
              <FieldError msg={errors.firstName} />
            </View>
            <View style={[styles.field, { flex: 1 }]}>
              <Text style={styles.label}>Last Name *</Text>
              <TextInput
                style={[styles.input, errors.lastName && styles.inputError]}
                placeholder="Fatima"
                value={lastName}
                onChangeText={t => { setLastName(t); setErrors(p => ({ ...p, lastName: null })); }}
                autoCapitalize="words"
                maxLength={LIMITS.lastName}
              />
              {charCount(lastName, LIMITS.lastName) && (
                <Text style={styles.charCount}>{charCount(lastName, LIMITS.lastName)}</Text>
              )}
              <FieldError msg={errors.lastName} />
            </View>
          </View>

          {/* Email */}
          <View style={styles.field}>
            <Text style={styles.label}>Email *</Text>
            <TextInput
              style={[styles.input, errors.email && styles.inputError]}
              placeholder="info@example.com"
              value={email}
              onChangeText={t => { setEmail(t); setErrors(p => ({ ...p, email: null })); }}
              keyboardType="email-address"
              autoCapitalize="none"
              maxLength={LIMITS.email}
            />
            {charCount(email, LIMITS.email) && (
              <Text style={styles.charCount}>{charCount(email, LIMITS.email)}</Text>
            )}
            <FieldError msg={errors.email} />
          </View>

          {/* Phone */}
          <View style={styles.field}>
            <Text style={styles.label}>Phone (optional)</Text>
            <TextInput
              style={[styles.input, errors.phone && styles.inputError]}
              placeholder="+92 300 1234567"
              value={phone}
              onChangeText={t => { setPhone(t); setErrors(p => ({ ...p, phone: null })); }}
              keyboardType="phone-pad"
              maxLength={LIMITS.phone}
            />
            {charCount(phone, LIMITS.phone) && (
              <Text style={styles.charCount}>{charCount(phone, LIMITS.phone)}</Text>
            )}
            <FieldError msg={errors.phone} />
          </View>

          {/* Password */}
          <View style={styles.field}>
            <Text style={styles.label}>Password * (min 8 chars, not all numbers)</Text>
            <View style={styles.passwordWrap}>
              <TextInput
                style={[styles.input, styles.passwordInput, errors.password && styles.inputError]}
                placeholder="Enter password"
                placeholderTextColor="#AAAAAA"
                value={password}
                onChangeText={t => { setPassword(t); setErrors(p => ({ ...p, password: null, confirmPassword: null })); }}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                maxLength={LIMITS.password}
                textContentType="newPassword"
              />
              <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowPassword(v => !v)}>
                <Text style={styles.eyeText}>{showPassword ? 'Hide' : 'Show'}</Text>
              </TouchableOpacity>
            </View>
            <FieldError msg={errors.password} />
          </View>

          {/* Confirm Password */}
          <View style={styles.field}>
            <Text style={styles.label}>Confirm Password *</Text>
            <View style={styles.passwordWrap}>
              <TextInput
                style={[styles.input, styles.passwordInput, errors.confirmPassword && styles.inputError]}
                placeholder="Re-enter password"
                placeholderTextColor="#AAAAAA"
                value={confirmPassword}
                onChangeText={t => { setConfirmPassword(t); setErrors(p => ({ ...p, confirmPassword: null })); }}
                secureTextEntry={!showConfirm}
                autoCapitalize="none"
                autoCorrect={false}
                maxLength={LIMITS.password}
                textContentType="newPassword"
              />
              <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowConfirm(v => !v)}>
                <Text style={styles.eyeText}>{showConfirm ? 'Hide' : 'Show'}</Text>
              </TouchableOpacity>
            </View>
            {confirmPassword.length > 0 && !errors.confirmPassword && confirmPassword === password && (
              <Text style={styles.matchOk}>Passwords match</Text>
            )}
            <FieldError msg={errors.confirmPassword} />
          </View>

          <TouchableOpacity
            style={[styles.btn, loading && { opacity: 0.7 }]}
            onPress={handleSignUp}
            disabled={loading}
          >
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Create Account</Text>}
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('SignIn')}>
              <Text style={styles.link}>Sign In</Text>
            </TouchableOpacity>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F8FF' },
  scroll: { padding: 25, justifyContent: 'center', minHeight: '100%' },
  title: { fontSize: 30, fontWeight: 'bold', color: '#1A237E', marginBottom: 6 },
  subtitle: { fontSize: 15, color: '#666', marginBottom: 28 },
  row: { flexDirection: 'row', marginBottom: 0 },
  field: { marginBottom: 18 },
  label: { color: '#1A237E', fontWeight: '600', marginBottom: 7, fontSize: 13 },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: '#333333',
  },
  inputError: { borderColor: '#F44336' },
  passwordWrap: { position: 'relative' },
  passwordInput: { paddingRight: 70 },
  eyeBtn: { position: 'absolute', right: 14, top: 0, bottom: 0, justifyContent: 'center' },
  eyeText: { color: '#1A237E', fontWeight: '600', fontSize: 13 },
  fieldError: { color: '#F44336', fontSize: 12, marginTop: 4 },
  matchOk: { color: '#4CAF50', fontSize: 12, marginTop: 4 },
  charCount: { color: '#999', fontSize: 11, textAlign: 'right', marginTop: 3 },
  btn: { backgroundColor: '#1A237E', paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginTop: 8, elevation: 3 },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 17 },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 25 },
  footerText: { color: '#666' },
  link: { color: '#FFD700', fontWeight: 'bold', marginLeft: 5 },
});
