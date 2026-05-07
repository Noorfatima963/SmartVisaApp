import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, KeyboardAvoidingView, Platform,
  StatusBar, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Picker } from '@react-native-picker/picker';
import api from '../services/api';

const COUNTRY_CODE = { USA: 'USA', UK: 'UK', Canada: 'CA', Australia: 'AU', Germany: 'DE' };

const ELIGIBILITY_COLORS = {
  likely:   '#4CAF50',
  possible: '#FFD700',
  reach:    '#FF9800',
  unlikely: '#F44336',
};

export default function EligibilityScreen({ navigation }) {
  const [country, setCountry]         = useState('USA');
  const [degreeLevel, setDegreeLevel] = useState('Masters');
  const [loading, setLoading]         = useState(false);
  const [result, setResult]           = useState(null);
  const [error, setError]             = useState(null);

  const checkStatus = async () => {
    setLoading(true);
    setResult(null);
    setError(null);
    try {
      const data = await api.assessments.run({
        target_country:     COUNTRY_CODE[country] || country,
        target_degree_type: degreeLevel,
        max_results:        5,
      });

      const score = data.overall_score;
      let status, title, color;
      if (score >= 75) {
        status = 'eligible';   title = '🎉 Eligible';     color = '#2E7D32';
      } else if (score >= 50) {
        status = 'possible';   title = '👍 Possible';     color = '#F57F17';
      } else if (score >= 30) {
        status = 'reach';      title = '⚠️ Reach';        color = '#E65100';
      } else {
        status = 'not_eligible'; title = '❌ Not Eligible'; color = '#C62828';
      }

      setResult({ status, title, color, score, data });
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const top3 = result?.data?.matches?.slice(0, 3) || [];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#1A237E" barStyle="light-content" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Eligibility AI 🤖</Text>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

          <Text style={styles.subText}>
            Check admission chances for{' '}
            <Text style={{ fontWeight: 'bold', color: '#1A237E' }}>{degreeLevel}</Text>
            {' '}in{' '}
            <Text style={{ fontWeight: 'bold', color: '#1A237E' }}>{country}</Text>.
          </Text>

          {/* Form */}
          <View style={styles.card}>
            <Text style={styles.label}>Destination Country</Text>
            <View style={styles.pickerBox}>
              <Picker selectedValue={country} onValueChange={setCountry} dropdownIconColor="#1A237E">
                <Picker.Item label="🇺🇸 USA"       value="USA"       />
                <Picker.Item label="🇬🇧 UK"        value="UK"        />
                <Picker.Item label="🇨🇦 Canada"    value="Canada"    />
                <Picker.Item label="🇦🇺 Australia" value="Australia" />
                <Picker.Item label="🇩🇪 Germany"   value="Germany"   />
              </Picker>
            </View>

            <Text style={styles.label}>Applying For</Text>
            <View style={styles.pickerBox}>
              <Picker selectedValue={degreeLevel} onValueChange={setDegreeLevel} dropdownIconColor="#1A237E">
                <Picker.Item label="🎓 Masters / Post-Grad"    value="Masters"   />
                <Picker.Item label="📚 Bachelors / Under-Grad" value="Bachelors" />
              </Picker>
            </View>

            <TouchableOpacity
              style={[styles.checkBtn, loading && styles.checkBtnDisabled]}
              onPress={checkStatus}
              disabled={loading}
            >
              {loading
                ? <ActivityIndicator color="#fff" />
                : <Text style={styles.checkBtnText}>Check Eligibility</Text>}
            </TouchableOpacity>
          </View>

          {/* Error */}
          {error && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* Result */}
          {result && (
            <>
              {/* Score card */}
              <View style={[styles.resultCard, { borderLeftColor: result.color }]}>
                <Text style={[styles.resultTitle, { color: result.color }]}>{result.title}</Text>
                <Text style={styles.scoreText}>{result.score.toFixed(1)}% overall score</Text>
                <Text style={styles.matchCount}>
                  Found {result.data.total_matches_found} matching programs
                </Text>
              </View>

              {/* Top 3 matches */}
              {top3.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Top Matches</Text>
                  {top3.map((m, i) => (
                    <View key={i} style={styles.matchCard}>
                      <View style={styles.matchRow}>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.matchUni} numberOfLines={1}>{m.university_name}</Text>
                          <Text style={styles.matchProg} numberOfLines={1}>{m.program_name}</Text>
                        </View>
                        <View style={[styles.eligBadge, { backgroundColor: ELIGIBILITY_COLORS[m.eligibility] || '#999' }]}>
                          <Text style={styles.eligText}>{m.eligibility}</Text>
                        </View>
                      </View>
                    </View>
                  ))}
                </View>
              )}

              {/* Improvement tips */}
              {result.data.missing_factors?.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>How to Improve</Text>
                  {result.data.missing_factors.map((tip, i) => (
                    <View key={i} style={styles.tipCard}>
                      <Text style={styles.tipText}>💡 {tip}</Text>
                    </View>
                  ))}
                </View>
              )}
            </>
          )}

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F8FF' },

  header: {
    flexDirection: 'row', alignItems: 'center',
    padding: 20, backgroundColor: '#1A237E', elevation: 5,
  },
  backBtn:     { marginRight: 15 },
  backText:    { color: '#fff', fontSize: 24, fontWeight: 'bold' },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold' },

  content: { padding: 20, paddingBottom: 40 },
  subText: { textAlign: 'center', color: '#666', marginBottom: 20, fontSize: 15 },

  card:      { backgroundColor: '#fff', padding: 20, borderRadius: 15, elevation: 3, marginBottom: 20 },
  label:     { fontSize: 13, fontWeight: 'bold', color: '#1A237E', marginTop: 12, marginBottom: 5 },
  pickerBox: {
    borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 10,
    backgroundColor: '#FAFAFA', height: 50, justifyContent: 'center',
  },

  checkBtn: {
    marginTop: 24, backgroundColor: '#1A237E',
    paddingVertical: 14, borderRadius: 12, alignItems: 'center',
  },
  checkBtnDisabled: { opacity: 0.7 },
  checkBtnText:     { color: '#fff', fontWeight: 'bold', fontSize: 16 },

  errorBox:  { backgroundColor: '#FFEBEE', borderRadius: 12, padding: 14, marginBottom: 16 },
  errorText: { color: '#C62828', fontSize: 14, textAlign: 'center' },

  resultCard: {
    backgroundColor: '#fff', borderRadius: 14, padding: 18,
    borderLeftWidth: 5, elevation: 3, marginBottom: 16, alignItems: 'center',
  },
  resultTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 6 },
  scoreText:   { fontSize: 16, color: '#333', fontWeight: '600', marginBottom: 4 },
  matchCount:  { fontSize: 13, color: '#666' },

  section:      { marginBottom: 16 },
  sectionTitle: { fontSize: 15, fontWeight: 'bold', color: '#1A237E', marginBottom: 8 },

  matchCard: { backgroundColor: '#fff', borderRadius: 12, padding: 12, marginBottom: 8, elevation: 2 },
  matchRow:  { flexDirection: 'row', alignItems: 'center' },
  matchUni:  { fontSize: 13, fontWeight: 'bold', color: '#1A237E' },
  matchProg: { fontSize: 12, color: '#555', marginTop: 2 },
  eligBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, marginLeft: 8 },
  eligText:  { color: '#fff', fontSize: 11, fontWeight: 'bold', textTransform: 'capitalize' },

  tipCard: {
    backgroundColor: '#FFF8E1', borderRadius: 10, padding: 12,
    marginBottom: 8, borderLeftWidth: 3, borderLeftColor: '#FFD700',
  },
  tipText: { fontSize: 13, color: '#795548' },
});
