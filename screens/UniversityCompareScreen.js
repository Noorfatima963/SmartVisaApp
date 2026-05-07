import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, TextInput, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../services/api';

const COMPARE_ROWS = [
  { key: 'qs_world_ranking',     label: 'Global Rank',  icon: '🏆', format: 'rank'    },
  { key: 'tuition_per_year',     label: 'Tuition / Yr', icon: '🎓', format: 'usd'     },
  { key: 'living_cost_per_year', label: 'Living Cost',  icon: '🏠', format: 'usd'     },
  { key: 'acceptance_rate',      label: 'Acceptance',   icon: '🎟️', format: 'percent' },
  { key: 'ielts_required',       label: 'IELTS Req',    icon: '🗣️', format: 'number'  },
  { key: 'post_study_work',      label: 'PSW Visa',     icon: '🛂', format: 'text'    },
  { key: 'scholarship_label',    label: 'Scholarship',  icon: '💰', format: 'text'    },
  { key: 'gre_label',            label: 'GRE/GMAT',     icon: '📝', format: 'text'    },
  { key: 'probability_score',    label: 'Your Chance',  icon: '📊', format: 'percent' },
];

function formatCell(value, format) {
  if (value == null) return '—';
  switch (format) {
    case 'rank':    return `#${value}`;
    case 'usd':     return `$${Number(value).toLocaleString()}`;
    case 'percent': return `${value}%`;
    default:        return String(value);
  }
}

