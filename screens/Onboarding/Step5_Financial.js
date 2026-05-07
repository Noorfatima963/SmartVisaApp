/**
 * Step 5 — Financial + Submit All
 * API calls (in order):
 *   1. PATCH /api/profile/       → personal info
 *   2. POST  /api/profile/education/      → education record
 *   3. POST  /api/profile/language-tests/ → language test (if exists)
 *   4. PATCH /api/profile/financial/      → financial profile
 */
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import PrimaryButton from '../../components/PrimaryButton';
import ProgressDots from '../../components/ProgressDots';
import { saveOnboardingStep, getOnboardingDraft, clearOnboardingDraft, setProfileComplete, getToken } from '../../services/storage';
import api from '../../services/api';

const BASE_URL = 'http://10.0.2.2:8000';

// Helper: authenticated PATCH/POST
async function apiCall(method, endpoint, body) {
  const token = await getToken();
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method,
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(JSON.stringify(data));
  return data;
}

export default function Step5_Financial({ navigation }) {
  const [savings, setSavings] = useState('');
  const [hasSponsor, setHasSponsor] = useState(false);
  const [sponsorName, setSponsorName] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function initData() {
      try {
        const d = await getOnboardingDraft();
        let profile = null;
        try {
          profile = await api.profile.get();
        } catch (e) { console.log('Profile fetch error', e.message); }

        const fin = profile?.financial_profile || {};

        const pSavings = d?.approx_savings ?? fin?.approx_savings;
        const pHasSponsor = d?.has_sponsor ?? fin?.has_sponsor;
        const pSponsorName = d?.sponsor_name || fin?.sponsor_name || '';

        if (pSavings !== undefined && pSavings !== null) setSavings(pSavings.toString());
        if (pHasSponsor !== undefined && pHasSponsor !== null) setHasSponsor(pHasSponsor);
        if (pSponsorName) setSponsorName(pSponsorName);
      } catch (err) { }
    }
    initData();
  }, []);

  const handleFinish = async () => {
    if (!savings.trim()) {
      Alert.alert('Required', 'Please enter your approximate savings.');
      return;
    }
    const savingsVal = parseFloat(savings);
    if (isNaN(savingsVal) || savingsVal < 0) {
      Alert.alert('Invalid', 'Please enter a valid savings amount.');
      return;
    }
    if (hasSponsor && !sponsorName.trim()) {
      Alert.alert('Required', 'Please enter your sponsor\'s name.');
      return;
    }

    await saveOnboardingStep(5, {
      approx_savings: savingsVal,
      has_sponsor: hasSponsor,
      sponsor_name: hasSponsor ? sponsorName.trim() : null,
    });

    setLoading(true);
    const errors = [];

    try {
      const d = await getOnboardingDraft();
      console.log('=== FULL DRAFT ===', JSON.stringify(d));

      // 1. Save personal profile
      try {
        await apiCall('PATCH', '/api/profile/', {
          first_name: d.first_name,
          last_name: d.last_name,
          gender: d.gender,
          date_of_birth: d.date_of_birth || null,
          nationality: d.nationality,
          residence_country: d.residence_country,
          city: d.city,
          address_line1: d.address_line1,
          target_country: d.target_country,
          target_degree_type: d.target_degree_type,
        });
        console.log('✅ Profile saved');
      } catch (e) { errors.push('Profile: ' + e.message); console.log('❌ Profile:', e.message); }

      // 2. Save education
      try {
        await apiCall('POST', '/api/profile/education/', {
          level: d.edu_level,
          degree_title: d.degree_title,
          institute_name: d.institute_name,
          start_date: d.start_date,
          end_date: d.end_date || null,
          is_completed: d.is_completed !== false,
          score: d.score,
        });
        console.log('✅ Education saved');
      } catch (e) { errors.push('Education: ' + e.message); console.log('❌ Education:', e.message); }

      // 3. Save language test (only if user has one)
      if (!d.lang_no_test && d.lang_test_type) {
        try {
          await apiCall('POST', '/api/profile/language-tests/', {
            test_type: d.lang_test_type,
            overall_score: d.lang_overall,
            reading: d.lang_reading,
            listening: d.lang_listening,
            writing: d.lang_writing,
            speaking: d.lang_speaking,
            test_date: d.lang_test_date,
            expiry_date: d.lang_expiry_date,
          });
          console.log('✅ Language test saved');
        } catch (e) { errors.push('Language: ' + e.message); console.log('❌ Language:', e.message); }
      }

      // 4. Save financial profile
      try {
        await apiCall('PUT', '/api/profile/financial/', {
          approx_savings: savingsVal,
          has_sponsor: hasSponsor,
          sponsor_name: hasSponsor ? sponsorName.trim() : null,
          sponsor_relationship: null,
        });
        console.log('✅ Financial saved');
      } catch (e) { errors.push('Financial: ' + e.message); console.log('❌ Financial:', e.message); }

      // Mark complete and navigate
      await setProfileComplete(true);
      await clearOnboardingDraft();

      if (errors.length > 0) {
        Alert.alert(
          'Partially Saved',
          `Some details could not be saved:\n${errors.join('\n')}\n\nYou can update them from your Profile.`,
          [{ text: 'Continue', onPress: () => navigation.reset({ index: 0, routes: [{ name: 'Dashboard' }] }) }]
        );
      } else {
        navigation.reset({ index: 0, routes: [{ name: 'Dashboard' }] });
      }

    } catch (err) {
      console.log('=== FATAL ERROR ===', err);
      await setProfileComplete(false);
      Alert.alert(
        'Saved Locally',
        'Could not connect to server. Your data is saved on this device and will sync when you reconnect.',
        [{ text: 'Continue', onPress: () => navigation.reset({ index: 0, routes: [{ name: 'Dashboard' }] }) }]
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={s.container}>
      <View style={s.top}><ProgressDots step={5} total={5} /></View>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
          <Text style={s.badge}>Final Step 🎯</Text>
          <Text style={s.title}>Financial Details</Text>
          <Text style={s.sub}>Visa officers check proof of funds carefully</Text>

          <View style={s.field}>
            <Text style={s.label}>Approximate Savings (USD) *</Text>
            <TextInput style={s.input} placeholder="e.g. 25000" keyboardType="number-pad" value={savings} onChangeText={setSavings} />
            <Text style={s.hint}>Include all accessible funds — bank, family, scholarship</Text>
          </View>

          <View style={s.field}>
            <Text style={s.label}>Do you have a financial sponsor?</Text>
            <View style={s.optRow}>
              <TouchableOpacity style={[s.optBtn, hasSponsor && s.optActive]} onPress={() => setHasSponsor(true)}>
                <Text style={[s.optText, hasSponsor && s.optTextActive]}>👨‍👩‍👧  Yes</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[s.optBtn, !hasSponsor && s.optActive]} onPress={() => setHasSponsor(false)}>
                <Text style={[s.optText, !hasSponsor && s.optTextActive]}>🧑  Self-funded</Text>
              </TouchableOpacity>
            </View>
          </View>

          {hasSponsor && (
            <View style={s.field}>
              <Text style={s.label}>Sponsor Name *</Text>
              <TextInput style={s.input} placeholder="e.g. Father, Uncle" value={sponsorName} onChangeText={setSponsorName} />
            </View>
          )}

          <View style={s.summaryCard}>
            <Text style={s.summaryTitle}>📋 You're about to submit:</Text>
            <Text style={s.summaryItem}>✅ Personal Information</Text>
            <Text style={s.summaryItem}>✅ Study Destination</Text>
            <Text style={s.summaryItem}>✅ Education Background</Text>
            <Text style={s.summaryItem}>✅ Language Test</Text>
            <Text style={s.summaryItem}>✅ Financial Details</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <View style={s.bottom}>
        <TouchableOpacity style={[s.finishBtn, loading && { opacity: 0.7 }]} onPress={handleFinish} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.finishText}>🚀  Finish & Go to Dashboard</Text>}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F8FF' },
  top: { alignItems: 'center', marginTop: 16 },
  scroll: { paddingHorizontal: 24, paddingTop: 12, paddingBottom: 20 },
  badge: { fontSize: 12, color: '#D32F2F', fontWeight: 'bold', backgroundColor: '#FFEBEE', alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, marginBottom: 10, overflow: 'hidden' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#1A237E', marginBottom: 4 },
  sub: { fontSize: 14, color: '#666', marginBottom: 20 },
  field: { marginBottom: 18 },
  label: { fontSize: 13, fontWeight: '600', color: '#1A237E', marginBottom: 6 },
  input: { backgroundColor: '#fff', borderWidth: 1.5, borderColor: '#E0E0E0', borderRadius: 12, padding: 13, fontSize: 15, color: '#333' },
  hint: { fontSize: 11, color: '#999', marginTop: 4, fontStyle: 'italic' },
  optRow: { flexDirection: 'row', gap: 10 },
  optBtn: { flex: 1, paddingVertical: 14, borderRadius: 12, borderWidth: 1.5, borderColor: '#E0E0E0', alignItems: 'center', backgroundColor: '#fff' },
  optActive: { borderColor: '#1A237E', backgroundColor: '#E8EAF6', borderWidth: 2 },
  optText: { color: '#666', fontWeight: '600', fontSize: 14 },
  optTextActive: { color: '#1A237E', fontWeight: 'bold' },
  summaryCard: { backgroundColor: '#E8F5E9', borderRadius: 14, padding: 16, marginTop: 10, borderLeftWidth: 4, borderLeftColor: '#4CAF50' },
  summaryTitle: { fontWeight: 'bold', color: '#2E7D32', marginBottom: 10, fontSize: 14 },
  summaryItem: { color: '#388E3C', fontSize: 13, marginBottom: 5 },
  bottom: { padding: 20, paddingBottom: 28 },
  finishBtn: { backgroundColor: '#1A237E', paddingVertical: 16, borderRadius: 14, alignItems: 'center', elevation: 4 },
  finishText: { color: '#fff', fontWeight: 'bold', fontSize: 17 },
});