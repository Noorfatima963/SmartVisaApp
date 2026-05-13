import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { getOnboardingDraft } from '../services/storage';

export default function Profile({ navigation }) {
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    try {
      const data = await api.profile.get();

      // Only use draft values if they are NOT present in the API response
      const draft = await getOnboardingDraft();
      if (draft) {
        if (!data.target_country) data.target_country = draft.target_country;
        if (!data.target_degree_type) data.target_degree_type = draft.target_degree_type;
      }

      setProfile(data);
    } catch (err) {
      console.log('Failed to fetch profile', err);
    } finally {
      setLoading(false);
    }
  }

  const userName = profile?.first_name ? `${profile.first_name} ${profile.last_name || ''}` : (user?.name || 'Student');
  const userEmail = profile?.user?.email || user?.email || 'No Email';
  const country = profile?.target_country || "Not Selected";
  const visa = profile?.target_degree_type || "N/A";

  const handleLogout = async () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout", style: "destructive", onPress: async () => {
          await logout();
          navigation.reset({ index: 0, routes: [{ name: 'Start' }] });
        }
      }
    ]);
  };

  const SettingItem = ({ icon, title, isRed }) => (
    <TouchableOpacity style={styles.settingItem}>
      <View style={styles.settingLeft}>
        <Text style={styles.settingIcon}>{icon}</Text>
        <Text style={[styles.settingText, isRed && { color: 'red' }]}>{title}</Text>
      </View>
      <Text style={styles.arrow}>›</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Profile 👤</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>

        {/* Profile Card */}
        {loading ? (
          <ActivityIndicator size="large" color="#1A237E" style={{ marginVertical: 30 }} />
        ) : (
          <View style={styles.profileCard}>
            <View style={styles.avatarContainer}>
              <Text style={{ fontSize: 40 }}>👨‍🎓</Text>
            </View>
            <Text style={styles.name}>{userName}</Text>
            <Text style={styles.email}>{userEmail}</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>Premium Member 🌟</Text>
            </View>

            <TouchableOpacity
              style={styles.editBtn}
              onPress={() => navigation.navigate('ProfileEdit')}
            >
              <Text style={styles.editBtnText}>Edit Profile ✏️</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* User Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Target</Text>
            <Text style={styles.statValue}>{country}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Visa Type</Text>
            <Text style={styles.statValue}>{visa}</Text>
          </View>
        </View>

        {/* Settings Menu */}
        <Text style={styles.sectionTitle}>Settings</Text>

        <View style={styles.menuContainer}>
          <SettingItem icon="🔔" title="Notifications" />
          <SettingItem icon="🔒" title="Privacy & Security" />
          <SettingItem icon="💳" title="Subscription" />
          <SettingItem icon="🎧" title="Help & Support" />
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>

        <Text style={styles.version}>App Version 1.0.0</Text>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F8FF' },

  header: {
    flexDirection: 'row', alignItems: 'center', padding: 20,
    backgroundColor: '#1A237E', elevation: 5
  },
  backBtn: { marginRight: 15 },
  backText: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold' },

  content: { padding: 20 },

  // Profile Card
  profileCard: {
    backgroundColor: '#fff', borderRadius: 20, padding: 20, alignItems: 'center',
    elevation: 3, marginBottom: 20
  },
  avatarContainer: {
    width: 80, height: 80, borderRadius: 40, backgroundColor: '#E8EAF6',
    justifyContent: 'center', alignItems: 'center', marginBottom: 10
  },
  name: { fontSize: 22, fontWeight: 'bold', color: '#1A237E' },
  email: { fontSize: 14, color: '#666', marginBottom: 10 },
  badge: { backgroundColor: '#FFF9C4', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 10, marginBottom: 15 },
  badgeText: { color: '#FBC02D', fontWeight: 'bold', fontSize: 12 },
  editBtn: { backgroundColor: '#E8EAF6', paddingHorizontal: 20, paddingVertical: 8, borderRadius: 10 },
  editBtnText: { color: '#1A237E', fontWeight: 'bold', fontSize: 14 },

  // Stats
  statsContainer: {
    flexDirection: 'row', backgroundColor: '#1A237E', borderRadius: 15, padding: 15,
    justifyContent: 'space-around', alignItems: 'center', marginBottom: 25
  },
  statBox: { alignItems: 'center', flex: 1 },
  statLabel: { color: '#B0BEC5', fontSize: 12 },
  statValue: { color: '#fff', fontWeight: 'bold', fontSize: 16, marginTop: 2 },
  divider: { width: 1, height: '80%', backgroundColor: '#5C6BC0' },

  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 10, marginLeft: 5 },

  // Menu
  menuContainer: { backgroundColor: '#fff', borderRadius: 15, padding: 5, elevation: 2 },
  settingItem: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 15, borderBottomWidth: 1, borderBottomColor: '#F5F5F5'
  },
  settingLeft: { flexDirection: 'row', alignItems: 'center' },
  settingIcon: { fontSize: 18, marginRight: 15 },
  settingText: { fontSize: 16, color: '#333' },
  arrow: { fontSize: 18, color: '#999' },

  // Logout
  logoutBtn: {
    marginTop: 25, backgroundColor: '#FFEBEE', padding: 15, borderRadius: 12,
    alignItems: 'center', borderWidth: 1, borderColor: '#FFCDD2'
  },
  logoutText: { color: '#D32F2F', fontWeight: 'bold', fontSize: 16 },

  version: { textAlign: 'center', marginTop: 20, color: '#999', fontSize: 12 }
});