export default function UniversityCompareScreen({ navigation }) {
  const [queryA, setQueryA]       = useState('');
  const [queryB, setQueryB]       = useState('');
  const [resultsA, setResultsA]   = useState([]);
  const [resultsB, setResultsB]   = useState([]);
  const [loadingA, setLoadingA]   = useState(false);
  const [loadingB, setLoadingB]   = useState(false);
  const [progA, setProgA]         = useState(null);
  const [progB, setProgB]         = useState(null);
  const [comparing, setComparing] = useState(false);
  const [compareData, setCompareData] = useState(null);
  const [compareError, setCompareError] = useState(null);

  const timerA = useRef(null);
  const timerB = useRef(null);

  useEffect(() => {
    if (!queryA.trim() || progA) { setResultsA([]); return; }
    clearTimeout(timerA.current);
    timerA.current = setTimeout(async () => {
      setLoadingA(true);
      try {
        const res = await api.assessments.searchPrograms({ q: queryA.trim(), degree_type: 'Masters', page_size: 8 });
        setResultsA(res.results || res || []);
      } catch { setResultsA([]); }
      finally { setLoadingA(false); }
    }, 400);
  }, [queryA]);

  useEffect(() => {
    if (!queryB.trim() || progB) { setResultsB([]); return; }
    clearTimeout(timerB.current);
    timerB.current = setTimeout(async () => {
      setLoadingB(true);
      try {
        const res = await api.assessments.searchPrograms({ q: queryB.trim(), degree_type: 'Masters', page_size: 8 });
        setResultsB(res.results || res || []);
      } catch { setResultsB([]); }
      finally { setLoadingB(false); }
    }, 400);
  }, [queryB]);

  useEffect(() => {
    if (!progA || !progB) { setCompareData(null); return; }
    runCompare();
  }, [progA, progB]);

  const runCompare = async () => {
    setComparing(true);
    setCompareError(null);
    try {
      const res = await api.assessments.compare(progA.program_id, progB.program_id);
      setCompareData(res);
    } catch (err) {
      setCompareError(err.message || 'Comparison failed');
    } finally {
      setComparing(false);
    }
  };

  const selectA = (item) => {
    setProgA(item);
    setQueryA(`${item.university_name} — ${item.program_name}`);
    setResultsA([]);
  };

  const selectB = (item) => {
    setProgB(item);
    setQueryB(`${item.university_name} — ${item.program_name}`);
    setResultsB([]);
  };

  const clearA = () => { setProgA(null); setQueryA(''); setCompareData(null); setCompareError(null); };
  const clearB = () => { setProgB(null); setQueryB(''); setCompareData(null); setCompareError(null); };

  const cellColor = (key, side) => {
    if (!compareData?.comparison) return '#333';
    const winner = compareData.comparison[key];
    if (!winner || winner === 'tie') return '#333';
    return winner === side ? '#2E7D32' : '#D32F2F';
  };

  const { university_a: ua, university_b: ub, verdict } = compareData || {};

  return (
    <SafeAreaView style={s.container}>
      <StatusBar backgroundColor="#1A237E" barStyle="light-content" />

      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Text style={s.backText}>←</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle}>Uni Clash ⚔️</Text>
      </View>

      <ScrollView
        contentContainerStyle={s.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Search row */}
        <View style={s.searchRow}>
          <View style={s.searchSide}>
            <Text style={s.searchLabel}>Program A</Text>
            <View style={s.inputWrap}>
              <TextInput
                style={s.input}
                placeholder="Search..."
                placeholderTextColor="#aaa"
                value={queryA}
                onChangeText={(t) => { setQueryA(t); if (progA) setProgA(null); }}
              />
              {progA ? (
                <TouchableOpacity onPress={clearA} style={s.clearBtn}>
                  <Text style={s.clearX}>✕</Text>
                </TouchableOpacity>
              ) : null}
            </View>
            {loadingA ? <ActivityIndicator size="small" color="#1A237E" style={s.spinner} /> : null}
            {resultsA.length > 0 && (
              <View style={s.dropdown}>
                {resultsA.map((item, i) => (
                  <TouchableOpacity key={i} style={[s.dropItem, i === resultsA.length - 1 && s.dropItemLast]} onPress={() => selectA(item)}>
                    <Text style={s.dropUni} numberOfLines={1}>{item.university_name}</Text>
                    <Text style={s.dropProg} numberOfLines={1}>{item.program_name}</Text>
                    <Text style={s.dropMeta}>
                      {item.country}  {item.tuition_per_year ? `$${(item.tuition_per_year / 1000).toFixed(0)}k` : ''}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          <View style={s.vsCircle}>
            <Text style={s.vsText}>VS</Text>
          </View>

          <View style={s.searchSide}>
            <Text style={s.searchLabel}>Program B</Text>
            <View style={s.inputWrap}>
              <TextInput
                style={s.input}
                placeholder="Search..."
                placeholderTextColor="#aaa"
                value={queryB}
                onChangeText={(t) => { setQueryB(t); if (progB) setProgB(null); }}
              />
              {progB ? (
                <TouchableOpacity onPress={clearB} style={s.clearBtn}>
                  <Text style={s.clearX}>✕</Text>
                </TouchableOpacity>
              ) : null}
            </View>
            {loadingB ? <ActivityIndicator size="small" color="#1A237E" style={s.spinner} /> : null}
            {resultsB.length > 0 && (
              <View style={s.dropdown}>
                {resultsB.map((item, i) => (
                  <TouchableOpacity key={i} style={[s.dropItem, i === resultsB.length - 1 && s.dropItemLast]} onPress={() => selectB(item)}>
                    <Text style={s.dropUni} numberOfLines={1}>{item.university_name}</Text>
                    <Text style={s.dropProg} numberOfLines={1}>{item.program_name}</Text>
                    <Text style={s.dropMeta}>
                      {item.country}  {item.tuition_per_year ? `$${(item.tuition_per_year / 1000).toFixed(0)}k` : ''}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </View>

        {/* Empty state */}
        {!progA && !progB && !loadingA && !loadingB && (
          <View style={s.hint}>
            <Text style={s.hintText}>Search and select two programs above to compare them head-to-head.</Text>
          </View>
        )}

        {/* Comparing spinner */}
        {comparing && (
          <View style={s.centered}>
            <ActivityIndicator size="large" color="#1A237E" />
            <Text style={s.loadingText}>Comparing programs...</Text>
          </View>
        )}

        {/* Error */}
        {compareError && !comparing && (
          <View style={s.errorBox}>
            <Text style={s.errorText}>{compareError}</Text>
            <TouchableOpacity style={s.retryBtn} onPress={runCompare}>
              <Text style={s.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Comparison table */}
        {compareData && !comparing && (
          <>
            <View style={s.tableCard}>
              <View style={s.tableHeader}>
                <View style={{ flex: 1.2 }} />
                <View style={s.tableHeadCell}>
                  <Text style={s.flagText}>{ua.flag}</Text>
                  <Text style={s.headUni} numberOfLines={2}>{ua.university_name}</Text>
                  <Text style={s.headProg} numberOfLines={1}>{ua.program_name}</Text>
                </View>
                <View style={s.tableHeadCell}>
                  <Text style={s.flagText}>{ub.flag}</Text>
                  <Text style={s.headUni} numberOfLines={2}>{ub.university_name}</Text>
                  <Text style={s.headProg} numberOfLines={1}>{ub.program_name}</Text>
                </View>
              </View>

              <View style={s.divider} />

              {COMPARE_ROWS.map((row) => (
                <View key={row.key} style={s.row}>
                  <View style={s.rowLabel}>
                    <Text style={s.rowIcon}>{row.icon}</Text>
                    <Text style={s.rowLabelText}>{row.label}</Text>
                  </View>
                  <Text style={[s.cellVal, { color: cellColor(row.key, 'a') }]}>
                    {formatCell(ua[row.key], row.format)}
                  </Text>
                  <Text style={[s.cellVal, { color: cellColor(row.key, 'b') }]}>
                    {formatCell(ub[row.key], row.format)}
                  </Text>
                </View>
              ))}
            </View>

            {/* Verdict */}
            <View style={s.verdictCard}>
              <Text style={s.verdictLabel}>AI Verdict 🤖</Text>
              <Text style={s.verdictWinner}>
                {verdict.winner === 'tie' ? "It's a Tie 🤝" : `${verdict.winner_name} Wins!`}
              </Text>
              {verdict.reasons?.map((r, i) => (
                <Text key={i} style={s.verdictReason}>• {r}</Text>
              ))}
              {verdict.summary ? (
                <Text style={s.verdictSummary}>{verdict.summary}</Text>
              ) : null}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F8FF' },

  header: {
    flexDirection: 'row', alignItems: 'center',
    padding: 20, backgroundColor: '#1A237E', elevation: 5,
  },
  backBtn:     { marginRight: 15 },
  backText:    { color: '#fff', fontSize: 24, fontWeight: 'bold' },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold' },

  content: { padding: 14, paddingBottom: 40 },

  searchRow:  { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 16 },
  searchSide: { flex: 1 },
  searchLabel: { fontSize: 11, fontWeight: '700', color: '#1A237E', marginBottom: 4, textTransform: 'uppercase' },

  inputWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 10, borderWidth: 1.5, borderColor: '#E0E0E0', paddingHorizontal: 8 },
  input:     { flex: 1, fontSize: 12, color: '#333', paddingVertical: 9 },
  clearBtn:  { padding: 4 },
  clearX:    { fontSize: 12, color: '#999' },
  spinner:   { marginTop: 4 },

  dropdown:     { backgroundColor: '#fff', borderRadius: 10, borderWidth: 1, borderColor: '#E0E0E0', marginTop: 4, elevation: 6, overflow: 'hidden' },
  dropItem:     { padding: 10, borderBottomWidth: 1, borderBottomColor: '#F5F5F5' },
  dropItemLast: { borderBottomWidth: 0 },
  dropUni:      { fontSize: 11, fontWeight: 'bold', color: '#1A237E' },
  dropProg:     { fontSize: 11, color: '#444', marginTop: 1 },
  dropMeta:     { fontSize: 10, color: '#999', marginTop: 2 },

  vsCircle: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: '#1A237E', justifyContent: 'center', alignItems: 'center',
    marginHorizontal: 8, marginTop: 22, elevation: 4,
  },
  vsText: { color: '#FFD700', fontWeight: 'bold', fontSize: 12 },

  hint:     { alignItems: 'center', padding: 30 },
  hintText: { color: '#999', fontSize: 14, textAlign: 'center', lineHeight: 22 },

  centered:    { alignItems: 'center', padding: 30 },
  loadingText: { marginTop: 12, color: '#666', fontSize: 14 },

  errorBox:  { backgroundColor: '#FFEBEE', borderRadius: 12, padding: 16, alignItems: 'center', marginBottom: 16 },
  errorText: { color: '#C62828', fontSize: 14, textAlign: 'center', marginBottom: 12 },
  retryBtn:  { backgroundColor: '#1A237E', paddingHorizontal: 24, paddingVertical: 10, borderRadius: 8 },
  retryText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },

  tableCard: { backgroundColor: '#fff', borderRadius: 14, padding: 12, elevation: 4, marginBottom: 16 },

  tableHeader:  { flexDirection: 'row', paddingBottom: 10 },
  tableHeadCell: { flex: 1, alignItems: 'center', paddingHorizontal: 4 },
  flagText:     { fontSize: 24, marginBottom: 4 },
  headUni:      { fontSize: 11, fontWeight: 'bold', color: '#1A237E', textAlign: 'center' },
  headProg:     { fontSize: 10, color: '#666', textAlign: 'center', marginTop: 2 },

  divider: { height: 1.5, backgroundColor: '#F0F0F0', marginBottom: 4 },

  row:          { flexDirection: 'row', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F5F5F5', alignItems: 'center' },
  rowLabel:     { flex: 1.2, flexDirection: 'row', alignItems: 'center' },
  rowIcon:      { fontSize: 13, marginRight: 5 },
  rowLabelText: { fontSize: 11, color: '#666', fontWeight: '600', flexShrink: 1 },
  cellVal:      { flex: 1, textAlign: 'center', fontSize: 12, fontWeight: '600' },

  verdictCard:    { backgroundColor: '#1A237E', borderRadius: 14, padding: 20, elevation: 5 },
  verdictLabel:   { color: '#FFD700', fontWeight: 'bold', fontSize: 12, letterSpacing: 1, marginBottom: 6 },
  verdictWinner:  { color: '#fff', fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
  verdictReason:  { color: '#C5CAE9', fontSize: 13, marginBottom: 4 },
  verdictSummary: { color: '#9FA8DA', fontSize: 12, marginTop: 8, fontStyle: 'italic', lineHeight: 18 },
});
