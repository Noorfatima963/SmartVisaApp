import React, { useEffect, useState } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  StatusBar, 
  Dimensions 
} from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

export default function Dashboard({ route, navigation }) {
  // 1. Data Safe Extraction
  const {
    selectedCountry,
    visaType,
    financialData, 
  } = route?.params || {};

  // 2. Data Formatting
  const userBudget = financialData?.budget ? `$${financialData.budget}` : "Not Set";
  const targetCountry = selectedCountry || "Select Country";
  const currentVisa = visaType || "Student";
  const userName = "Scholar"; 

  // Smart Greeting Logic
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning ☀️";
    if (hour < 18) return "Good Afternoon 🌤️";
    return "Good Evening 🌙";
  };

  // 3. Features Data (SOP Writer Removed)
  const features = [
    { id: 1, title: "Success Chance", screen: "SuccessProbability", icon: "📊", color: "#E3F2FD", iconColor: "#1565C0" },
    { id: 2, title: "Doc Checker", screen: "DocumentChecker", icon: "📑", color: "#E8F5E9", iconColor: "#2E7D32" },
    { id: 3, title: "Eligibility", screen: "Eligibility", icon: "✅", color: "#FFF3E0", iconColor: "#EF6C00" },
    { id: 4, title: "Uni Compare", screen: "UniversityCompare", icon: "⚖️", color: "#F3E5F5", iconColor: "#7B1FA2" },
    { id: 5, title: "Visa Timeline", screen: "VisaTimeline", icon: "⏳", color: "#E0F7FA", iconColor: "#00838F" },
    { id: 6, title: "Cost Estimator", screen: "CostEstimator", icon: "💰", color: "#FFEBEE", iconColor: "#C62828" },
    { id: 7, title: "AI Chatbot", screen: "Chatbot", icon: "🤖", color: "#ECEFF1", iconColor: "#455A64" },
  ];

  return (
    <View style={styles.mainContainer}>
      <StatusBar backgroundColor="#1A237E" barStyle="light-content" />
      
      {/* --- HEADER SECTION --- */}
      <View style={styles.header}>
        <View style={styles.headerCircle} />
        
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.welcomeText}>{getGreeting()},</Text>
            <Text style={styles.userName}>{userName} 🎓</Text>
          </View>
          <TouchableOpacity 
            style={styles.profileBtn} 
            onPress={() => navigation.navigate('Profile', { userData: route?.params })}
            activeOpacity={0.8}
          >
            <View style={styles.avatarCircle}>
              <Text style={{fontSize: 22}}>👤</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
      >
        
        {/* --- SUMMARY CARD (Floating) --- */}
        <View style={styles.summaryCard}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardTitle}>My Application Status</Text>
            {/* Status Badge */}
            <View style={styles.statusBadge}>
                <View style={styles.pulseDot} />
                <Text style={styles.statusText}>In Progress</Text>
            </View>
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.statsRow}>
            {/* Target Country */}
            <View style={styles.statItem}>
              <View style={[styles.iconBox, { backgroundColor: '#E8EAF6' }]}>
                <Text style={{fontSize: 18}}>🌍</Text>
              </View>
              <Text style={styles.statLabel}>Target</Text>
              <Text style={styles.statValue} numberOfLines={1}>{targetCountry}</Text>
            </View>

            {/* Visa Type */}
            <View style={styles.statItem}>
              <View style={[styles.iconBox, { backgroundColor: '#FFF3E0' }]}>
                <Text style={{fontSize: 18}}>🛂</Text>
              </View>
              <Text style={styles.statLabel}>Visa</Text>
              <Text style={styles.statValue} numberOfLines={1}>{currentVisa}</Text>
            </View>

            {/* Budget */}
            <View style={styles.statItem}>
              <View style={[styles.iconBox, { backgroundColor: '#E8F5E9' }]}>
                <Text style={{fontSize: 18}}>💵</Text>
              </View>
              <Text style={styles.statLabel}>Budget</Text>
              <Text style={styles.statValue} numberOfLines={1}>{userBudget}</Text>
            </View>
          </View>

          {/* --- EDIT PROFILE BUTTON --- */}
          <TouchableOpacity 
            style={styles.editProfileBtn}
            onPress={() => navigation.navigate("Onboarding", { screen: "Step1_Country" })}
            activeOpacity={0.7}
          >
            <Text style={styles.editProfileText}>Update My Profile ✏️</Text>
          </TouchableOpacity>

        </View>

        {/* --- FEATURES GRID --- */}
        <Text style={styles.sectionHeading}>Explore Tools</Text>
        
        <View style={styles.gridContainer}>
          {features.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.gridItem}
              activeOpacity={0.7}
              onPress={() => navigation.navigate(item.screen, { userData: route?.params })}
            >
              <View style={[styles.gridIconCircle, { backgroundColor: item.color }]}>
                <Text style={{fontSize: 28}}>{item.icon}</Text>
              </View>
              <Text style={styles.gridLabel}>{item.title}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* --- LOGOUT BUTTON --- */}
        <TouchableOpacity 
          style={styles.logoutBtn}
          activeOpacity={0.8}
          onPress={async () => {
             await AsyncStorage.clear();
             navigation.replace('Start');
          }}
        >
          <Text style={styles.logoutText}>Safe Logout</Text>
        </TouchableOpacity>
        
        <Text style={styles.versionText}>SmartVisa v2.0 • Made with ❤️</Text>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: "#F8F9FA" },
  
  // --- HEADER STYLES ---
  header: {
    backgroundColor: "#1A237E",
    paddingTop: 50, 
    paddingBottom: 80, 
    paddingHorizontal: 25,
    borderBottomLeftRadius: 35,
    borderBottomRightRadius: 35,
    position: 'relative',
    overflow: 'hidden',
    elevation: 10,
    shadowColor: '#1A237E', shadowOpacity: 0.5, shadowRadius: 15,
  },
  headerCircle: {
    position: 'absolute', top: -60, right: -60, width: 220, height: 220,
    borderRadius: 110, backgroundColor: 'rgba(255,255,255,0.08)',
  },
  headerContent: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  welcomeText: { color: "#E8EAF6", fontSize: 16, marginBottom: 5, opacity: 0.9, fontWeight:'500' },
  userName: { color: "#fff", fontSize: 26, fontWeight: "bold", letterSpacing: 0.5 },
  profileBtn: { padding: 4, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 50 },
  avatarCircle: {
    width: 48, height: 48, backgroundColor: '#fff', borderRadius: 24,
    justifyContent: 'center', alignItems: 'center',
  },

  scrollContent: { paddingHorizontal: 20, paddingBottom: 30 },

  summaryCard: {
    backgroundColor: "#fff", borderRadius: 24, padding: 22, marginTop: -60, marginBottom: 25,
    elevation: 12, shadowColor: "#000", shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1, shadowRadius: 10, borderTopWidth: 5, borderTopColor: '#FFC107',
  },
  cardHeaderRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15
  },
  cardTitle: { fontSize: 17, fontWeight: "bold", color: "#333" },
  statusBadge: {
    backgroundColor: '#E3F2FD', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20,
    flexDirection: 'row', alignItems: 'center'
  },
  pulseDot: {
    width: 8, height: 8, borderRadius: 4, backgroundColor: '#2196F3', marginRight: 6
  },
  statusText: { color: '#1565C0', fontSize: 11, fontWeight: 'bold' },

  divider: { height: 1, backgroundColor: "#F5F5F5", marginBottom: 20 },
  
  statsRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 25 },
  statItem: { alignItems: "center", width: '30%' },
  iconBox: {
    width: 45, height: 45, borderRadius: 15, justifyContent: 'center', alignItems: 'center', marginBottom: 10
  },
  statLabel: { fontSize: 12, color: "#888", marginBottom: 3, fontWeight: '500' },
  statValue: { fontSize: 15, fontWeight: "bold", color: "#1A237E", textAlign: "center" },

  editProfileBtn: {
    backgroundColor: '#F5F8FF', paddingVertical: 14, borderRadius: 16,
    alignItems: 'center', borderWidth: 1.5, borderColor: '#C5CAE9', borderStyle: 'dashed'
  },
  editProfileText: { color: '#1A237E', fontWeight: 'bold', fontSize: 14 },

  sectionHeading: {
    fontSize: 20, fontWeight: '800', color: '#333', marginBottom: 15, marginLeft: 5
  },
  gridContainer: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
  gridItem: {
    width: (width - 55) / 2, backgroundColor: "#fff", padding: 16, borderRadius: 20, marginBottom: 15,
    alignItems: "flex-start", elevation: 4, shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 6,
  },
  gridIconCircle: {
    width: 58, height: 58, borderRadius: 18, justifyContent: "center", alignItems: "center", marginBottom: 14,
  },
  gridLabel: { fontSize: 15, fontWeight: "700", color: "#333" },

  logoutBtn: {
    marginTop: 15, backgroundColor: '#fff', paddingVertical: 16, borderRadius: 16,
    alignItems: 'center', borderWidth: 1, borderColor: '#FFEBEE'
  },
  logoutText: { color: '#D32F2F', fontWeight: 'bold', fontSize: 16 },
  versionText: { textAlign: 'center', color: '#BBB', fontSize: 12, marginTop: 25, fontWeight: '500' }
});