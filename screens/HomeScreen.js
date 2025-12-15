// screens/HomeScreen.js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';

export default function HomeScreen({ navigation }) {
  const menu = [
    { title: "Success Chance", screen: "SuccessProbability", icon: "📊" },
    { title: "Doc Checker", screen: "DocumentChecker", icon: "📑" },
    { title: "Eligibility", screen: "Eligibility", icon: "✅" },
    { title: "Uni Compare", screen: "UniversityCompare", icon: "VS" },
    { title: "Visa Timeline", screen: "VisaTimeline", icon: "⏳" }, // Ensure you have this screen file
    { title: "Cost Estimator", screen: "CostEstimator", icon: "💰" },
    { title: "AI Chatbot", screen: "Chatbot", icon: "🤖" },
  ];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.headerBox}>
        <Text style={styles.header}>SmartVisa Dashboard</Text>
        <Text style={styles.sub}>Select a tool to begin</Text>
      </View>

      <View style={styles.grid}>
        {menu.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.card}
            activeOpacity={0.7}
            onPress={() => navigation.navigate(item.screen)}
          >
            <View style={styles.iconCircle}>
              <Text style={styles.iconText}>{item.icon}</Text>
            </View>
            <Text style={styles.cardTitle}>{item.title}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: "#F5F7FA", padding: 20 },
  headerBox: { marginBottom: 20, alignItems: 'center' },
  header: { fontSize: 28, fontWeight: "bold", color: "#1A237E" },
  sub: { fontSize: 16, color: "#757575", marginTop: 5 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  card: {
    width: '48%', backgroundColor: "#fff", padding: 15, borderRadius: 15, marginBottom: 15,
    alignItems: 'center', elevation: 4, shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 5
  },
  iconCircle: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#E8EAF6', justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  iconText: { fontSize: 24 },
  cardTitle: { fontSize: 14, fontWeight: "600", color: "#333", textAlign: 'center' },
});