import React, { useEffect, useState, useRef } from 'react';
import {
  View, Text, StyleSheet, Animated, Easing,
  ScrollView, StatusBar, ActivityIndicator, TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../services/api';

const ELIGIBILITY_COLORS = {
  likely:   '#4CAF50',
  possible: '#FFD700',
  reach:    '#FF9800',
  unlikely: '#F44336',
};

const DEGREE_NORMALIZE = { masters: 'Masters', bachelors: 'Bachelors', phd: 'PhD' };

const FACTOR_LABELS = {
  gpa:             'Academic (GPA)',
  language:        'Language Test',
  financial:       'Financial',
  backlogs:        'Backlogs',
  visa_history:    'Visa History',
  acceptance_rate: 'Acceptance Rate',
};

export default function SuccessProbabilityScreen({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [data, setData]       = useState(null);
  const [score, setScore]     = useState(0);
  const animatedValue         = useRef(new Animated.Value(0)).current;

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const profile = await api.profile.get();
      const targetCountry = profile.target_country;
      const rawDegree     = profile.target_degree_type || '';

      if (!targetCountry) {
        setError('Target country is not set on your profile. Please update it from Edit Profile → Bio tab.');
        return;
      }

      const result = await api.assessments.run({
        target_country:     targetCountry,
        target_degree_type: DEGREE_NORMALIZE[rawDegree.toLowerCase()] || rawDegree || 'Masters',
        max_results:        10,
      });
      setData(result);
      runAnimation(result.overall_score);
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const runAnimation = (toValue) => {
    animatedValue.setValue(0);
    Animated.timing(animatedValue, {
      toValue,
      duration: 2000,
      useNativeDriver: false,
      easing: Easing.out(Easing.exp),
    }).start();
    animatedValue.addListener((v) => setScore(Math.floor(v.value)));
  };

  const scoreColor = score >= 75 ? '#4CAF50' : score >= 50 ? '#FFD700' : score >= 30 ? '#FF9800' : '#F44336';
  const scoreLabel = score >= 75 ? 'High Chance' : score >= 50 ? 'Moderate Chance' : score >= 30 ? 'Low Chance' : 'High Risk';

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#1A237E" />
          <Text style={styles.loadingText}>Analyzing your profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={loadData}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const top5      = (data.matches || []).slice(0, 5);
  const breakdown = data.score_breakdown || {};

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F5F8FF" />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        <Text style={styles.title}>Success Probability</Text>
        <Text style={styles.subtitle}>
          {data.total_matches_found} matches from {data.total_programs_evaluated} programs evaluated
        </Text>

        {/* Score Circle */}
        <View style={[styles.circleContainer, { borderColor: scoreColor }]}>
          <Animated.Text style={[styles.percentageText, { color: scoreColor }]}>
            {score}%
          </Animated.Text>
          <Text style={[styles.statusText, { color: scoreColor }]}>{scoreLabel}</Text>
        </View>

        {/* Score Breakdown */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Score Breakdown</Text>
          <View style={styles.divider} />
          {Object.entries(breakdown).map(([key, val]) => (
            <View key={key} style={styles.barRow}>
              <Text style={styles.barLabel}>{FACTOR_LABELS[key] || key}</Text>
              <View style={styles.barBg}>
                <View style={[
                  styles.barFill,
                  { width: `${val}%`, backgroundColor: val >= 70 ? '#4CAF50' : val >= 40 ? '#FFD700' : '#F44336' },
                ]} />
              </View>
              <Text style={styles.barVal}>{Math.round(val)}%</Text>
            </View>
          ))}
        </View>

        {/* Top 5 Matches */}
        {top5.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Top Matches</Text>
            {top5.map((m) => (
              <View key={m.rank} style={styles.matchCard}>
                <View style={styles.matchHeader}>
                  <Text style={styles.rankBadge}>#{m.rank}</Text>
                  <View style={[styles.eligBadge, { backgroundColor: ELIGIBILITY_COLORS[m.eligibility] || '#999' }]}>
                    <Text style={styles.eligText}>{m.eligibility}</Text>
                  </View>
                </View>
                <Text style={styles.uniName}>{m.university_name}</Text>
                <Text style={styles.progName}>{m.program_name}</Text>
                <View style={styles.matchMeta}>
                  <Text style={styles.metaItem}>Chance: {m.probability_score}%</Text>
                  {m.cost_data?.totals?.first_year_cost ? (
                    <Text style={styles.metaItem}>
                      ${(m.cost_data.totals.first_year_cost / 1000).toFixed(0)}k / yr
                    </Text>
                  ) : null}
                </View>
                {m.match_reasons?.length > 0 && (
                  <Text style={styles.reason}>+ {m.match_reasons[0]}</Text>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Missing Factors Tips */}
        {data.missing_factors?.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>How to Improve</Text>
            {data.missing_factors.map((tip, i) => (
              <View key={i} style={styles.tipCard}>
                <Text style={styles.tipText}>💡 {tip}</Text>
              </View>
            ))}
          </View>
        )}

        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>Back to Dashboard</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: '#F5F8FF' },
  scrollContent: { padding: 20, alignItems: 'center' },
  centered:     { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30 },

  title:    { fontSize: 26, fontWeight: 'bold', color: '#1A237E', marginTop: 10 },
  subtitle: { color: '#666', marginBottom: 24, fontSize: 13, textAlign: 'center' },

  circleContainer: {
    width: 200, height: 200,
    borderRadius: 100,
    borderWidth: 10,
    backgroundColor: '#fff',
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 28,
    elevation: 8,
    shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10,
  },
  percentageText: { fontSize: 52, fontWeight: 'bold' },
  statusText:     { fontSize: 14, fontWeight: 'bold', marginTop: 4 },

  card:      { width: '100%', backgroundColor: '#fff', padding: 18, borderRadius: 14, elevation: 3, marginBottom: 20 },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#1A237E', marginBottom: 6 },
  divider:   { height: 1, backgroundColor: '#F0F0F0', marginBottom: 12 },

  barRow:   { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  barLabel: { width: 120, fontSize: 12, color: '#555' },
  barBg:    { flex: 1, height: 8, backgroundColor: '#E0E0E0', borderRadius: 4, overflow: 'hidden' },
  barFill:  { height: 8, borderRadius: 4 },
  barVal:   { width: 36, textAlign: 'right', fontSize: 12, color: '#333', fontWeight: '600' },

  section:      { width: '100%', marginBottom: 20 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#1A237E', marginBottom: 10 },

  matchCard:   { backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 10, elevation: 2 },
  matchHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  rankBadge:   { fontSize: 12, fontWeight: 'bold', color: '#666' },
  eligBadge:   { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 12 },
  eligText:    { color: '#fff', fontSize: 11, fontWeight: 'bold', textTransform: 'capitalize' },
  uniName:     { fontSize: 14, fontWeight: 'bold', color: '#1A237E' },
  progName:    { fontSize: 13, color: '#555', marginTop: 2 },
  matchMeta:   { flexDirection: 'row', gap: 16, marginTop: 8 },
  metaItem:    { fontSize: 12, color: '#666' },
  reason:      { fontSize: 12, color: '#4CAF50', marginTop: 6 },

  tipCard: {
    backgroundColor: '#FFF8E1', borderRadius: 10, padding: 12,
    marginBottom: 8, borderLeftWidth: 3, borderLeftColor: '#FFD700',
  },
  tipText: { fontSize: 13, color: '#795548' },

  loadingText: { marginTop: 16, color: '#666', fontSize: 15 },
  errorText:   { fontSize: 15, color: '#F44336', textAlign: 'center', marginBottom: 20 },
  retryBtn:    { backgroundColor: '#1A237E', paddingHorizontal: 32, paddingVertical: 12, borderRadius: 10 },
  retryText:   { color: '#fff', fontWeight: 'bold', fontSize: 15 },

  backBtn:  { marginTop: 10, marginBottom: 20, backgroundColor: '#1A237E', paddingVertical: 14, paddingHorizontal: 40, borderRadius: 12 },
  backText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
});
