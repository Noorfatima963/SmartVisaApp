/**
 * Step 1 — Personal Info
 * API: PATCH /api/profile/
 */
import React, { useState, useEffect } from 'react';
import {
    View, Text, TextInput, StyleSheet, ScrollView,
    KeyboardAvoidingView, Platform, TouchableOpacity, Alert, Modal
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import PrimaryButton from '../../components/PrimaryButton';
import ProgressDots from '../../components/ProgressDots';
import { saveOnboardingStep, getOnboardingDraft } from '../../services/storage';
import api from '../../services/api';

const GENDERS = [
    { label: 'Male', value: 'M' },
    { label: 'Female', value: 'F' },
    { label: 'Other', value: 'O' },
];

// Format Date object → "YYYY-MM-DD"
function formatDate(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

// Format Date object → "DD MMM YYYY" for display
function displayDate(date) {
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function Step1_PersonalInfo({ navigation }) {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [gender, setGender] = useState('M');
    const [dob, setDob] = useState(null);       // Date object
    const [showPicker, setShowPicker] = useState(false);
    const [nationality, setNationality] = useState('Pakistani');
    const [residenceCountry, setResidenceCountry] = useState('Pakistan');
    const [city, setCity] = useState('');
    const [address, setAddress] = useState('');

    // Max selectable date = 10 years ago (min age)
    const maxDate = new Date();
    maxDate.setFullYear(maxDate.getFullYear() - 10);

    // Min selectable date = 100 years ago
    const minDate = new Date();
    minDate.setFullYear(minDate.getFullYear() - 100);

    useEffect(() => {
        async function initData() {
            try {
                // 1. Fetch local draft (preserves unsaved work if they backed out)
                const d = await getOnboardingDraft();

                // 2. Fetch backend profile to pre-fill names
                let profile = null;
                try {
                    profile = await api.profile.get();
                    console.log('=== PROFILE FETCH ===', JSON.stringify(profile));
                } catch (e) {
                    console.log('Profile fetch err:', e.message);
                }

                // 3. Fallback logic: Draft -> Profile -> Profile.user -> empty
                const fName = d?.first_name || profile?.first_name || profile?.user?.first_name || '';
                const lName = d?.last_name || profile?.last_name || profile?.user?.last_name || '';
                const pGender = d?.gender || profile?.gender || 'M';
                const pDob = d?.date_of_birth || profile?.date_of_birth;
                const pNat = d?.nationality || profile?.nationality || 'Pakistani';
                const pRes = d?.residence_country || profile?.residence_country || 'Pakistan';
                const pCity = d?.city || profile?.city || '';
                const pAddr = d?.address_line1 || profile?.address_line1 || '';

                if (fName) setFirstName(fName);
                if (lName) setLastName(lName);
                if (pGender) setGender(pGender);
                if (pDob) setDob(new Date(pDob));
                if (pNat) setNationality(pNat);
                if (pRes) setResidenceCountry(pRes);
                if (pCity) setCity(pCity);
                if (pAddr) setAddress(pAddr);
            } catch (err) {
                console.log('Init err:', err);
            }
        }
        initData();
    }, []);

    const onDateChange = (event, selectedDate) => {
        // On Android the picker closes itself; on iOS we keep it open
        if (Platform.OS === 'android') setShowPicker(false);
        if (event.type === 'dismissed') return;
        if (selectedDate) setDob(selectedDate);
    };

    const handleNext = async () => {
        if (!firstName.trim() || !lastName.trim() || !nationality.trim() || !city.trim() || !address.trim()) {
            Alert.alert('Required Fields', 'Please fill in all fields marked with *');
            return;
        }
        await saveOnboardingStep(1, {
            first_name: firstName.trim(),
            last_name: lastName.trim(),
            gender,
            date_of_birth: dob ? formatDate(dob) : null,
            nationality: nationality.trim(),
            residence_country: residenceCountry.trim(),
            city: city.trim(),
            address_line1: address.trim(),
        });
        navigation.navigate('Step2_Country');
    };

    return (
        <SafeAreaView style={s.container}>
            <View style={s.top}><ProgressDots step={1} total={5} /></View>

            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

                    <Text style={s.badge}>Step 1 of 5</Text>
                    <Text style={s.title}>Personal Information</Text>
                    <Text style={s.sub}>Basic details for your visa profile</Text>

                    {/* Name Row */}
                    <View style={s.row}>
                        <View style={[s.field, { flex: 1, marginRight: 8 }]}>
                            <Text style={s.label}>First Name *</Text>
                            <TextInput style={s.input} value={firstName} onChangeText={setFirstName} placeholder="Ali" autoCapitalize="words" />
                        </View>
                        <View style={[s.field, { flex: 1 }]}>
                            <Text style={s.label}>Last Name *</Text>
                            <TextInput style={s.input} value={lastName} onChangeText={setLastName} placeholder="Khan" autoCapitalize="words" />
                        </View>
                    </View>

                    {/* Gender */}
                    <View style={s.field}>
                        <Text style={s.label}>Gender *</Text>
                        <View style={s.optRow}>
                            {GENDERS.map(g => (
                                <TouchableOpacity
                                    key={g.value}
                                    style={[s.optBtn, gender === g.value && s.optActive]}
                                    onPress={() => setGender(g.value)}
                                >
                                    <Text style={[s.optText, gender === g.value && s.optTextActive]}>{g.label}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* Date of Birth — Calendar Picker */}
                    <View style={s.field}>
                        <Text style={s.label}>Date of Birth</Text>
                        <TouchableOpacity style={s.dateBtn} onPress={() => setShowPicker(true)} activeOpacity={0.7}>
                            <Text style={s.dateIcon}>📅</Text>
                            <Text style={[s.dateText, !dob && s.datePlaceholder]}>
                                {dob ? displayDate(dob) : 'Select your date of birth'}
                            </Text>
                            <Text style={s.dateArrow}>›</Text>
                        </TouchableOpacity>

                        {/* Android — inline picker shown conditionally */}
                        {showPicker && Platform.OS === 'android' && (
                            <DateTimePicker
                                value={dob || maxDate}
                                mode="date"
                                display="calendar"
                                maximumDate={maxDate}
                                minimumDate={minDate}
                                onChange={onDateChange}
                            />
                        )}

                        {/* iOS — shown in a modal with a Done button */}
                        {Platform.OS === 'ios' && (
                            <Modal visible={showPicker} transparent animationType="slide">
                                <View style={s.modalOverlay}>
                                    <View style={s.modalSheet}>
                                        <View style={s.modalHeader}>
                                            <Text style={s.modalTitle}>Date of Birth</Text>
                                            <TouchableOpacity onPress={() => setShowPicker(false)}>
                                                <Text style={s.modalDone}>Done</Text>
                                            </TouchableOpacity>
                                        </View>
                                        <DateTimePicker
                                            value={dob || maxDate}
                                            mode="date"
                                            display="spinner"
                                            maximumDate={maxDate}
                                            minimumDate={minDate}
                                            onChange={onDateChange}
                                            style={{ width: '100%' }}
                                        />
                                    </View>
                                </View>
                            </Modal>
                        )}
                    </View>

                    {/* Nationality */}
                    <View style={s.field}>
                        <Text style={s.label}>Nationality *</Text>
                        <TextInput style={s.input} value={nationality} onChangeText={setNationality} placeholder="Pakistani" />
                    </View>

                    {/* Country of Residence */}
                    <View style={s.field}>
                        <Text style={s.label}>Country of Residence *</Text>
                        <TextInput style={s.input} value={residenceCountry} onChangeText={setResidenceCountry} placeholder="Pakistan" />
                    </View>

                    {/* City */}
                    <View style={s.field}>
                        <Text style={s.label}>City *</Text>
                        <TextInput style={s.input} value={city} onChangeText={setCity} placeholder="Lahore" />
                    </View>

                    {/* Address */}
                    <View style={s.field}>
                        <Text style={s.label}>Address *</Text>
                        <TextInput style={s.input} value={address} onChangeText={setAddress} placeholder="House 12, Street 4, Gulberg" />
                    </View>

                </ScrollView>
            </KeyboardAvoidingView>

            <View style={s.bottom}>
                <PrimaryButton title="Continue to Target Country →" onPress={handleNext} />
            </View>
        </SafeAreaView>
    );
}

const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F5F8FF' },
    top: { alignItems: 'center', marginTop: 16 },
    scroll: { paddingHorizontal: 24, paddingTop: 12, paddingBottom: 20 },
    badge: { fontSize: 12, color: '#1A237E', fontWeight: 'bold', backgroundColor: '#E8EAF6', alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, marginBottom: 10, overflow: 'hidden' },
    title: { fontSize: 24, fontWeight: 'bold', color: '#1A237E', marginBottom: 4 },
    sub: { fontSize: 14, color: '#666', marginBottom: 20 },
    row: { flexDirection: 'row' },
    field: { marginBottom: 16 },
    label: { fontSize: 13, fontWeight: '600', color: '#1A237E', marginBottom: 6 },
    input: { backgroundColor: '#fff', borderWidth: 1.5, borderColor: '#E0E0E0', borderRadius: 12, padding: 13, fontSize: 15, color: '#333' },

    // Gender selector
    optRow: { flexDirection: 'row', gap: 8 },
    optBtn: { flex: 1, paddingVertical: 12, borderRadius: 10, borderWidth: 1.5, borderColor: '#E0E0E0', alignItems: 'center', backgroundColor: '#fff' },
    optActive: { borderColor: '#1A237E', backgroundColor: '#E8EAF6' },
    optText: { color: '#666', fontWeight: '600' },
    optTextActive: { color: '#1A237E', fontWeight: 'bold' },

    // Date button
    dateBtn: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
        borderWidth: 1.5, borderColor: '#E0E0E0', borderRadius: 12, padding: 13,
    },
    dateIcon: { fontSize: 18, marginRight: 10 },
    dateText: { flex: 1, fontSize: 15, color: '#333', fontWeight: '500' },
    datePlaceholder: { color: '#aaa', fontWeight: '400' },
    dateArrow: { fontSize: 20, color: '#999' },

    // iOS modal
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
    modalSheet: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingBottom: 30 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
    modalTitle: { fontSize: 17, fontWeight: 'bold', color: '#1A237E' },
    modalDone: { fontSize: 16, color: '#1A237E', fontWeight: 'bold' },

    bottom: { padding: 20, paddingBottom: 28 },
});