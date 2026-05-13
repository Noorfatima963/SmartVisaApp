import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, Alert, ActivityIndicator, KeyboardAvoidingView,
  Platform, Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Picker } from '@react-native-picker/picker';
import DOBPicker from '../components/DOBPicker';
import api from '../services/api';

// ─── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(date) {
  if (!date) return '';
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function displayDate(date) {
  if (!date) return '';
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function parseDateStr(str) {
  if (!str) return null;
  const d = new Date(str);
  return isNaN(d.getTime()) ? null : d;
}

// ─── Shared UI pieces ──────────────────────────────────────────────────────────

function Field({ label, children }) {
  return (
    <View style={s.field}>
      <Text style={s.label}>{label}</Text>
      {children}
    </View>
  );
}

function Inp(props) {
  return <TextInput style={s.input} placeholderTextColor="#AAA" color="#333" {...props} />;
}

function SectionTitle({ title }) {
  return <Text style={s.sectionTitle}>{title}</Text>;
}

function SaveBtn({ onPress, loading, title = 'Save Changes' }) {
  return (
    <TouchableOpacity style={[s.saveBtn, loading && { opacity: 0.6 }]} onPress={onPress} disabled={loading}>
      {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.saveBtnText}>{title}</Text>}
    </TouchableOpacity>
  );
}

// DOBPicker trigger button — only used for Date of Birth (DOBPicker year range = past)
function DobButton({ date, onPress }) {
  return (
    <Field label="Date of Birth">
      <TouchableOpacity style={s.dateBtn} onPress={onPress} activeOpacity={0.7}>
        <Text style={s.dateBtnIcon}>📅</Text>
        <Text style={[s.dateBtnText, !date && s.datePlaceholder]}>
          {date ? displayDate(date) : 'Select date of birth'}
        </Text>
        <Text style={s.dateBtnArrow}>›</Text>
      </TouchableOpacity>
    </Field>
  );
}

// Plain text date input — used for passport expiry, education dates, travel dates
// (avoids Picker year-range crash on Android new arch)
function DateInp({ label, value, onChangeText }) {
  return (
    <Field label={label}>
      <Inp placeholder="YYYY-MM-DD" value={value} onChangeText={onChangeText} keyboardType="numeric" maxLength={10} />
    </Field>
  );
}

function Toggle({ label, value, onValueChange }) {
  return (
    <View style={s.toggleRow}>
      <Text style={s.toggleLabel}>{label}</Text>
      <Switch value={value} onValueChange={onValueChange}
        trackColor={{ false: '#E0E0E0', true: '#1A237E' }}
        thumbColor={value ? '#FFD700' : '#fff'} />
    </View>
  );
}

function EmptyState({ message }) {
  return (
    <View style={s.emptyState}>
      <Text style={s.emptyText}>{message}</Text>
    </View>
  );
}

function DelBtn({ onPress }) {
  return (
    <TouchableOpacity style={s.deleteBtn} onPress={onPress}>
      <Text style={s.deleteBtnText}>Delete</Text>
    </TouchableOpacity>
  );
}

// ─── TABS ──────────────────────────────────────────────────────────────────────

const TABS = [
  { id: 'bio', label: 'Bio' },
  { id: 'education', label: 'Education' },
  { id: 'language', label: 'Language' },
  { id: 'travel', label: 'Travel' },
  { id: 'finance', label: 'Finance' },
];

// ─── BIO TAB ───────────────────────────────────────────────────────────────────

