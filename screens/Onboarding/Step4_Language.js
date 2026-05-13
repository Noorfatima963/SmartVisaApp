/**
 * Step 4 — Language Test
 * API: POST /api/profile/language-tests/
 * Required: test_type, overall_score, reading, listening, writing, speaking, test_date, expiry_date
 * test_type choices: ielts | toefl | pte | duolingo | other
 */
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import PrimaryButton from '../../components/PrimaryButton';
import ProgressDots from '../../components/ProgressDots';
import { saveOnboardingStep, getOnboardingDraft } from '../../services/storage';
import api from '../../services/api';

const TEST_TYPES = [
    { label: 'IELTS', value: 'ielts' },
    { label: 'TOEFL', value: 'toefl' },
    { label: 'PTE', value: 'pte' },
    { label: 'Duolingo', value: 'duolingo' },
];

// Score ranges per test type
const RANGES = {
    ielts: { max: 9, sub: 9, placeholder: '6.5', label: 'Band' },
    toefl: { max: 120, sub: 30, placeholder: '90', label: 'Score' },
    pte: { max: 90, sub: 90, placeholder: '65', label: 'Score' },
    duolingo: { max: 160, sub: 160, placeholder: '110', label: 'Score' },
};

export default function Step4_Language({ navigation }) {
    const [testType, setTestType] = useState('ielts');
    const [overall, setOverall] = useState('');
    const [reading, setReading] = useState('');
    const [listening, setListening] = useState('');
    const [writing, setWriting] = useState('');
    const [speaking, setSpeaking] = useState('');
    const [testDate, setTestDate] = useState('');
    const [expiryDate, setExpiryDate] = useState('');
    const [noTest, setNoTest] = useState(false);

    useEffect(() => {
        async function initData() {
            try {
                const d = await getOnboardingDraft();
                let profile = null;
                try {
                    profile = await api.profile.get();
                } catch (e) { console.log('Profile fetch error:', e.message); }

                const lang = profile?.test_scores?.[0] || {};

                const pType = d?.lang_test_type || lang.test_type;
                const pOverall = d?.lang_overall || lang.overall_score;
                const pReading = d?.lang_reading || lang.reading;
                const pListening = d?.lang_listening || lang.listening;
                const pWriting = d?.lang_writing || lang.writing;
                const pSpeaking = d?.lang_speaking || lang.speaking;
                const pTestDate = d?.lang_test_date || lang.test_date;
                const pExpiry = d?.lang_expiry_date || lang.expiry_date;

                if (pType) setTestType(pType);
                if (pOverall) setOverall(pOverall.toString());
                if (pReading) setReading(pReading.toString());
                if (pListening) setListening(pListening.toString());
                if (pWriting) setWriting(pWriting.toString());
                if (pSpeaking) setSpeaking(pSpeaking.toString());
                if (pTestDate) setTestDate(pTestDate);
                if (pExpiry) setExpiryDate(pExpiry);

                if (d?.lang_no_test !== undefined) {
                    setNoTest(d.lang_no_test);
                } else if (lang.test_type) {
                    setNoTest(false);
                }
            } catch (err) { }
        }
        initData();
    }, []);

    // Reset band scores when test type changes
    const handleTestTypeChange = (type) => {
        setTestType(type);
        setOverall(''); setReading(''); setListening(''); setWriting(''); setSpeaking('');
    };

    const handleNext = async () => {
        if (!noTest) {
            if (!overall || !reading || !listening || !writing || !speaking) {
                Alert.alert('Required Fields', 'Please enter all band/section scores.');
                return;
            }
            const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
            if (!testDate || !dateRegex.test(testDate)) {
                Alert.alert('Invalid Date', 'Test date must be YYYY-MM-DD format. e.g. 2024-03-15');
                return;
            }
            if (!expiryDate || !dateRegex.test(expiryDate)) {
                Alert.alert('Invalid Date', 'Expiry date must be YYYY-MM-DD format. e.g. 2026-03-15');
                return;
            }
        }

        await saveOnboardingStep(4, {
            lang_test_type: noTest ? null : testType,
            lang_overall: noTest ? null : parseFloat(overall),
            lang_reading: noTest ? null : parseFloat(reading),
            lang_listening: noTest ? null : parseFloat(listening),
            lang_writing: noTest ? null : parseFloat(writing),
            lang_speaking: noTest ? null : parseFloat(speaking),
            lang_test_date: noTest ? null : testDate,
            lang_expiry_date: noTest ? null : expiryDate,
            lang_no_test: noTest,
        });
        navigation.navigate('Step5_Financial');
    };

    const range = RANGES[testType];

    return (
        <SafeAreaView style={s.container}>
            <View style={s.top}>
              <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
                <Text style={s.backText}>← Back</Text>
              </TouchableOpacity>
              <ProgressDots step={4} total={6} />
              <View style={s.backBtn} />
            </View>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
                    <Text style={s.badge}>Step 4 of 6</Text>
                    <Text style={s.title}>Language Proficiency</Text>
                    <Text style={s.sub}>English test scores for admission</Text>

                    {/* Test Type Selector */}
                    <View style={s.field}>
                        <Text style={s.label}>Select Your Test *</Text>
                        <View style={s.testRow}>
                            {TEST_TYPES.map(t => (
                                <TouchableOpacity
                                    key={t.value}
                                    style={[s.testBtn, testType === t.value && !noTest && s.testActive]}
                                    onPress={() => { handleTestTypeChange(t.value); setNoTest(false); }}
                                >
                                    <Text style={[s.testText, testType === t.value && !noTest && s.testTextActive]}>{t.label}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {!noTest && (
                        <>
                            {/* Overall Score */}
                            <View style={s.field}>
                                <Text style={s.label}>Overall {range.label} * (max {range.max})</Text>
                                <TextInput style={s.input} value={overall} onChangeText={setOverall} placeholder={range.placeholder} keyboardType="decimal-pad" />
                            </View>

                            {/* Band Scores Row 1 */}
                            <Text style={s.label}>Section Scores * (max {range.sub} each)</Text>
                            <View style={s.row}>
                                <View style={[s.field, { flex: 1, marginRight: 6 }]}>
                                    <Text style={s.sublabel}>Reading</Text>
                                    <TextInput style={s.input} value={reading} onChangeText={setReading} placeholder={range.placeholder} keyboardType="decimal-pad" />
                                </View>
                                <View style={[s.field, { flex: 1, marginRight: 6 }]}>
                                    <Text style={s.sublabel}>Listening</Text>
                                    <TextInput style={s.input} value={listening} onChangeText={setListening} placeholder={range.placeholder} keyboardType="decimal-pad" />
                                </View>
                            </View>
                            <View style={s.row}>
                                <View style={[s.field, { flex: 1, marginRight: 6 }]}>
                                    <Text style={s.sublabel}>Writing</Text>
                                    <TextInput style={s.input} value={writing} onChangeText={setWriting} placeholder={range.placeholder} keyboardType="decimal-pad" />
                                </View>
                                <View style={[s.field, { flex: 1 }]}>
                                    <Text style={s.sublabel}>Speaking</Text>
                                    <TextInput style={s.input} value={speaking} onChangeText={setSpeaking} placeholder={range.placeholder} keyboardType="decimal-pad" />
                                </View>
                            </View>

                            {/* Dates */}
                            <View style={s.row}>
                                <View style={[s.field, { flex: 1, marginRight: 8 }]}>
                                    <Text style={s.label}>Test Date *</Text>
                                    <TextInput style={s.input} value={testDate} onChangeText={setTestDate} placeholder="2024-03-15" keyboardType="numbers-and-punctuation" />
                                </View>
                                <View style={[s.field, { flex: 1 }]}>
                                    <Text style={s.label}>Expiry Date *</Text>
                                    <TextInput style={s.input} value={expiryDate} onChangeText={setExpiryDate} placeholder="2026-03-15" keyboardType="numbers-and-punctuation" />
                                </View>
                            </View>
                        </>
                    )}

                    {/* No Test Option */}
                    <TouchableOpacity style={[s.noTestBtn, noTest && s.noTestActive]} onPress={() => setNoTest(!noTest)}>
                        <Text style={[s.noTestText, noTest && s.noTestTextActive]}>
                            {noTest ? '✓  ' : ''}I don't have a language test yet
                        </Text>
                    </TouchableOpacity>
                    {noTest && <Text style={s.hint}>You can add it later from your profile. Results may be limited.</Text>}

                </ScrollView>
            </KeyboardAvoidingView>
            <View style={s.bottom}><PrimaryButton title="Continue to Financial →" onPress={handleNext} /></View>
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
    field: { marginBottom: 14 },
    label: { fontSize: 13, fontWeight: '600', color: '#1A237E', marginBottom: 6 },
    sublabel: { fontSize: 12, fontWeight: '600', color: '#555', marginBottom: 5 },
    input: { backgroundColor: '#fff', borderWidth: 1.5, borderColor: '#E0E0E0', borderRadius: 12, padding: 13, fontSize: 15, color: '#333' },
    hint: { fontSize: 12, color: '#999', marginTop: 6, textAlign: 'center', fontStyle: 'italic' },
    testRow: { flexDirection: 'row', gap: 8 },
    testBtn: { flex: 1, paddingVertical: 11, borderRadius: 10, borderWidth: 1.5, borderColor: '#E0E0E0', alignItems: 'center', backgroundColor: '#fff' },
    testActive: { borderColor: '#1A237E', backgroundColor: '#E8EAF6' },
    testText: { color: '#666', fontWeight: '600', fontSize: 13 },
    testTextActive: { color: '#1A237E', fontWeight: 'bold' },
    noTestBtn: { paddingVertical: 14, borderRadius: 12, borderWidth: 1.5, borderColor: '#E0E0E0', alignItems: 'center', backgroundColor: '#fff', marginTop: 8 },
    noTestActive: { borderColor: '#1A237E', backgroundColor: '#E8EAF6' },
    noTestText: { color: '#666', fontWeight: '600' },
    noTestTextActive: { color: '#1A237E', fontWeight: 'bold' },
    bottom: { padding: 20, paddingBottom: 28 },
});