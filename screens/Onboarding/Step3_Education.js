/**
 * Step 3 — Education
 * API: POST /api/profile/education/
 * Required: level, degree_title, institute_name, start_date, score
 * Optional: end_date, is_completed
 * Also saves: backlogs (used in assessments, not in this API)
 */
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Picker } from '@react-native-picker/picker';
import PrimaryButton from '../../components/PrimaryButton';
import ProgressDots from '../../components/ProgressDots';
import { saveOnboardingStep, getOnboardingDraft } from '../../services/storage';
import api from '../../services/api';

const LEVELS = [
  { label: 'Bachelors / Under-Graduate', value: 'bachelors' },
  { label: 'Masters / Post-Graduate', value: 'masters' },
  { label: 'High School / A-Levels', value: 'high_school' },
  { label: 'PhD / Doctorate', value: 'phd' },
];

export default function Step3_Education({ navigation }) {
  const [level, setLevel] = useState('bachelors');
  const [degreeTitle, setDegreeTitle] = useState('');
  const [institute, setInstitute] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isCompleted, setIsCompleted] = useState(true);
  const [score, setScore] = useState('');
  const [backlogs, setBacklogs] = useState('0');

  useEffect(() => {
    async function initData() {
      try {
        const d = await getOnboardingDraft();
        let profile = null;
        try {
          profile = await api.profile.get();
        } catch (e) { console.log('Profile fetch error:', e.message); }

        const edu = profile?.education_history?.[0] || {};

        const pLevel = d?.edu_level || edu?.level;
        const pTitle = d?.degree_title || edu?.degree_title;
        const pInst = d?.institute_name || edu?.institute_name;
        const pStart = d?.start_date || edu?.start_date;
        const pEnd = d?.end_date || edu?.end_date;
        const pComp = d?.is_completed !== undefined ? d.is_completed : edu?.is_completed;
        const pScore = d?.score || edu?.score;
        const pBack = d?.backlogs !== undefined ? d.backlogs : edu?.backlogs;

        if (pLevel) setLevel(pLevel);
        if (pTitle) setDegreeTitle(pTitle);
        if (pInst) setInstitute(pInst);
        if (pStart) setStartDate(pStart);
        if (pEnd) setEndDate(pEnd);
        if (pComp !== undefined && pComp !== null) setIsCompleted(pComp);
        if (pScore) setScore(pScore.toString());
        if (pBack !== undefined && pBack !== null) setBacklogs(pBack.toString());
      } catch (err) { }
    }
    initData();
  }, []);

  const handleNext = async () => {
    if (!degreeTitle.trim() || !institute.trim() || !startDate.trim() || !score.trim()) {
      Alert.alert('Required Fields', 'Please fill Degree Title, Institute, Start Date and Score.');
      return;
    }
    // Validate date format YYYY-MM-DD
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(startDate.trim())) {
      Alert.alert('Invalid Date', 'Start date must be in YYYY-MM-DD format. e.g. 2019-09-01');
      return;
    }
    if (endDate.trim() && !dateRegex.test(endDate.trim())) {
      Alert.alert('Invalid Date', 'End date must be in YYYY-MM-DD format. e.g. 2023-06-30');
      return;
    }

    await saveOnboardingStep(3, {
      edu_level: level,
      degree_title: degreeTitle.trim(),
      institute_name: institute.trim(),
      start_date: startDate.trim(),
      end_date: endDate.trim() || null,
      is_completed: isCompleted,
      score: score.trim(),
      backlogs: parseInt(backlogs) || 0,
    });
    navigation.navigate('Step4_Language');
  };

  return (
    <SafeAreaView style={s.container}>
      <View style={s.top}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Text style={s.backText}>← Back</Text>
        </TouchableOpacity>
        <ProgressDots step={3} total={6} />
        <View style={s.backBtn} />
      </View>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
          <Text style={s.badge}>Step 3 of 6</Text>
          <Text style={s.title}>Education Background</Text>
          <Text style={s.sub}>Your most recent qualification</Text>

          <View style={s.field}>
            <Text style={s.label}>Education Level *</Text>
            <View style={s.pickerBox}>
              <Picker selectedValue={level} onValueChange={setLevel} dropdownIconColor="#1A237E">
                {LEVELS.map(l => <Picker.Item key={l.value} label={l.label} value={l.value} color="#000" />)}
              </Picker>
            </View>
          </View>

          <View style={s.field}>
            <Text style={s.label}>Degree Title *</Text>
            <TextInput style={s.input} value={degreeTitle} onChangeText={setDegreeTitle} placeholder="e.g. BS Computer Science" />
          </View>

          <View style={s.field}>
            <Text style={s.label}>Institute / University Name *</Text>
            <TextInput style={s.input} value={institute} onChangeText={setInstitute} placeholder="e.g. FAST NUCES, Lahore" />
          </View>

          <View style={s.row}>
            <View style={[s.field, { flex: 1, marginRight: 8 }]}>
              <Text style={s.label}>Start Date *</Text>
              <TextInput style={s.input} value={startDate} onChangeText={setStartDate} placeholder="2019-09-01" keyboardType="numbers-and-punctuation" />
            </View>
            <View style={[s.field, { flex: 1 }]}>
              <Text style={s.label}>End Date</Text>
              <TextInput style={s.input} value={endDate} onChangeText={setEndDate} placeholder="2023-06-30" keyboardType="numbers-and-punctuation" />
            </View>
          </View>

          <View style={s.field}>
            <Text style={s.label}>Completed?</Text>
            <View style={s.optRow}>
              <TouchableOpacity style={[s.optBtn, isCompleted && s.optActive]} onPress={() => setIsCompleted(true)}>
                <Text style={[s.optText, isCompleted && s.optTextActive]}>✓ Yes, Completed</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[s.optBtn, !isCompleted && s.optActive]} onPress={() => setIsCompleted(false)}>
                <Text style={[s.optText, !isCompleted && s.optTextActive]}>⏳ In Progress</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={s.row}>
            <View style={[s.field, { flex: 1, marginRight: 8 }]}>
              <Text style={s.label}>Score / GPA *</Text>
              <TextInput style={s.input} value={score} onChangeText={setScore} placeholder="3.5 or 82%" keyboardType="decimal-pad" />
              <Text style={s.hint}>CGPA (0–4.0) or Percentage</Text>
            </View>
            <View style={[s.field, { flex: 1 }]}>
              <Text style={s.label}>Backlogs</Text>
              <TextInput style={s.input} value={backlogs} onChangeText={setBacklogs} placeholder="0" keyboardType="number-pad" />
              <Text style={s.hint}>0 if none</Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      <View style={s.bottom}><PrimaryButton title="Continue to Language Test →" onPress={handleNext} /></View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F8FF' },
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 16, paddingHorizontal: 16 },
  backBtn: { minWidth: 64 },
  backText: { color: '#1A237E', fontWeight: '600', fontSize: 14 },
  scroll: { paddingHorizontal: 24, paddingTop: 12, paddingBottom: 20 },
  badge: { fontSize: 12, color: '#1A237E', fontWeight: 'bold', backgroundColor: '#E8EAF6', alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, marginBottom: 10, overflow: 'hidden' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#1A237E', marginBottom: 4 },
  sub: { fontSize: 14, color: '#666', marginBottom: 20 },
  row: { flexDirection: 'row' },
  field: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '600', color: '#1A237E', marginBottom: 6 },
  input: { backgroundColor: '#fff', borderWidth: 1.5, borderColor: '#E0E0E0', borderRadius: 12, padding: 13, fontSize: 15, color: '#333' },
  hint: { fontSize: 11, color: '#999', marginTop: 4, fontStyle: 'italic' },
  pickerBox: { borderWidth: 1.5, borderColor: '#1A237E', borderRadius: 12, backgroundColor: '#fff', overflow: 'hidden' },
  optRow: { flexDirection: 'row', gap: 8 },
  optBtn: { flex: 1, paddingVertical: 12, borderRadius: 10, borderWidth: 1.5, borderColor: '#E0E0E0', alignItems: 'center', backgroundColor: '#fff' },
  optActive: { borderColor: '#1A237E', backgroundColor: '#E8EAF6' },
  optText: { color: '#666', fontWeight: '600', fontSize: 13 },
  optTextActive: { color: '#1A237E', fontWeight: 'bold' },
  bottom: { padding: 20, paddingBottom: 28 },
});