// profileData is loaded once by ProfileEditScreen and passed down.
// onSaved triggers a profile refresh in the parent.
function BioTab({ profileData, loading, onSaved }) {
  const [saving, setSaving] = useState(false);
  const [dobVisible, setDobVisible] = useState(false);
  const [dob, setDob] = useState(null);
  const [passportExpiryStr, setPassportExpiryStr] = useState('');
  const [form, setForm] = useState({
    first_name: '', last_name: '',
    gender: 'M', marital_status: 'single',
    nationality: '', residence_country: '', city: '', address_line1: '',
    passport_number: '',
    target_country: '', target_degree_type: 'masters',
    profession_title: '', current_employer: '', years_of_experience: '',
    has_travel_history: false, has_additional_residency: false,
    has_additional_passport: false, has_visa_refusal_history: false,
  });

  useEffect(() => {
    if (!profileData) return;
    const firstName = profileData.first_name || profileData.user?.first_name || '';
    const lastName  = profileData.last_name  || profileData.user?.last_name  || '';
    setForm({
      first_name: firstName,
      last_name: lastName,
      gender: profileData.gender || 'M',
      marital_status: profileData.marital_status || 'single',
      nationality: profileData.nationality || '',
      residence_country: profileData.residence_country || '',
      city: profileData.city || '',
      address_line1: profileData.address_line1 || '',
      passport_number: profileData.passport_number || '',
      target_country: profileData.target_country || '',
      target_degree_type: profileData.target_degree_type || 'masters',
      profession_title: profileData.profession_title || '',
      current_employer: profileData.current_employer || '',
      years_of_experience: profileData.years_of_experience != null ? String(profileData.years_of_experience) : '',
      has_travel_history: !!profileData.has_travel_history,
      has_additional_residency: !!profileData.has_additional_residency,
      has_additional_passport: !!profileData.has_additional_passport,
      has_visa_refusal_history: !!profileData.has_visa_refusal_history,
    });
    setDob(parseDateStr(profileData.date_of_birth));
    setPassportExpiryStr(profileData.passport_expiry_date || '');
  }, [profileData]);

  async function save() {
    if (!form.first_name.trim() || !form.last_name.trim()) {
      Alert.alert('Required', 'First name and last name are required.');
      return;
    }
    setSaving(true);
    try {
      await api.profile.update({
        ...form,
        date_of_birth: dob ? formatDate(dob) : null,
        passport_expiry_date: passportExpiryStr.trim() || null,
        passport_number: form.passport_number.trim() || null,
        years_of_experience: form.years_of_experience ? Number(form.years_of_experience) : 0,
      });
      Alert.alert('Saved', 'Bio data updated successfully.');
      if (onSaved) onSaved();
    } catch (e) {
      console.error('[ProfileEdit] save error:', e);
      Alert.alert('Error', e.message || 'Failed to save.');
    } finally {
      setSaving(false);
    }
  }

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  if (loading) return <ActivityIndicator size="large" color="#1A237E" style={{ marginTop: 40 }} />;

  return (
    <View>
      <SectionTitle title="Personal Details" />

      <View style={s.row}>
        <View style={{ flex: 1, marginRight: 8 }}>
          <Field label="First Name *">
            <Inp value={form.first_name} onChangeText={v => set('first_name', v)} placeholder="Ali" autoCapitalize="words" />
          </Field>
        </View>
        <View style={{ flex: 1 }}>
          <Field label="Last Name *">
            <Inp value={form.last_name} onChangeText={v => set('last_name', v)} placeholder="Khan" autoCapitalize="words" />
          </Field>
        </View>
      </View>

      <Field label="Gender">
        <View style={s.optRow}>
          {[['Male', 'M'], ['Female', 'F'], ['Other', 'O']].map(([lbl, val]) => (
            <TouchableOpacity key={val} style={[s.optBtn, form.gender === val && s.optActive]} onPress={() => set('gender', val)}>
              <Text style={[s.optText, form.gender === val && s.optTextActive]}>{lbl}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </Field>

      <Field label="Marital Status">
        <View style={s.pickerWrap}>
          <Picker selectedValue={form.marital_status} onValueChange={v => set('marital_status', v)} style={s.picker}>
            <Picker.Item label="Single" value="single" />
            <Picker.Item label="Married" value="married" />
          </Picker>
        </View>
      </Field>

      {/* DOB uses DOBPicker — years are in the past, safe */}
      <DobButton date={dob} onPress={() => setDobVisible(true)} />
      <DOBPicker visible={dobVisible} onClose={() => setDobVisible(false)}
        onSave={d => { setDob(d); setDobVisible(false); }} initialDate={dob} />

      <SectionTitle title="Location & Passport" />

      <Field label="Nationality">
        <Inp value={form.nationality} onChangeText={v => set('nationality', v)} placeholder="Pakistani" />
      </Field>
      <Field label="Country of Residence">
        <Inp value={form.residence_country} onChangeText={v => set('residence_country', v)} placeholder="Pakistan" />
      </Field>
      <Field label="City">
        <Inp value={form.city} onChangeText={v => set('city', v)} placeholder="Lahore" />
      </Field>
      <Field label="Address">
        <Inp value={form.address_line1} onChangeText={v => set('address_line1', v)} placeholder="House 12, Street 4" />
      </Field>
      <Field label="Passport Number">
        <Inp value={form.passport_number} onChangeText={v => set('passport_number', v)} placeholder="AB1234567" autoCapitalize="characters" />
      </Field>

      {/* Passport expiry uses text input — avoids Picker crash with future years */}
      <DateInp label="Passport Expiry" value={passportExpiryStr} onChangeText={setPassportExpiryStr} />

      <SectionTitle title="Study Goal" />

      <Field label="Target Country">
        <Inp value={form.target_country} onChangeText={v => set('target_country', v)} placeholder="e.g. USA, UK, Canada" />
      </Field>
      <Field label="Target Degree">
        <View style={s.pickerWrap}>
          <Picker selectedValue={form.target_degree_type} onValueChange={v => set('target_degree_type', v)} style={s.picker}>
            <Picker.Item label="Bachelors / Under-Graduate" value="bachelors" />
            <Picker.Item label="Masters / Post-Graduate" value="masters" />
            <Picker.Item label="PhD / Doctorate" value="phd" />
          </Picker>
        </View>
      </Field>

      <SectionTitle title="Professional Info" />

      <Field label="Job Title / Profession">
        <Inp value={form.profession_title} onChangeText={v => set('profession_title', v)} placeholder="Software Engineer" />
      </Field>
      <Field label="Current Employer">
        <Inp value={form.current_employer} onChangeText={v => set('current_employer', v)} placeholder="Company Name" />
      </Field>
      <Field label="Years of Experience">
        <Inp value={form.years_of_experience} onChangeText={v => set('years_of_experience', v)} placeholder="0" keyboardType="numeric" />
      </Field>

      <SectionTitle title="Background Flags" />

      <Toggle label="I have travel history" value={form.has_travel_history} onValueChange={v => set('has_travel_history', v)} />
      <Toggle label="I have another residency" value={form.has_additional_residency} onValueChange={v => set('has_additional_residency', v)} />
      <Toggle label="I have a second passport" value={form.has_additional_passport} onValueChange={v => set('has_additional_passport', v)} />
      <Toggle label="I have visa refusal history" value={form.has_visa_refusal_history} onValueChange={v => set('has_visa_refusal_history', v)} />

      <SaveBtn onPress={save} loading={saving} />
    </View>
  );
}

// ─── EDUCATION TAB ─────────────────────────────────────────────────────────────

const EDU_BLANK = { level: 'bachelors', degree_title: '', institute_name: '', score: '', start_date: '', end_date: '' };

function EducationTab() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(EDU_BLANK);

  useEffect(() => { load(); }, []);

  async function load() {
    try { setItems(await api.profile.getEducation()); }
    catch (e) { console.error('[Education] load:', e); Alert.alert('Error', `Failed to load education: ${e.message}`); }
    finally { setLoading(false); }
  }

  async function handleSave() {
    if (!form.degree_title.trim() || !form.institute_name.trim() || !form.start_date) {
      Alert.alert('Required', 'Degree title, institute and start date are required.');
      return;
    }
    setSaving(true);
    try {
      const item = await api.profile.saveEducation({ ...form, is_completed: true });
      setItems(p => [...p, item]);
      setForm(EDU_BLANK);
      setShowForm(false);
    } catch (e) {
      console.error('[Education] save:', e);
      Alert.alert('Error', e.message || 'Failed to save.');
    } finally { setSaving(false); }
  }

  async function handleDelete(id) {
    Alert.alert('Delete', 'Remove this education record?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try { await api.profile.deleteEducation(id); setItems(p => p.filter(i => i.id !== id)); }
        catch (e) { Alert.alert('Error', 'Failed to delete.'); }
      }},
    ]);
  }

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  if (loading) return <ActivityIndicator size="large" color="#1A237E" style={{ marginTop: 40 }} />;

  return (
    <View>
      <View style={s.listHeader}>
        <Text style={s.listTitle}>Education History</Text>
        <TouchableOpacity style={s.addBtn} onPress={() => setShowForm(v => !v)}>
          <Text style={s.addBtnText}>{showForm ? 'Cancel' : '+ Add'}</Text>
        </TouchableOpacity>
      </View>

      {showForm && (
        <View style={s.formCard}>
          <Field label="Level">
            <View style={s.pickerWrap}>
              <Picker selectedValue={form.level} onValueChange={v => set('level', v)} style={s.picker}>
                <Picker.Item label="Matric / O-Levels" value="high_school" />
                <Picker.Item label="Intermediate / A-Levels" value="high_school" />
                <Picker.Item label="Bachelors" value="bachelors" />
                <Picker.Item label="Masters" value="masters" />
                <Picker.Item label="PhD" value="phd" />
              </Picker>
            </View>
          </Field>
          <Field label="Degree Title *">
            <Inp value={form.degree_title} onChangeText={v => set('degree_title', v)} placeholder="BS Computer Science" />
          </Field>
          <Field label="Institute Name *">
            <Inp value={form.institute_name} onChangeText={v => set('institute_name', v)} placeholder="University of Lahore" />
          </Field>
          <Field label="CGPA / Percentage">
            <Inp value={form.score} onChangeText={v => set('score', v)} placeholder="3.5 or 85%" keyboardType="decimal-pad" />
          </Field>
          <View style={s.row}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <DateInp label="Start Date *" value={form.start_date} onChangeText={v => set('start_date', v)} />
            </View>
            <View style={{ flex: 1 }}>
              <DateInp label="End Date" value={form.end_date} onChangeText={v => set('end_date', v)} />
            </View>
          </View>
          <SaveBtn onPress={handleSave} loading={saving} title="Save Education" />
        </View>
      )}

      {items.length === 0
        ? <EmptyState message="No education records added yet." />
        : items.map(item => (
          <View key={item.id} style={s.card}>
            <View style={s.cardLeft}>
              <Text style={s.cardIcon}>🎓</Text>
              <View style={{ flex: 1 }}>
                <Text style={s.cardTitle}>{item.degree_title}</Text>
                <Text style={s.cardSub}>{item.institute_name}</Text>
                <Text style={s.cardMeta}>{item.level?.replace('_', ' ')} · {item.start_date} – {item.end_date}</Text>
                {item.score ? <Text style={s.cardMeta}>Score: {item.score}</Text> : null}
              </View>
            </View>
            <DelBtn onPress={() => handleDelete(item.id)} />
          </View>
        ))
      }
    </View>
  );
}

