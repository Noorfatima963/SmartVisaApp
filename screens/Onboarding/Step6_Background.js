/**
 * Step 6 — Background, Passport & Professional Info (Final Step)
 * Collects remaining profile fields then submits everything to the backend.
 */
import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Alert, KeyboardAvoidingView, Platform, ScrollView,
  ActivityIndicator, Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Picker } from '@react-native-picker/picker';
import ProgressDots from '../../components/ProgressDots';
import { getOnboardingDraft, clearOnboardingDraft, setProfileComplete } from '../../services/storage';
import api from '../../services/api';

function Field({ label, children }) {
  return (
    <View style={s.field}>
      <Text style={s.label}>{label}</Text>
      {children}
    </View>
  );
}

function SectionHeader({ title }) {
  return <Text style={s.sectionHeader}>{title}</Text>;
}

function FlagToggle({ label, value, onValueChange }) {
  return (
    <View style={s.flagRow}>
      <Text style={s.flagLabel}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: '#E0E0E0', true: '#1A237E' }}
        thumbColor={value ? '#FFD700' : '#fff'}
      />
    </View>
  );
}

export default function Step6_Background({ navigation }) {
  const [maritalStatus, setMaritalStatus] = useState('single');
  const [passportNumber, setPassportNumber] = useState('');
  const [passportExpiryStr, setPassportExpiryStr] = useState('');
  const [professionTitle, setProfessionTitle] = useState('');
  const [currentEmployer, setCurrentEmployer] = useState('');
  const [yearsOfExperience, setYearsOfExperience] = useState('');
  const [hasTravelHistory, setHasTravelHistory] = useState(false);
  const [hasAdditionalResidency, setHasAdditionalResidency] = useState(false);
  const [hasAdditionalPassport, setHasAdditionalPassport] = useState(false);
  const [hasVisaRefusal, setHasVisaRefusal] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Pre-fill from existing profile if re-entering this screen
    api.profile.get().then(data => {
      if (data.marital_status) setMaritalStatus(data.marital_status);
      if (data.passport_number) setPassportNumber(data.passport_number);
      if (data.passport_expiry_date) setPassportExpiryStr(data.passport_expiry_date);
      if (data.profession_title) setProfessionTitle(data.profession_title);
      if (data.current_employer) setCurrentEmployer(data.current_employer);
      if (data.years_of_experience != null) setYearsOfExperience(String(data.years_of_experience));
      setHasTravelHistory(!!data.has_travel_history);
      setHasAdditionalResidency(!!data.has_additional_residency);
      setHasAdditionalPassport(!!data.has_additional_passport);
      setHasVisaRefusal(!!data.has_visa_refusal_history);
    }).catch(() => {});
  }, []);

  const handleFinish = async () => {
    setLoading(true);
    const errors = [];

    try {
      const d = await getOnboardingDraft();

      // 1. Save full profile (Step 1 fields + Step 6 fields)
      try {
        await api.profile.update({
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
          marital_status: maritalStatus,
          passport_number: passportNumber.trim() || null,
          passport_expiry_date: passportExpiryStr.trim() || null,
          profession_title: professionTitle.trim() || null,
          current_employer: currentEmployer.trim() || null,
          years_of_experience: yearsOfExperience.trim() ? Number(yearsOfExperience) : 0,
          has_travel_history: hasTravelHistory,
          has_additional_residency: hasAdditionalResidency,
          has_additional_passport: hasAdditionalPassport,
          has_visa_refusal_history: hasVisaRefusal,
        });
      } catch (e) { errors.push('Profile: ' + (e.message || 'unknown')); }

      // 2. Save education
      try {
        await api.profile.saveEducation({
          level: d.edu_level,
          degree_title: d.degree_title,
          institute_name: d.institute_name,
          start_date: d.start_date,
          end_date: d.end_date || null,
          is_completed: d.is_completed !== false,
          score: d.score,
        });
      } catch (e) { errors.push('Education: ' + (e.message || 'unknown')); }

      // 3. Save language test (if user took one)
      if (!d.lang_no_test && d.lang_test_type) {
        try {
          await api.profile.saveLanguage({
            test_type: d.lang_test_type,
            overall_score: d.lang_overall,
            reading: d.lang_reading,
            listening: d.lang_listening,
            writing: d.lang_writing,
            speaking: d.lang_speaking,
            test_date: d.lang_test_date,
            expiry_date: d.lang_expiry_date,
          });
        } catch (e) { errors.push('Language: ' + (e.message || 'unknown')); }
      }

      // 4. Save financial profile
      try {
        await api.profile.saveFinancial({
          approx_savings: d.approx_savings,
          current_monthly_income: d.current_monthly_income || null,
          income_source: d.income_source || null,
          has_sponsor: d.has_sponsor || false,
          sponsor_name: d.sponsor_name || null,
          sponsor_relationship: d.sponsor_relationship || null,
        });
      } catch (e) { errors.push('Financial: ' + (e.message || 'unknown')); }

      await setProfileComplete(true);
      await clearOnboardingDraft();

      if (errors.length > 0) {
        Alert.alert(
          'Partially Saved',
          `Some details could not be saved:\n${errors.join('\n')}\n\nYou can update them from Edit Profile.`,
          [{ text: 'Continue', onPress: () => navigation.reset({ index: 0, routes: [{ name: 'Dashboard' }] }) }]
        );
      } else {
        navigation.reset({ index: 0, routes: [{ name: 'Dashboard' }] });
      }

    } catch (err) {
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
      <View style={s.top}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Text style={s.backText}>← Back</Text>
        </TouchableOpacity>
        <ProgressDots step={6} total={6} />
        <View style={s.backBtn} />
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

          <Text style={s.badge}>Final Step 🎯</Text>
          <Text style={s.title}>Background & Passport</Text>
          <Text style={s.sub}>These details improve your visa eligibility score</Text>

          <SectionHeader title="Personal Status" />

          <Field label="Marital Status">
            <View style={s.pickerWrap}>
              <Picker selectedValue={maritalStatus} onValueChange={setMaritalStatus} style={s.picker}>
                <Picker.Item label="Single" value="single" />
                <Picker.Item label="Married" value="married" />
              </Picker>
            </View>
          </Field>

          <SectionHeader title="Passport" />

          <Field label="Passport Number">
            <TextInput
              style={s.input}
              placeholder="AB1234567"
              value={passportNumber}
              onChangeText={setPassportNumber}
              autoCapitalize="characters"
            />
          </Field>

          <Field label="Passport Expiry Date">
            <TextInput
              style={s.input}
              placeholder="YYYY-MM-DD  e.g. 2028-06-30"
              value={passportExpiryStr}
              onChangeText={setPassportExpiryStr}
              keyboardType="numbers-and-punctuation"
              maxLength={10}
            />
          </Field>

          <SectionHeader title="Professional Info (optional)" />

          <Field label="Job Title / Profession">
            <TextInput
              style={s.input}
              placeholder="Software Engineer, Teacher, Student..."
              value={professionTitle}
              onChangeText={setProfessionTitle}
            />
          </Field>

          <Field label="Current Employer">
            <TextInput
              style={s.input}
              placeholder="Company or Organisation Name"
              value={currentEmployer}
              onChangeText={setCurrentEmployer}
            />
          </Field>

          <Field label="Years of Work Experience">
            <TextInput
              style={s.input}
              placeholder="0"
              value={yearsOfExperience}
              onChangeText={setYearsOfExperience}
              keyboardType="numeric"
            />
          </Field>

          <SectionHeader title="Background Flags" />
          <Text style={s.flagsNote}>These flags affect your visa probability score. Answer honestly.</Text>

          <FlagToggle label="I have prior travel history" value={hasTravelHistory} onValueChange={setHasTravelHistory} />
          <FlagToggle label="I hold another country's residency" value={hasAdditionalResidency} onValueChange={setHasAdditionalResidency} />
          <FlagToggle label="I hold a second passport" value={hasAdditionalPassport} onValueChange={setHasAdditionalPassport} />
          <FlagToggle label="I have a visa refusal history" value={hasVisaRefusal} onValueChange={setHasVisaRefusal} />

          {hasTravelHistory && (
            <View style={s.infoBox}>
              <Text style={s.infoText}>
                You can add your individual travel records from Edit Profile → Travel History tab after completing setup.
              </Text>
            </View>
          )}

          <View style={s.summaryCard}>
            <Text style={s.summaryTitle}>You are about to submit:</Text>
            <Text style={s.summaryItem}>Personal Information</Text>
            <Text style={s.summaryItem}>Study Destination</Text>
            <Text style={s.summaryItem}>Education Background</Text>
            <Text style={s.summaryItem}>Language Test</Text>
            <Text style={s.summaryItem}>Financial Details</Text>
            <Text style={s.summaryItem}>Background & Passport</Text>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>

      <View style={s.bottom}>
        <TouchableOpacity
          style={[s.finishBtn, loading && { opacity: 0.7 }]}
          onPress={handleFinish}
          disabled={loading}
        >
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={s.finishText}>Finish & Go to Dashboard</Text>}
        </TouchableOpacity>
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

  sectionHeader: { fontSize: 13, fontWeight: 'bold', color: '#1A237E', backgroundColor: '#E8EAF6', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, marginTop: 20, marginBottom: 12, overflow: 'hidden' },

  field: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '600', color: '#1A237E', marginBottom: 6 },
  input: { backgroundColor: '#fff', borderWidth: 1.5, borderColor: '#E0E0E0', borderRadius: 12, padding: 13, fontSize: 15, color: '#333' },

  pickerWrap: { backgroundColor: '#fff', borderWidth: 1.5, borderColor: '#E0E0E0', borderRadius: 12, overflow: 'hidden' },
  picker: { height: 48, color: '#333' },

  flagRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, marginBottom: 10 },
  flagLabel: { fontSize: 14, color: '#333', fontWeight: '500', flex: 1, marginRight: 12 },
  flagsNote: { fontSize: 12, color: '#888', marginBottom: 14, fontStyle: 'italic' },

  infoBox: { backgroundColor: '#E8EAF6', borderRadius: 10, padding: 12, marginBottom: 14 },
  infoText: { fontSize: 12, color: '#3949AB', lineHeight: 18 },

  summaryCard: { backgroundColor: '#E8F5E9', borderRadius: 14, padding: 16, marginTop: 16, borderLeftWidth: 4, borderLeftColor: '#4CAF50' },
  summaryTitle: { fontWeight: 'bold', color: '#2E7D32', marginBottom: 10, fontSize: 14 },
  summaryItem: { color: '#388E3C', fontSize: 13, marginBottom: 5 },

  bottom: { padding: 20, paddingBottom: 28 },
  finishBtn: { backgroundColor: '#1A237E', paddingVertical: 16, borderRadius: 14, alignItems: 'center', elevation: 4 },
  finishText: { color: '#fff', fontWeight: 'bold', fontSize: 17 },
});
