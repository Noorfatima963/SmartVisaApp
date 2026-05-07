import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TextInput, ScrollView,
  TouchableOpacity, KeyboardAvoidingView, Platform,
  StatusBar, ActivityIndicator, Modal, FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Picker } from '@react-native-picker/picker';
import api from '../services/api';

const COUNTRY_CODE = { USA: 'USA', UK: 'UK', Canada: 'CA', Australia: 'AU', Germany: 'DE' };
const CURRENCY     = { USA: '$', UK: '£', Canada: 'CAD $', Australia: 'AUD $', Germany: '€' };

const getDefaults = (country) => {
  switch (country) {
    case 'UK':        return { t: '18000', l: '12000', f: '1000' };
    case 'Canada':    return { t: '25000', l: '15000', f: '1500' };
    case 'Australia': return { t: '30000', l: '20000', f: '1200' };
    case 'Germany':   return { t: '500',   l: '11208', f: '900'  };
    default:          return { t: '25000', l: '15000', f: '1200' };
  }
};

export default function CostEstimatorScreen({ navigation }) {
  const [country, setCountry]       = useState('USA');
  const [tuition, setTuition]       = useState('25000');
  const [living, setLiving]         = useState('15000');
  const [flight, setFlight]         = useState('1200');
  const [visaFee, setVisaFee]       = useState('185');
  const [misc, setMisc]             = useState('2000');
  const [total, setTotal]           = useState(0);

  const [infoLoading, setInfoLoading] = useState(false);
  const [sourceLabel, setSourceLabel] = useState(null);

  // Search sheet state
  const [sheetVisible, setSheetVisible]   = useState(false);
  const [searchQuery, setSearchQuery]     = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchTimer, setSearchTimer]     = useState(null);

  // Recalculate total whenever any field changes
  useEffect(() => {
    const t = parseFloat(tuition) || 0;
    const l = parseFloat(living)  || 0;
    const f = parseFloat(flight)  || 0;
    const v = parseFloat(visaFee) || 0;
    const m = parseFloat(misc)    || 0;
    setTotal(t + l + f + v + m);
  }, [tuition, living, flight, visaFee, misc]);

  // Pre-fill visa fee + health insurance when country changes
  useEffect(() => {
    const code = COUNTRY_CODE[country];
    const def  = getDefaults(country);
    setTuition(def.t);
    setLiving(def.l);
    setFlight(def.f);
    setSourceLabel(null);

    const fetchInfo = async () => {
      setInfoLoading(true);
      try {
        const res = await api.assessments.countryInfo(code);
        if (res?.visa?.total)                   setVisaFee(String(res.visa.total));
        if (res?.health_insurance?.annual_cost) setMisc(String(res.health_insurance.annual_cost));
      } catch {
        // keep defaults on error
      } finally {
        setInfoLoading(false);
      }
    };
    fetchInfo();
  }, [country]);

  // Debounced program search
  useEffect(() => {
    if (!searchQuery.trim()) { setSearchResults([]); return; }
    clearTimeout(searchTimer);
    const t = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const res = await api.assessments.searchPrograms({
          country: COUNTRY_CODE[country],
          degree_type: 'Masters',
          q: searchQuery.trim(),
          page_size: 10,
        });
        setSearchResults(res.results || res || []);
      } catch { setSearchResults([]); }
      finally { setSearchLoading(false); }
    }, 400);
    setSearchTimer(t);
  }, [searchQuery]);

  const handleSelectProgram = async (program) => {
    setSheetVisible(false);
    setSearchQuery('');
    setSearchResults([]);
    try {
      const res = await api.assessments.programCost(program.program_id, COUNTRY_CODE[country]);
      const cb  = res.cost_breakdown || {};
      if (cb.tuition?.annual)          setTuition(String(cb.tuition.annual));
      if (cb.living_expenses?.annual)  setLiving(String(cb.living_expenses.annual));
      if (cb.visa?.total_visa_fee)     setVisaFee(String(cb.visa.total_visa_fee));
      if (cb.health_insurance?.annual) setMisc(String(cb.health_insurance.annual));
      setSourceLabel(`${program.university_name} — ${program.program_name}`);
    } catch {
      // silently ignore; user can still edit manually
    }
  };

  const curr = CURRENCY[country] || '$';

  return (
    <SafeAreaView style={s.container}>
      <StatusBar backgroundColor="#1A237E" barStyle="light-content" />

      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Text style={s.backText}>←</Text>
        </TouchableOpacity>
        <View>
          <Text style={s.headerTitle}>Cost Estimator 💰</Text>
          <Text style={s.headerSub}>Plan for {country}</Text>
        </View>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>

          {/* Country picker */}
          <View style={s.pickerBox}>
            <Picker selectedValue={country} onValueChange={setCountry} dropdownIconColor="#1A237E">
              <Picker.Item label="🇺🇸 USA"       value="USA"       />
              <Picker.Item label="🇬🇧 UK"        value="UK"        />
              <Picker.Item label="🇨🇦 Canada"    value="Canada"    />
              <Picker.Item label="🇦🇺 Australia" value="Australia" />
              <Picker.Item label="🇩🇪 Germany"   value="Germany"   />
            </Picker>
          </View>

          {/* Load from program button */}
          <TouchableOpacity style={s.loadBtn} onPress={() => setSheetVisible(true)}>
            <Text style={s.loadBtnText}>🔍  Load from a Program</Text>
          </TouchableOpacity>

          {/* Source label */}
          {sourceLabel && (
            <View style={s.sourceBadge}>
              <Text style={s.sourceText}>Source: {sourceLabel}</Text>
            </View>
          )}

          {/* Total card */}
          <View style={s.totalCard}>
            <Text style={s.totalLabel}>Estimated Annual Cost</Text>
            {infoLoading
              ? <ActivityIndicator color="#1A237E" style={{ marginVertical: 8 }} />
              : <Text style={s.totalAmount}>{curr} {total.toLocaleString()}</Text>}
            <Text style={s.currencyNote}>(Based on current rates)</Text>
          </View>

          {/* Visual bar */}
          <View style={s.barContainer}>
            <View style={[s.barSegment, { flex: parseFloat(tuition) || 1, backgroundColor: '#1A237E' }]} />
            <View style={[s.barSegment, { flex: parseFloat(living)  || 1, backgroundColor: '#FFD700' }]} />
            <View style={[s.barSegment, { flex: parseFloat(flight)  || 0.5, backgroundColor: '#4CAF50' }]} />
          </View>
          <View style={s.legendRow}>
            <View style={s.legendItem}><View style={[s.dot, { backgroundColor: '#1A237E' }]} /><Text style={s.legendText}>Tuition</Text></View>
            <View style={s.legendItem}><View style={[s.dot, { backgroundColor: '#FFD700' }]} /><Text style={s.legendText}>Living</Text></View>
            <View style={s.legendItem}><View style={[s.dot, { backgroundColor: '#4CAF50' }]} /><Text style={s.legendText}>Travel</Text></View>
          </View>

          {/* Expense breakdown */}
          <Text style={s.sectionTitle}>Expense Breakdown</Text>
          <View style={s.inputCard}>
            <InputItem label="🎓 Tuition Fee"         val={tuition} setVal={setTuition} curr={curr} />
            <InputItem label="🏠 Living (Rent+Food)"  val={living}  setVal={setLiving}  curr={curr} />
            <InputItem label="✈️ Flight Tickets"      val={flight}  setVal={setFlight}  curr={curr} />
            <InputItem label="📄 Visa Fees"           val={visaFee} setVal={setVisaFee} curr={curr} />
            <InputItem label="🛍️ Misc / Insurance"   val={misc}    setVal={setMisc}    curr={curr} last />
          </View>

        </ScrollView>
      </KeyboardAvoidingView>

      {/* Program search bottom sheet */}
      <Modal visible={sheetVisible} animationType="slide" transparent onRequestClose={() => setSheetVisible(false)}>
        <TouchableOpacity style={s.modalOverlay} activeOpacity={1} onPress={() => setSheetVisible(false)} />
        <View style={s.sheet}>
          <View style={s.sheetHandle} />
          <Text style={s.sheetTitle}>Search Programs in {country}</Text>

          <TextInput
            style={s.sheetInput}
            placeholder="e.g. Computer Science, MBA..."
            placeholderTextColor="#aaa"
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus
          />

          {searchLoading && <ActivityIndicator color="#1A237E" style={{ marginTop: 10 }} />}

          <FlatList
            data={searchResults}
            keyExtractor={(_, i) => String(i)}
            style={s.resultList}
            keyboardShouldPersistTaps="handled"
            ListEmptyComponent={
              !searchLoading && searchQuery.trim() ? (
                <Text style={s.emptyText}>No programs found.</Text>
              ) : null
            }
            renderItem={({ item }) => (
              <TouchableOpacity style={s.resultItem} onPress={() => handleSelectProgram(item)}>
                <Text style={s.resultUni} numberOfLines={1}>{item.university_name}</Text>
                <Text style={s.resultProg} numberOfLines={1}>{item.program_name}</Text>
                <Text style={s.resultMeta}>
                  {item.country}  {item.tuition_per_year ? `${curr}${(item.tuition_per_year / 1000).toFixed(0)}k / yr` : ''}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const InputItem = ({ label, val, setVal, curr, last }) => (
  <View style={[s.inputRow, last && { marginBottom: 0 }]}>
    <Text style={s.inputLabel}>{label}</Text>
    <View style={s.inputWrapper}>
      <Text style={s.currPrefix}>{curr}</Text>
      <TextInput
        style={s.input}
        keyboardType="numeric"
        value={val.toString()}
        onChangeText={setVal}
      />
    </View>
  </View>
);

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F8FF' },

  header: {
    flexDirection: 'row', alignItems: 'center',
    padding: 20, paddingTop: 40,
    backgroundColor: '#1A237E',
    borderBottomLeftRadius: 25, borderBottomRightRadius: 25,
    elevation: 5,
  },
  backBtn:     { marginRight: 15 },
  backText:    { color: '#fff', fontSize: 24, fontWeight: 'bold' },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  headerSub:   { color: '#B0BEC5', fontSize: 13 },

  content: { padding: 20, paddingBottom: 40 },

  pickerBox: {
    borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 12,
    backgroundColor: '#fff', height: 50, justifyContent: 'center',
    marginBottom: 12, elevation: 1,
  },

  loadBtn: {
    backgroundColor: '#E8EAF6', borderRadius: 10, paddingVertical: 11,
    alignItems: 'center', marginBottom: 12,
    borderWidth: 1, borderColor: '#C5CAE9',
  },
  loadBtnText: { color: '#1A237E', fontWeight: '700', fontSize: 14 },

  sourceBadge: {
    backgroundColor: '#E3F2FD', borderRadius: 8, paddingVertical: 6,
    paddingHorizontal: 12, marginBottom: 12, borderLeftWidth: 3, borderLeftColor: '#1A237E',
  },
  sourceText: { color: '#1565C0', fontSize: 12, fontWeight: '600' },

  totalCard: {
    backgroundColor: '#fff', padding: 25, borderRadius: 15, alignItems: 'center',
    marginBottom: 20, elevation: 4,
    borderTopWidth: 4, borderTopColor: '#4CAF50',
  },
  totalLabel:    { fontSize: 14, color: '#666', marginBottom: 5, fontWeight: '600' },
  totalAmount:   { fontSize: 36, fontWeight: 'bold', color: '#1A237E' },
  currencyNote:  { fontSize: 12, color: '#999', marginTop: 5, fontStyle: 'italic' },

  barContainer: { flexDirection: 'row', height: 12, borderRadius: 6, overflow: 'hidden', marginBottom: 10 },
  barSegment:   { height: '100%' },
  legendRow:    { flexDirection: 'row', justifyContent: 'center', marginBottom: 20 },
  legendItem:   { flexDirection: 'row', alignItems: 'center', marginHorizontal: 8 },
  dot:          { width: 8, height: 8, borderRadius: 4, marginRight: 5 },
  legendText:   { fontSize: 12, color: '#555' },

  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 15 },
  inputCard:    { backgroundColor: '#fff', padding: 15, borderRadius: 15, elevation: 2 },
  inputRow:     { marginBottom: 15 },
  inputLabel:   { fontSize: 14, color: '#333', marginBottom: 5, fontWeight: '600' },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderColor: '#DDD',
    borderRadius: 10, backgroundColor: '#FAFAFA', paddingHorizontal: 10,
  },
  currPrefix: { fontSize: 16, color: '#666', fontWeight: 'bold', marginRight: 5 },
  input:      { flex: 1, paddingVertical: 12, fontSize: 16, color: '#1A237E', fontWeight: 'bold' },

  // Modal sheet
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },
  sheet: {
    backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 20, maxHeight: '75%',
  },
  sheetHandle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: '#DDD', alignSelf: 'center', marginBottom: 16,
  },
  sheetTitle: { fontSize: 16, fontWeight: 'bold', color: '#1A237E', marginBottom: 12 },
  sheetInput: {
    borderWidth: 1.5, borderColor: '#E0E0E0', borderRadius: 12,
    padding: 12, fontSize: 14, color: '#333', backgroundColor: '#FAFAFA',
  },
  resultList:  { marginTop: 12 },
  resultItem:  { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  resultUni:   { fontSize: 13, fontWeight: 'bold', color: '#1A237E' },
  resultProg:  { fontSize: 12, color: '#444', marginTop: 2 },
  resultMeta:  { fontSize: 11, color: '#999', marginTop: 3 },
  emptyText:   { textAlign: 'center', color: '#aaa', marginTop: 20, fontSize: 13 },
});