// ─── LANGUAGE TAB ──────────────────────────────────────────────────────────────

const LANG_BLANK = { test_type: 'ielts', test_date: '', expiry_date: '', overall_score: '', reading: '', listening: '', speaking: '', writing: '' };

function LanguageTab() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(LANG_BLANK);

  useEffect(() => { load(); }, []);

  async function load() {
    try { setItems(await api.profile.getLanguageTests()); }
    catch (e) { console.error('[Language] load:', e); Alert.alert('Error', `Failed to load tests: ${e.message}`); }
    finally { setLoading(false); }
  }

  async function handleSave() {
    if (!form.overall_score || !form.test_date || !form.expiry_date) {
      Alert.alert('Required', 'Overall score, test date and expiry date are required.');
      return;
    }
    setSaving(true);
    try {
      const item = await api.profile.saveLanguage({
        ...form,
        overall_score: parseFloat(form.overall_score) || 0,
        reading: form.reading ? parseFloat(form.reading) : null,
        listening: form.listening ? parseFloat(form.listening) : null,
        speaking: form.speaking ? parseFloat(form.speaking) : null,
        writing: form.writing ? parseFloat(form.writing) : null,
      });
      setItems(p => [...p, item]);
      setForm(LANG_BLANK);
      setShowForm(false);
    } catch (e) {
      console.error('[Language] save:', e);
      Alert.alert('Error', e.message || 'Failed to save.');
    } finally { setSaving(false); }
  }

  async function handleDelete(id) {
    Alert.alert('Delete', 'Remove this test record?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try { await api.profile.deleteLanguageTest(id); setItems(p => p.filter(i => i.id !== id)); }
        catch (e) { Alert.alert('Error', 'Failed to delete.'); }
      }},
    ]);
  }

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  if (loading) return <ActivityIndicator size="large" color="#1A237E" style={{ marginTop: 40 }} />;

  return (
    <View>
      <View style={s.listHeader}>
        <Text style={s.listTitle}>Language Tests</Text>
        <TouchableOpacity style={s.addBtn} onPress={() => setShowForm(v => !v)}>
          <Text style={s.addBtnText}>{showForm ? 'Cancel' : '+ Add'}</Text>
        </TouchableOpacity>
      </View>

      {showForm && (
        <View style={s.formCard}>
          <Field label="Test Type">
            <View style={s.pickerWrap}>
              <Picker selectedValue={form.test_type} onValueChange={v => set('test_type', v)} style={s.picker}>
                <Picker.Item label="IELTS" value="ielts" />
                <Picker.Item label="TOEFL" value="toefl" />
                <Picker.Item label="PTE" value="pte" />
                <Picker.Item label="Duolingo" value="duolingo" />
                <Picker.Item label="Other" value="other" />
              </Picker>
            </View>
          </Field>
          <View style={s.row}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <DateInp label="Test Date *" value={form.test_date} onChangeText={v => set('test_date', v)} />
            </View>
            <View style={{ flex: 1 }}>
              <DateInp label="Expiry Date *" value={form.expiry_date} onChangeText={v => set('expiry_date', v)} />
            </View>
          </View>
          <SectionTitle title="Scores" />
          <View style={s.row}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Field label="Overall *"><Inp value={form.overall_score} onChangeText={v => set('overall_score', v)} placeholder="6.5" keyboardType="decimal-pad" /></Field>
            </View>
            <View style={{ flex: 1 }}>
              <Field label="Reading"><Inp value={form.reading} onChangeText={v => set('reading', v)} placeholder="6.0" keyboardType="decimal-pad" /></Field>
            </View>
          </View>
          <View style={s.row}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Field label="Listening"><Inp value={form.listening} onChangeText={v => set('listening', v)} placeholder="6.5" keyboardType="decimal-pad" /></Field>
            </View>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Field label="Speaking"><Inp value={form.speaking} onChangeText={v => set('speaking', v)} placeholder="6.0" keyboardType="decimal-pad" /></Field>
            </View>
            <View style={{ flex: 1 }}>
              <Field label="Writing"><Inp value={form.writing} onChangeText={v => set('writing', v)} placeholder="6.0" keyboardType="decimal-pad" /></Field>
            </View>
          </View>
          <SaveBtn onPress={handleSave} loading={saving} title="Save Test Score" />
        </View>
      )}

      {items.length === 0
        ? <EmptyState message="No language tests added yet." />
        : items.map(item => (
          <View key={item.id} style={s.card}>
            <View style={s.cardLeft}>
              <Text style={s.cardIcon}>🌍</Text>
              <View style={{ flex: 1 }}>
                <Text style={s.cardTitle}>{String(item.test_type || '').toUpperCase()} — {item.overall_score}</Text>
                <Text style={s.cardMeta}>Expires: {item.expiry_date}</Text>
                <View style={s.scoreRow}>
                  {['reading', 'listening', 'speaking', 'writing'].map(k =>
                    item[k] != null
                      ? <Text key={k} style={s.scoreChip}>{k[0].toUpperCase()}: {item[k]}</Text>
                      : null
                  )}
                </View>
              </View>
            </View>
            <DelBtn onPress={() => handleDelete(item.id)} />
          </View>
        ))
      }
    </View>
  );
}

