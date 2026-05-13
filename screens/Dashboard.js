import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, StatusBar, Dimensions, ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { isProfileComplete, getOnboardingDraft } from '../services/storage';
import api from '../services/api';

const { width } = Dimensions.get('window');

const FEATURES = [
  { id: 1, title: 'Success Chance', screen: 'SuccessProbability', icon: '📊', color: '#E3F2FD', iconColor: '#1565C0' },
  { id: 2, title: 'Doc Checker', screen: 'DocumentChecker', icon: '📑', color: '#E8F5E9', iconColor: '#2E7D32' },
  { id: 3, title: 'Eligibility', screen: 'Eligibility', icon: '✅', color: '#FFF3E0', iconColor: '#EF6C00' },
  { id: 4, title: 'Uni Compare', screen: 'UniversityCompare', icon: '⚖️', color: '#F3E5F5', iconColor: '#7B1FA2' },
  { id: 5, title: 'Visa Timeline', screen: 'VisaTimeline', icon: '⏳', color: '#E0F7FA', iconColor: '#00838F' },
  { id: 6, title: 'Cost Estimator', screen: 'CostEstimator', icon: '💰', color: '#FFEBEE', iconColor: '#C62828' },
  { id: 7, title: 'AI Chatbot', screen: 'Chatbot', icon: '🤖', color: '#ECEFF1', iconColor: '#455A64' },
];

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good Morning ☀️';
  if (h < 18) return 'Good Afternoon 🌤️';
  return 'Good Evening 🌙';
};

