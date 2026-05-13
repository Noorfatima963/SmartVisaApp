/**
 * Step 5 — Financial Details
 * Saves to local draft, navigates to Step 6 (which does the final API submit).
 */
import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Alert, KeyboardAvoidingView, Platform, ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import PrimaryButton from '../../components/PrimaryButton';
import ProgressDots from '../../components/ProgressDots';
import { saveOnboardingStep, getOnboardingDraft } from '../../services/storage';
import api from '../../services/api';

export default function Step5_Financial({ navigation }) {
  const [savings, setSavings] = useState('');
  const [monthlyIncome, setMonthlyIncome] = useState('');
  const [incomeSource, setIncomeSource] = useState('');
  const [hasSponsor, setHasSponsor] = useState(false);
  const [sponsorName, setSponsorName] = useState('');
  const [sponsorRelationship, setSponsorRelationship] = useState('');

  useEffect(() => {
    async function init() {
      try {
        const d = await getOnboardingDraft();
        let fin = {};
        try { fin = (await api.profile.get())?.financial_profile || {}; } catch (_) {}

        if (d?.approx_savings != null) setSavings(String(d.approx_savings));
        else if (fin?.approx_savings != null) setSavings(String(fin.approx_savings));

        if (d?.current_monthly_income != null) setMonthlyIncome(String(d.current_monthly_income));
        else if (fin?.current_monthly_income != null) setMonthlyIncome(String(fin.current_monthly_income));

        setSavings(prev => prev || '');
        setIncomeSource(d?.income_source || fin?.income_source || '');
        setHasSponsor(d?.has_sponsor ?? fin?.has_sponsor ?? false);
        setSponsorName(d?.sponsor_name || fin?.sponsor_name || '');
        setSponsorRelationship(d?.sponsor_relationship || fin?.sponsor_relationship || '');
      } catch (_) {}
    }
    init();
  }, []);

  const handleNext = async () => {
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
      Alert.alert('Required', "Please enter your sponsor's name.");
      return;
    }

    await saveOnboardingStep(5, {
      approx_savings: savingsVal,
      current_monthly_income: monthlyIncome.trim() ? parseFloat(monthlyIncome) : null,
      income_source: incomeSource.trim() || null,
      has_sponsor: hasSponsor,
      sponsor_name: hasSponsor ? sponsorName.trim() : null,
      sponsor_relationship: hasSponsor ? sponsorRelationship.trim() : null,
    });

    navigation.navigate('Step6_Background');
  };

  return (
    <SafeAreaView style={s.container}>
      <View style={s.top}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Text style={s.backText}>← Back</Text>
        </TouchableOpacity>
        <ProgressDots step={5} total={6} />
        <View style={s.backBtn} />
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

          <Text style={s.badge}>Step 5 of 6</Text>
          <Text style={s.title}>Financial Details</Text>
          <Text style={s.sub}>Visa officers check proof of funds carefully</Text>

          <View style={s.field}>
            <Text style={s.label}>Approximate Savings (USD) *</Text>
            <TextInput style={s.input} placeholder="e.g. 25000" keyboardType="decimal-pad" value={savings} onChangeText={setSavings} />
            <Text style={s.hint}>Include all accessible funds — bank, family, scholarship</Text>
          </View>

          <View style={s.field}>
            <Text style={s.label}>Monthly Income (USD equivalent)</Text>
            <TextInput style={s.input} placeholder="e.g. 1500" keyboardType="decimal-pad" value={monthlyIncome} onChangeText={setMonthlyIncome} />
          </View>

          <View style={s.field}>
            <Text style={s.label}>Primary Source of Income</Text>
            <TextInput style={s.input} placeholder="Salary, Business, Rental Income..." value={incomeSource} onChangeText={setIncomeSource} />
          </View>

          <View style={s.field}>
            <Text style={s.label}>Do you have a financial sponsor?</Text>
            <View style={s.optRow}>
              <TouchableOpacity style={[s.optBtn, hasSponsor && s.optActive]} onPress={() => setHasSponsor(true)}>
                <Text style={[s.optText, hasSponsor && s.optTextActive]}>Yes, I have a sponsor</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[s.optBtn, !hasSponsor && s.optActive]} onPress={() => setHasSponsor(false)}>
                <Text style={[s.optText, !hasSponsor && s.optTextActive]}>Self-funded</Text>
              </TouchableOpacity>
            </View>
          </View>

          {hasSponsor && (
            <>
              <View style={s.field}>
                <Text style={s.label}>Sponsor Name *</Text>
                <TextInput style={s.input} placeholder="Full Name" value={sponsorName} onChangeText={setSponsorName} />
              </View>
              <View style={s.field}>
                <Text style={s.label}>Relationship to You</Text>
                <TextInput style={s.input} placeholder="e.g. Father, Uncle, Mother" value={sponsorRelationship} onChangeText={setSponsorRelationship} />
              </View>
            </>
          )}

        </ScrollView>
      </KeyboardAvoidingView>

      <View style={s.bottom}>
        <PrimaryButton title="Continue to Background Info →" onPress={handleNext} />
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F8FF' },
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 16, paddingHorizontal: 16 },
  backBtn: { minWidth: 64 },
  backText: { color: '#1A237E', fontWeight: '600', fontSize: 14 },
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
  optText: { color: '#666', fontWeight: '600', fontSize: 13, textAlign: 'center' },
  optTextActive: { color: '#1A237E', fontWeight: 'bold' },
  bottom: { padding: 20, paddingBottom: 28 },
});