// ─── TRAVEL TAB ────────────────────────────────────────────────────────────────

const TRAVEL_BLANK = { country: '', visa_type: '', from_date: '', to_date: '', notes: '' };

function TravelTab() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(TRAVEL_BLANK);
  const [isRefusal, setIsRefusal] = useState(false);
  const [isOverstay, setIsOverstay] = useState(false);

  useEffect(() => { load(); }, []);

  async function load() {
    try { setItems(await api.profile.getTravelHistory()); }
    catch (e) { console.error('[Travel] load:', e); Alert.alert('Error', `Failed to load travel history: ${e.message}`); }
    finally { setLoading(false); }
  }

  async function handleSave() {
    if (!form.country.trim() || !form.from_date || !form.to_date) {
      Alert.alert('Required', 'Country, arrival date and departure date are required.');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...form,
        refusal_or_overstay: isRefusal || isOverstay,
        notes: (isRefusal ? 'Refused. ' : '') + (isOverstay ? 'Overstayed. ' : '') + form.notes,
      };
      const item = await api.profile.addTravelHistory(payload);
      setItems(p => [...p, item]);
      setForm(TRAVEL_BLANK);
      setIsRefusal(false);
      setIsOverstay(false);
      setShowForm(false);
    } catch (e) {
      console.error('[Travel] save:', e);
      Alert.alert('Error', e.message || 'Failed to save.');
    } finally { setSaving(false); }
  }

  async function handleDelete(id) {
    Alert.alert('Delete', 'Remove this travel record?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try { await api.profile.deleteTravelHistory(id); setItems(p => p.filter(i => i.id !== id)); }
        catch (e) { Alert.alert('Error', 'Failed to delete.'); }
      }},
    ]);
  }

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  if (loading) return <ActivityIndicator size="large" color="#1A237E" style={{ marginTop: 40 }} />;

  return (
    <View>
      <View style={s.listHeader}>
        <Text style={s.listTitle}>Travel History</Text>
        <TouchableOpacity style={s.addBtn} onPress={() => setShowForm(v => !v)}>
          <Text style={s.addBtnText}>{showForm ? 'Cancel' : '+ Add'}</Text>
        </TouchableOpacity>
      </View>

      {showForm && (
        <View style={s.formCard}>
          <Field label="Country *">
            <Inp value={form.country} onChangeText={v => set('country', v)} placeholder="United States" />
          </Field>
          <Field label="Visa Type">
            <Inp value={form.visa_type} onChangeText={v => set('visa_type', v)} placeholder="e.g. B1/B2, F-1, Student" />
          </Field>
          <View style={s.row}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <DateInp label="Arrival Date *" value={form.from_date} onChangeText={v => set('from_date', v)} />
            </View>
            <View style={{ flex: 1 }}>
              <DateInp label="Departure Date *" value={form.to_date} onChangeText={v => set('to_date', v)} />
            </View>
          </View>
          <Toggle label="Was this visa refused?" value={isRefusal} onValueChange={setIsRefusal} />
          <Toggle label="Did you overstay?" value={isOverstay} onValueChange={setIsOverstay} />
          <SaveBtn onPress={handleSave} loading={saving} title="Save Travel Record" />
        </View>
      )}

      {items.length === 0
        ? <EmptyState message="No travel records added yet." />
        : items.map(item => (
          <View key={item.id} style={s.card}>
            <View style={s.cardLeft}>
              <Text style={s.cardIcon}>✈️</Text>
              <View style={{ flex: 1 }}>
                <Text style={s.cardTitle}>{item.country}</Text>
                <Text style={s.cardSub}>{item.visa_type}</Text>
                <Text style={s.cardMeta}>{item.from_date} → {item.to_date}</Text>
                {item.refusal_or_overstay && <Text style={s.issueBadge}>Issue Reported</Text>}
              </View>
            </View>
            <DelBtn onPress={() => handleDelete(item.id)} />
          </View>
        ))
      }
    </View>
  );
}