export default function Dashboard({ navigation }) {
  const { user, logout } = useAuth();

  const [profileDone, setProfileDone] = useState(true);
  const [profileData, setProfileData] = useState(null);
  const [resumeStep, setResumeStep] = useState(1);
  const [loadingProfile, setLoadingProfile] = useState(true);

  const STEP_SCREENS = {
    1: 'Step1_PersonalInfo', 2: 'Step2_Country', 3: 'Step3_Education',
    4: 'Step4_Language', 5: 'Step5_Financial', 6: 'Step6_Background',
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  async function loadDashboardData() {
    try {
      const done = await isProfileComplete();
      setProfileDone(done);

      if (!done) {
        const draft = await getOnboardingDraft();
        setResumeStep(draft?.step_reached || 1);
      }

      // Load full profile from API
      const data = await api.profile.get();

      // Only use draft values if they are NOT present in the API response
      const draft = await getOnboardingDraft();
      if (draft) {
        if (!data.target_country) data.target_country = draft.target_country;
        if (!data.target_degree_type) data.target_degree_type = draft.target_degree_type;
      }

      setProfileData(data);
    } catch (err) {
      // API unreachable — use local draft as fallback
      const draft = await getOnboardingDraft();
      if (draft) {
        setProfileData({
          target_country: draft.target_country,
          target_degree_type: draft.target_degree_type,
        });
      }
    } finally {
      setLoadingProfile(false);
    }
  }

  const handleLogout = async () => {
    await logout();
    navigation.replace('Start');
  };

  const targetCountry = profileData?.target_country || '—';
  const degreeType = profileData?.target_degree_type || '—';
  const savingsUsd = profileData?.financial_profile?.approx_savings;
  const budget = savingsUsd ? `$${Number(savingsUsd).toLocaleString()}` : '—';

  return (
    <View style={styles.mainContainer}>
      <StatusBar backgroundColor="#1A237E" barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerCircle} />
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.welcomeText}>{getGreeting()},</Text>
            <Text style={styles.userName}>
              {profileData?.first_name || profileData?.user?.first_name || 'Scholar'} 🎓
            </Text>
          </View>
          <TouchableOpacity
            style={styles.profileBtn}
            onPress={() => navigation.navigate('Profile')}
            activeOpacity={0.8}
          >
            <View style={styles.avatarCircle}>
              <Text style={{ fontSize: 22 }}>👤</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Profile Completion Banner */}
        {!profileDone && (
          <TouchableOpacity
            style={styles.completionBanner}
            onPress={() => navigation.navigate(STEP_SCREENS[resumeStep])}
            activeOpacity={0.85}
          >
            <View style={styles.bannerLeft}>
              <Text style={styles.bannerIcon}>⚠️</Text>
              <View>
                <Text style={styles.bannerTitle}>Complete your profile</Text>
                <Text style={styles.bannerSub}>
                  Resume from Step {resumeStep} — needed for accurate results
                </Text>
              </View>
            </View>
            <Text style={styles.bannerArrow}>→</Text>
          </TouchableOpacity>
        )}

        {/* Summary Card */}
        <View style={styles.summaryCard}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardTitle}>My Application Status</Text>
            <View style={styles.statusBadge}>
              <View style={styles.pulseDot} />
              <Text style={styles.statusText}>In Progress</Text>
            </View>
          </View>

          <View style={styles.divider} />

          {loadingProfile
            ? <ActivityIndicator color="#1A237E" style={{ marginVertical: 20 }} />
            : (
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <View style={[styles.iconBox, { backgroundColor: '#E8EAF6' }]}>
                    <Text style={{ fontSize: 18 }}>🌍</Text>
                  </View>
                  <Text style={styles.statLabel}>Target</Text>
                  <Text style={styles.statValue} numberOfLines={1}>{targetCountry}</Text>
                </View>
                <View style={styles.statItem}>
                  <View style={[styles.iconBox, { backgroundColor: '#FFF3E0' }]}>
                    <Text style={{ fontSize: 18 }}>🎓</Text>
                  </View>
                  <Text style={styles.statLabel}>Degree</Text>
                  <Text style={styles.statValue} numberOfLines={1}>{degreeType}</Text>
                </View>
                <View style={styles.statItem}>
                  <View style={[styles.iconBox, { backgroundColor: '#E8F5E9' }]}>
                    <Text style={{ fontSize: 18 }}>💵</Text>
                  </View>
                  <Text style={styles.statLabel}>Savings</Text>
                  <Text style={styles.statValue} numberOfLines={1}>{budget}</Text>
                </View>
              </View>
            )
          }

          <TouchableOpacity
            style={styles.editProfileBtn}
            onPress={() => navigation.navigate('Profile')}
            activeOpacity={0.7}
          >
            <Text style={styles.editProfileText}>Update My Profile ✏️</Text>
          </TouchableOpacity>
        </View>

        {/* Features Grid */}
        <Text style={styles.sectionHeading}>Explore Tools</Text>
        <View style={styles.gridContainer}>
          {FEATURES.map(item => (
            <TouchableOpacity
              key={item.id}
              style={styles.gridItem}
              activeOpacity={0.7}
              onPress={() => navigation.navigate(item.screen)}
            >
              <View style={[styles.gridIconCircle, { backgroundColor: item.color }]}>
                <Text style={{ fontSize: 28 }}>{item.icon}</Text>
              </View>
              <Text style={styles.gridLabel}>{item.title}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
          <Text style={styles.logoutText}>Safe Logout</Text>
        </TouchableOpacity>

        <Text style={styles.versionText}>SmartVisa v2.0 • Made with ❤️</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: '#F8F9FA' },

  header: {
    backgroundColor: '#1A237E', paddingTop: 50, paddingBottom: 80,
    paddingHorizontal: 25, borderBottomLeftRadius: 35, borderBottomRightRadius: 35,
    position: 'relative', overflow: 'hidden', elevation: 10,
  },
  headerCircle: {
    position: 'absolute', top: -60, right: -60, width: 220, height: 220,
    borderRadius: 110, backgroundColor: 'rgba(255,255,255,0.08)',
  },
  headerContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  welcomeText: { color: '#E8EAF6', fontSize: 16, marginBottom: 5, opacity: 0.9 },
  userName: { color: '#fff', fontSize: 26, fontWeight: 'bold' },
  profileBtn: { padding: 4, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 50 },
  avatarCircle: {
    width: 48, height: 48, backgroundColor: '#fff',
    borderRadius: 24, justifyContent: 'center', alignItems: 'center',
  },

  scrollContent: { paddingHorizontal: 20, paddingBottom: 30 },

  // Completion Banner
  completionBanner: {
    backgroundColor: '#FFF8E1', borderRadius: 14, padding: 16,
    marginTop: 16, marginBottom: 8, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'space-between',
    borderWidth: 1, borderColor: '#FFD54F', elevation: 2,
  },
  bannerLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  bannerIcon: { fontSize: 22, marginRight: 12 },
  bannerTitle: { fontWeight: 'bold', color: '#E65100', fontSize: 14 },
  bannerSub: { color: '#795548', fontSize: 12, marginTop: 2 },
  bannerArrow: { fontSize: 20, color: '#E65100', fontWeight: 'bold' },

  summaryCard: {
    backgroundColor: '#fff', borderRadius: 24, padding: 22,
    marginTop: -60, marginBottom: 25, elevation: 12,
    borderTopWidth: 5, borderTopColor: '#FFC107',
  },
  cardHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  cardTitle: { fontSize: 17, fontWeight: 'bold', color: '#333' },
  statusBadge: {
    backgroundColor: '#E3F2FD', paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 20, flexDirection: 'row', alignItems: 'center',
  },
  pulseDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#2196F3', marginRight: 6 },
  statusText: { color: '#1565C0', fontSize: 11, fontWeight: 'bold' },
  divider: { height: 1, backgroundColor: '#F5F5F5', marginBottom: 20 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 25 },
  statItem: { alignItems: 'center', width: '30%' },
  iconBox: {
    width: 45, height: 45, borderRadius: 15,
    justifyContent: 'center', alignItems: 'center', marginBottom: 10,
  },
  statLabel: { fontSize: 12, color: '#888', marginBottom: 3 },
  statValue: { fontSize: 15, fontWeight: 'bold', color: '#1A237E', textAlign: 'center' },
  editProfileBtn: {
    backgroundColor: '#F5F8FF', paddingVertical: 14, borderRadius: 16,
    alignItems: 'center', borderWidth: 1.5, borderColor: '#C5CAE9', borderStyle: 'dashed',
  },
  editProfileText: { color: '#1A237E', fontWeight: 'bold', fontSize: 14 },

  sectionHeading: { fontSize: 20, fontWeight: '800', color: '#333', marginBottom: 15, marginLeft: 5 },
  gridContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  gridItem: {
    width: (width - 55) / 2, backgroundColor: '#fff', padding: 16,
    borderRadius: 20, marginBottom: 15, elevation: 4,
  },
  gridIconCircle: {
    width: 58, height: 58, borderRadius: 18,
    justifyContent: 'center', alignItems: 'center', marginBottom: 14,
  },
  gridLabel: { fontSize: 15, fontWeight: '700', color: '#333' },
  logoutBtn: {
    marginTop: 15, backgroundColor: '#fff', paddingVertical: 16,
    borderRadius: 16, alignItems: 'center', borderWidth: 1, borderColor: '#FFEBEE',
  },
  logoutText: { color: '#D32F2F', fontWeight: 'bold', fontSize: 16 },
  versionText: { textAlign: 'center', color: '#BBB', fontSize: 12, marginTop: 25 },
});