import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { getOnboardingDraft, isProfileComplete, setProfileComplete } from '../../services/storage';
import api from '../../services/api';

const STEP_SCREENS = {
  1: 'Step1_PersonalInfo',
  2: 'Step2_Country',
  3: 'Step3_Education',
  4: 'Step4_Language',
  5: 'Step5_Financial',
};

export default function SignIn({ navigation }) {
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Missing Fields', 'Please enter your email and password.');
      return;
    }

    setLoading(true);
    try {
      await login(email.trim().toLowerCase(), password);

      const profileDone = await isProfileComplete();
      if (profileDone) {
        navigation.reset({ index: 0, routes: [{ name: 'Dashboard' }] });
      } else {
        try {
          const profile = await api.profile.get();
          if (profile && (profile.nationality || profile.residence_country || (profile.education_history && profile.education_history.length > 0))) {
            await setProfileComplete(true);
            navigation.reset({ index: 0, routes: [{ name: 'Dashboard' }] });
            return;
          }
        } catch (e) {
          console.log('Profile fetch error on login:', e.message);
        }

        const draft = await getOnboardingDraft();
        const step = draft?.step_reached || 1;
        const screen = STEP_SCREENS[step] || 'Step1_PersonalInfo';
        navigation.reset({ index: 0, routes: [{ name: screen }] });
      }
    } catch (err) {
      Alert.alert('Login Failed', err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F5F8FF" />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">

          <Text style={styles.title}>Welcome Back!</Text>
          <Text style={styles.subtitle}>Sign in to your SmartVisa account.</Text>

          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholderTextColor="#777"
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholderTextColor="#777"
          />

          <TouchableOpacity style={styles.forgot}>
            <Text style={styles.forgotText}>Forgot Password?</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            disabled={loading}
            onPress={handleLogin}
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.buttonText}>Sign In</Text>
            }
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
              <Text style={styles.signupText}>Sign Up</Text>
            </TouchableOpacity>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F8FF' },
  scrollContent: { flexGrow: 1, padding: 25, justifyContent: 'center' },
  title: { fontSize: 32, fontWeight: '800', color: '#1A237E', marginBottom: 5, textAlign: 'center' },
  subtitle: { fontSize: 16, color: '#555', marginBottom: 40, textAlign: 'center' },
  input: {
    width: '100%', borderWidth: 1, borderColor: '#ccc', borderRadius: 10,
    padding: 15, marginVertical: 8, backgroundColor: '#fff', fontSize: 16,
  },
  forgot: { alignSelf: 'flex-end', marginBottom: 20 },
  forgotText: { color: '#1A237E', fontWeight: '600' },
  button: {
    backgroundColor: '#1A237E', paddingVertical: 14, borderRadius: 10,
    marginTop: 10, width: '100%', alignItems: 'center', elevation: 4,
  },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 17 },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 30 },
  footerText: { color: '#666', fontSize: 15 },
  signupText: { color: '#FFD700', fontWeight: 'bold', fontSize: 15, marginLeft: 5 },
});