// ─── FINANCE TAB ───────────────────────────────────────────────────────────────

function FinanceTab() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    current_monthly_income: '', approx_savings: '', income_source: '',
    has_sponsor: false, sponsor_name: '', sponsor_relationship: '',
  });

  useEffect(() => { load(); }, []);

  async function load() {
    try {
      const data = await api.profile.getFinancialProfile();
      setForm({
        current_monthly_income: data.current_monthly_income != null ? String(data.current_monthly_income) : '',
        approx_savings: data.approx_savings != null ? String(data.approx_savings) : '',
        income_source: data.income_source || '',
        has_sponsor: !!data.has_sponsor,
        sponsor_name: data.sponsor_name || '',
        sponsor_relationship: data.sponsor_relationship || '',
      });
    } catch (e) {
      console.error('[Finance] load:', e);
      Alert.alert('Error', `Failed to load financial info: ${e.message}`);
    } finally { setLoading(false); }
  }

  async function save() {
    setSaving(true);
    try {
      await api.profile.saveFinancial({
        ...form,
        current_monthly_income: form.current_monthly_income ? parseFloat(form.current_monthly_income) : null,
        approx_savings: form.approx_savings ? parseFloat(form.approx_savings) : null,
      });
      Alert.alert('Saved', 'Financial profile updated successfully.');
    } catch (e) {
      console.error('[Finance] save:', e);
      Alert.alert('Error', e.message || 'Failed to save.');
    } finally { setSaving(false); }
  }

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  if (loading) return <ActivityIndicator size="large" color="#1A237E" style={{ marginTop: 40 }} />;

  return (
    <View>
      <View style={s.infoBox}>
        <Text style={s.infoIcon}>💡</Text>
        <Text style={s.infoText}>Visa officers assess your ability to fund your studies. Be accurate with your financial details.</Text>
      </View>

      <SectionTitle title="Income & Savings" />

      <Field label="Monthly Income (USD equivalent)">
        <Inp value={form.current_monthly_income} onChangeText={v => set('current_monthly_income', v)} placeholder="e.g. 1500" keyboardType="decimal-pad" />
      </Field>
      <Field label="Available Savings (USD equivalent)">
        <Inp value={form.approx_savings} onChangeText={v => set('approx_savings', v)} placeholder="e.g. 25000" keyboardType="decimal-pad" />
      </Field>
      <Field label="Primary Source of Income">
        <Inp value={form.income_source} onChangeText={v => set('income_source', v)} placeholder="Salary, Business, Rental..." />
      </Field>

      <SectionTitle title="Sponsor (if applicable)" />

      <Toggle label="I have a financial sponsor" value={form.has_sponsor} onValueChange={v => set('has_sponsor', v)} />

      {form.has_sponsor && (
        <>
          <Field label="Sponsor Name">
            <Inp value={form.sponsor_name} onChangeText={v => set('sponsor_name', v)} placeholder="Full Name" />
          </Field>
          <Field label="Relationship to You">
            <Inp value={form.sponsor_relationship} onChangeText={v => set('sponsor_relationship', v)} placeholder="e.g. Father, Uncle" />
          </Field>
        </>
      )}

      <SaveBtn onPress={save} loading={saving} />
    </View>
  );
}

