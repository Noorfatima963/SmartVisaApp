import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  StatusBar, Alert, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api';

const OTP_LENGTH = 4;
const RESEND_COOLDOWN = 30;

export default function OTPVerification({ route, navigation }) {
  const { email } = route.params;

  const [digits, setDigits] = useState(['', '', '', '']);
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(RESEND_COOLDOWN);
  const inputRefs = useRef([]);
  const timerRef = useRef(null);

  useEffect(() => {
    startCountdown();
    return () => clearInterval(timerRef.current);
  }, []);

  function startCountdown() {
    setCountdown(RESEND_COOLDOWN);
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }

  function handleDigitChange(text, index) {
    const digit = text.replace(/[^0-9]/g, '').slice(-1);
    const next = [...digits];
    next[index] = digit;
    setDigits(next);

    if (digit && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    if (digit && index === OTP_LENGTH - 1) {
      const otp = next.join('');
      if (otp.length === OTP_LENGTH) submitOTP(otp);
    }
  }

  function handleKeyPress(e, index) {
    if (e.nativeEvent.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  async function submitOTP(otp) {
    setVerifying(true);
    try {
      await api.auth.verifyOTP(email, otp);
      Alert.alert(
        'Email Verified',
        'Your account is now active. Please sign in.',
        [{ text: 'Sign In', onPress: () => navigation.replace('SignIn') }],
      );
    } catch (err) {
      Alert.alert('Verification Failed', err.message || 'Incorrect OTP. Please try again.');
      setDigits(['', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setVerifying(false);
    }
  }

  function handleVerifyPress() {
    const otp = digits.join('');
    if (otp.length < OTP_LENGTH) {
      Alert.alert('Incomplete Code', 'Please enter all 4 digits.');
      return;
    }
    submitOTP(otp);
  }

  async function handleResend() {
    if (countdown > 0) return;
    setResending(true);
    try {
      await api.auth.resendOTP(email);
      setDigits(['', '', '', '']);
      inputRefs.current[0]?.focus();
      startCountdown();
    } catch (err) {
      Alert.alert('Resend Failed', err.message || 'Could not resend OTP.');
    } finally {
      setResending(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F5F8FF" />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <View style={styles.inner}>

          <Text style={styles.title}>Verify Your Email</Text>
          <Text style={styles.subtitle}>
            We sent a 4-digit code to{'\n'}
            <Text style={styles.emailText}>{email}</Text>
          </Text>

          <View style={styles.otpRow}>
            {digits.map((d, i) => (
              <TextInput
                key={i}
                ref={ref => (inputRefs.current[i] = ref)}
                style={[styles.otpBox, d ? styles.otpBoxFilled : null]}
                value={d}
                onChangeText={text => handleDigitChange(text, i)}
                onKeyPress={e => handleKeyPress(e, i)}
                keyboardType="number-pad"
                maxLength={1}
                selectTextOnFocus
                editable={!verifying}
              />
            ))}
          </View>

          <TouchableOpacity
            style={[styles.btn, (verifying || digits.join('').length < OTP_LENGTH) && { opacity: 0.6 }]}
            onPress={handleVerifyPress}
            disabled={verifying || digits.join('').length < OTP_LENGTH}
          >
            {verifying
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.btnText}>Verify</Text>
            }
          </TouchableOpacity>

          <View style={styles.resendRow}>
            <Text style={styles.resendLabel}>Didn't receive the code? </Text>
            <TouchableOpacity onPress={handleResend} disabled={countdown > 0 || resending}>
              {resending
                ? <ActivityIndicator size="small" color="#1A237E" />
                : <Text style={[styles.resendBtn, countdown > 0 && styles.resendDisabled]}>
                    {countdown > 0 ? `Resend in ${countdown}s` : 'Resend'}
                  </Text>
              }
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.backLink} onPress={() => navigation.goBack()}>
            <Text style={styles.backLinkText}>Wrong email? Go back</Text>
          </TouchableOpacity>

        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F8FF' },
  inner: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 28 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#1A237E', marginBottom: 12 },
  subtitle: { fontSize: 15, color: '#555', textAlign: 'center', lineHeight: 22, marginBottom: 36 },
  emailText: { fontWeight: 'bold', color: '#1A237E' },
  otpRow: { flexDirection: 'row', gap: 12, marginBottom: 36 },
  otpBox: {
    width: 60, height: 68, borderRadius: 14,
    borderWidth: 2, borderColor: '#C5CAE9',
    backgroundColor: '#fff', textAlign: 'center',
    fontSize: 28, fontWeight: 'bold', color: '#1A237E',
  },
  otpBoxFilled: { borderColor: '#1A237E', backgroundColor: '#EEF0FF' },
  btn: {
    backgroundColor: '#1A237E', paddingVertical: 15, borderRadius: 12,
    alignItems: 'center', width: '100%', elevation: 3, marginBottom: 24,
  },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 17 },
  resendRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  resendLabel: { color: '#666', fontSize: 14 },
  resendBtn: { color: '#1A237E', fontWeight: 'bold', fontSize: 14 },
  resendDisabled: { color: '#999' },
  backLink: { marginTop: 8, padding: 10 },
  backLinkText: { color: '#888', fontSize: 14, textDecorationLine: 'underline' },
});
