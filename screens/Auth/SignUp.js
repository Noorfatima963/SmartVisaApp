import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  StatusBar, ScrollView, Alert, ActivityIndicator,
  KeyboardAvoidingView, Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const BASE_URL = 'http://10.0.2.2:8000';

export default function SignUp({ navigation }) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSignUp = async () => {
    // Basic validation
    if (!firstName.trim() || !lastName.trim() || !email.trim() || !password.trim()) {
      Alert.alert('Missing Fields', 'First name, last name, email and password are required.');
      return;
    }
    if (password.length < 8) {
      Alert.alert('Weak Password', 'Password must be at least 8 characters.');
      return;
    }

    const body = {
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      email: email.trim().toLowerCase(),
      phone_number: phone.trim() || null,
      password: password,
    };

    console.log('=== REGISTER PAYLOAD ===', JSON.stringify(body));

    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/api/users/register/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      console.log('=== REGISTER RESPONSE ===', res.status, JSON.stringify(data));

      if (res.ok) {
        setDone(true);
      } else {
        // Show exact backend error
        Alert.alert('Registration Failed', JSON.stringify(data, null, 2));
      }
    } catch (err) {
      console.log('=== NETWORK ERROR ===', err.message);
      Alert.alert('Connection Error', 'Could not reach server. Check your connection.');
    } finally {
      setLoading(false);
    }
  };

  // ── Email sent screen ──────────────────────────────────────────────────────
  if (done) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.successBox}>
          <Text style={styles.successIcon}>📧</Text>
          <Text style={styles.successTitle}>Verify your email</Text>
          <Text style={styles.successText}>
            We sent a verification link to{'\n'}
            <Text style={{ fontWeight: 'bold', color: '#1A237E' }}>{email}</Text>
          </Text>
          <Text style={styles.successSub}>
            Click the link to activate your account, then sign in.
          </Text>
          <TouchableOpacity style={styles.btn} onPress={() => navigation.replace('SignIn')}>
            <Text style={styles.btnText}>Go to Sign In</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.backLink} onPress={() => setDone(false)}>
            <Text style={styles.backLinkText}>Wrong email? Go back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ── Registration form ──────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F5F8FF" />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

          <Text style={styles.title}>Create Account 🚀</Text>
          <Text style={styles.subtitle}>Start your study abroad journey</Text>

          {/* First + Last name row */}
          <View style={styles.row}>
            <View style={[styles.field, { flex: 1, marginRight: 8 }]}>
              <Text style={styles.label}>First Name *</Text>
              <TextInput style={styles.input} placeholder="Laiba" value={firstName} onChangeText={setFirstName} autoCapitalize="words" />
            </View>
            <View style={[styles.field, { flex: 1 }]}>
              <Text style={styles.label}>Last Name *</Text>
              <TextInput style={styles.input} placeholder="Fatima" value={lastName} onChangeText={setLastName} autoCapitalize="words" />
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Email *</Text>
            <TextInput style={styles.input} placeholder="info@example.com" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Phone (optional)</Text>
            <TextInput style={styles.input} placeholder="+92 300 1234567" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Password * (min 8 chars)</Text>
            <TextInput style={styles.input} placeholder="••••••••" value={password} onChangeText={setPassword} secureTextEntry />
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
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 12, padding: 14, fontSize: 16 },
  btn: { backgroundColor: '#1A237E', paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginTop: 8, elevation: 3 },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 17 },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 25 },
  footerText: { color: '#666' },
  link: { color: '#FFD700', fontWeight: 'bold', marginLeft: 5 },
  // success
  successBox: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30 },
  successIcon: { fontSize: 64, marginBottom: 20 },
  successTitle: { fontSize: 26, fontWeight: 'bold', color: '#1A237E', marginBottom: 15 },
  successText: { fontSize: 16, color: '#444', textAlign: 'center', lineHeight: 24, marginBottom: 12 },
  successSub: { fontSize: 14, color: '#888', textAlign: 'center', lineHeight: 20, marginBottom: 35 },
  backLink: { marginTop: 15, padding: 10 },
  backLinkText: { color: '#888', fontSize: 14, textDecorationLine: 'underline' },
});