// ─── MAIN SCREEN ───────────────────────────────────────────────────────────────

export default function ProfileEditScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState('bio');
  const [profileData, setProfileData] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);

  useEffect(() => { loadProfile(); }, []);

  function loadProfile() {
    setProfileLoading(true);
    api.profile.get()
      .then(data => {
        console.log('[ProfileEdit] loaded:', JSON.stringify(data));
        setProfileData(data);
      })
      .catch(e => {
        console.error('[ProfileEdit] load error:', e);
        Alert.alert('Error', `Could not load profile: ${e.message || 'unknown'}`);
      })
      .finally(() => setProfileLoading(false));
  }

  const renderTab = () => {
    switch (activeTab) {
      case 'bio':
        return <BioTab profileData={profileData} loading={profileLoading} onSaved={loadProfile} />;
      case 'education': return <EducationTab />;
      case 'language':  return <LanguageTab />;
      case 'travel':    return <TravelTab />;
      case 'finance':   return <FinanceTab />;
      default:          return null;
    }
  };

  return (
    <SafeAreaView style={s.container}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Text style={s.backText}>←</Text>
        </TouchableOpacity>
        <View>
          <Text style={s.headerTitle}>Edit Profile</Text>
          <Text style={s.headerSub}>Keep your details up to date</Text>
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.tabBar} contentContainerStyle={s.tabBarContent}>
        {TABS.map(tab => (
          <TouchableOpacity key={tab.id} style={[s.tab, activeTab === tab.id && s.tabActive]} onPress={() => setActiveTab(tab.id)}>
            <Text style={[s.tabText, activeTab === tab.id && s.tabTextActive]}>{tab.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
          {renderTab()}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ─── STYLES ────────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F8FF' },

  header: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1A237E', paddingHorizontal: 20, paddingVertical: 14 },
  backBtn: { marginRight: 14 },
  backText: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  headerSub: { color: '#9FA8DA', fontSize: 12, marginTop: 1 },

  tabBar: { backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#E0E0E0', flexGrow: 0 },
  tabBarContent: { paddingHorizontal: 12, paddingVertical: 8, flexDirection: 'row', gap: 8 },
  tab: { paddingHorizontal: 18, paddingVertical: 8, borderRadius: 20, backgroundColor: '#F5F8FF', borderWidth: 1, borderColor: '#E0E0E0' },
  tabActive: { backgroundColor: '#1A237E', borderColor: '#1A237E' },
  tabText: { fontSize: 13, fontWeight: '600', color: '#666' },
  tabTextActive: { color: '#fff' },

  content: { padding: 20, paddingBottom: 40 },

  sectionTitle: { fontSize: 13, fontWeight: 'bold', color: '#1A237E', backgroundColor: '#E8EAF6', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, marginTop: 20, marginBottom: 12, overflow: 'hidden' },

  row: { flexDirection: 'row' },
  field: { marginBottom: 14 },
  label: { fontSize: 12, fontWeight: '600', color: '#1A237E', marginBottom: 5 },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 10, paddingHorizontal: 13, paddingVertical: 11, fontSize: 14, color: '#333' },

  pickerWrap: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 10, overflow: 'hidden' },
  picker: { height: 44, color: '#333' },

  optRow: { flexDirection: 'row', gap: 8 },
  optBtn: { flex: 1, paddingVertical: 10, borderRadius: 10, borderWidth: 1, borderColor: '#E0E0E0', alignItems: 'center', backgroundColor: '#fff' },
  optActive: { borderColor: '#1A237E', backgroundColor: '#E8EAF6' },
  optText: { color: '#666', fontWeight: '600', fontSize: 13 },
  optTextActive: { color: '#1A237E', fontWeight: 'bold' },

  dateBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 10, paddingHorizontal: 13, paddingVertical: 11 },
  dateBtnIcon: { fontSize: 16, marginRight: 8 },
  dateBtnText: { flex: 1, fontSize: 14, color: '#333' },
  datePlaceholder: { color: '#AAA' },
  dateBtnArrow: { fontSize: 18, color: '#999' },

  toggleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, marginBottom: 10 },
  toggleLabel: { fontSize: 14, color: '#333', fontWeight: '500', flex: 1, marginRight: 10 },

  saveBtn: { backgroundColor: '#1A237E', borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 20, elevation: 2 },
  saveBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },

  listHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  listTitle: { fontSize: 17, fontWeight: 'bold', color: '#1A237E' },
  addBtn: { backgroundColor: '#1A237E', paddingHorizontal: 14, paddingVertical: 7, borderRadius: 8 },
  addBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 13 },

  formCard: { backgroundColor: '#EEF0FB', borderRadius: 12, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#C5CAE9' },

  card: { backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 12, elevation: 1, borderWidth: 1, borderColor: '#E0E0E0' },
  cardLeft: { flexDirection: 'row', alignItems: 'flex-start', flex: 1 },
  cardIcon: { fontSize: 24, marginRight: 12 },
  cardTitle: { fontSize: 14, fontWeight: 'bold', color: '#1A237E' },
  cardSub: { fontSize: 12, color: '#555', marginTop: 2 },
  cardMeta: { fontSize: 11, color: '#888', marginTop: 3 },

  scoreRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 4 },
  scoreChip: { fontSize: 11, backgroundColor: '#E8EAF6', color: '#1A237E', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },

  issueBadge: { fontSize: 11, color: '#D32F2F', backgroundColor: '#FFEBEE', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10, alignSelf: 'flex-start', marginTop: 4 },

  deleteBtn: { paddingHorizontal: 10, paddingVertical: 5, backgroundColor: '#FFEBEE', borderRadius: 8, alignSelf: 'flex-start' },
  deleteBtnText: { color: '#D32F2F', fontWeight: 'bold', fontSize: 12 },

  emptyState: { padding: 30, alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#E0E0E0', borderStyle: 'dashed' },
  emptyText: { color: '#999', fontSize: 14 },

  infoBox: { flexDirection: 'row', backgroundColor: '#E8EAF6', borderRadius: 10, padding: 12, marginBottom: 16, alignItems: 'flex-start' },
  infoIcon: { fontSize: 18, marginRight: 10, marginTop: 1 },
  infoText: { flex: 1, fontSize: 13, color: '#3949AB', lineHeight: 18 },
});
