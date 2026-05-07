/**
 * Step 2 — Target Country + Degree Type
 * Saved to draft only (used in assessments later, not directly as a profile API field)
 */
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Picker } from '@react-native-picker/picker';
import PrimaryButton from '../../components/PrimaryButton';
import ProgressDots from '../../components/ProgressDots';
import { saveOnboardingStep, getOnboardingDraft } from '../../services/storage';

const COUNTRIES = [
    { label: '🇺🇸 United States', value: 'USA' },
    { label: '🇬🇧 United Kingdom', value: 'UK' },
    { label: '🇦🇺 Australia', value: 'AU' },
    { label: '🇨🇦 Canada', value: 'CA' },
    { label: '🇩🇪 Germany', value: 'DE' },
];

const DEGREES = [
    { label: '🎓 Masters / Post-Graduate', value: 'Masters' },
    { label: '📚 Bachelors / Under-Graduate', value: 'Bachelors' },
    { label: '🔬 PhD / Doctorate', value: 'PhD' },
    { label: '📜 Diploma / Certificate', value: 'high_school' },
];

export default function Step2_Country({ navigation }) {
    const [country, setCountry] = useState('USA');
    const [degreeType, setDegreeType] = useState('Masters');

    useEffect(() => {
        getOnboardingDraft().then(d => {
            if (d?.target_country) setCountry(d.target_country);
            if (d?.target_degree_type) setDegreeType(d.target_degree_type);
        });
    }, []);

    const handleNext = async () => {
        await saveOnboardingStep(2, { target_country: country, target_degree_type: degreeType });
        navigation.navigate('Step3_Education');
    };

    return (
        <SafeAreaView style={s.container}>
            <View style={s.top}><ProgressDots step={2} total={5} /></View>
            <ScrollView contentContainerStyle={s.scroll}>
                <Text style={s.badge}>Step 2 of 5</Text>
                <Text style={s.title}>Study Destination</Text>
                <Text style={s.sub}>Where and what do you want to study?</Text>

                <View style={s.field}>
                    <Text style={s.label}>Destination Country *</Text>
                    <View style={s.pickerBox}>
                        <Picker selectedValue={country} onValueChange={setCountry} dropdownIconColor="#1A237E">
                            {COUNTRIES.map(c => <Picker.Item key={c.value} label={c.label} value={c.value} color="#000" />)}
                        </Picker>
                    </View>
                </View>

                <View style={s.field}>
                    <Text style={s.label}>Degree Level *</Text>
                    <View style={s.pickerBox}>
                        <Picker selectedValue={degreeType} onValueChange={setDegreeType} dropdownIconColor="#1A237E">
                            {DEGREES.map(d => <Picker.Item key={d.value} label={d.label} value={d.value} color="#000" />)}
                        </Picker>
                    </View>
                </View>

                <View style={s.infoCard}>
                    <Text style={s.infoText}>
                        🎯 Selected: <Text style={{ fontWeight: 'bold' }}>{DEGREES.find(d => d.value === degreeType)?.label}</Text> in <Text style={{ fontWeight: 'bold' }}>{COUNTRIES.find(c => c.value === country)?.label}</Text>
                    </Text>
                </View>
            </ScrollView>
            <View style={s.bottom}><PrimaryButton title="Continue to Education →" onPress={handleNext} /></View>
        </SafeAreaView>
    );
}

const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F5F8FF' },
    top: { alignItems: 'center', marginTop: 16 },
    scroll: { paddingHorizontal: 24, paddingTop: 12, paddingBottom: 20, flexGrow: 1, justifyContent: 'center' },
    badge: { fontSize: 12, color: '#1A237E', fontWeight: 'bold', backgroundColor: '#E8EAF6', alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, marginBottom: 10, overflow: 'hidden' },
    title: { fontSize: 24, fontWeight: 'bold', color: '#1A237E', marginBottom: 4 },
    sub: { fontSize: 14, color: '#666', marginBottom: 24 },
    field: { marginBottom: 20 },
    label: { fontSize: 13, fontWeight: '600', color: '#1A237E', marginBottom: 8 },
    pickerBox: { borderWidth: 1.5, borderColor: '#1A237E', borderRadius: 12, backgroundColor: '#fff', overflow: 'hidden' },
    infoCard: { backgroundColor: '#E8EAF6', borderRadius: 12, padding: 14, marginTop: 8 },
    infoText: { color: '#1A237E', fontSize: 14, lineHeight: 22 },
    bottom: { padding: 20, paddingBottom: 28 },
});