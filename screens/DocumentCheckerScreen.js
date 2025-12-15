import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function DocumentChecker({ navigation }) {
  
  // 1. Initial State (Documents ki List)
  const [docs, setDocs] = useState([
    { id: '1', name: 'Valid Passport', status: 'pending', icon: '🛂' },
    { id: '2', name: 'University Offer Letter', status: 'pending', icon: '📩' },
    { id: '3', name: 'Bank Statement (6 Months)', status: 'pending', icon: '🏦' },
    { id: '4', name: 'IELTS/TOEFL Score Card', status: 'pending', icon: '📝' },
    { id: '5', name: 'Medical Certificate', status: 'pending', icon: '🏥' },
    { id: '6', name: 'Police Clearance Certificate', status: 'pending', icon: '👮' },
  ]);

  // 2. Logic: Upload & "AI Scan" Simulation
  const handleUpload = (id) => {
    // Pehle status ko 'scanning' karein (Loading dikhane ke liye)
    updateStatus(id, 'scanning');

    // 2 seconds ka wait (Fake Processing)
    setTimeout(() => {
      // 90% chance ke Verify ho jaye, 10% chance ke Error aye (Realism ke liye)
      const isSuccess = Math.random() > 0.1; 
      
      if (isSuccess) {
        updateStatus(id, 'verified');
      } else {
        updateStatus(id, 'error');
        Alert.alert("Scan Failed", "Document blurred. Please upload again.");
      }
    }, 2000);
  };

  // Helper Function status update karne ke liye
  const updateStatus = (id, newStatus) => {
    setDocs(prevDocs => prevDocs.map(doc => 
      doc.id === id ? { ...doc, status: newStatus } : doc
    ));
  };

  // 3. Progress Calculation
  const verifiedCount = docs.filter(d => d.status === 'verified').length;
  const progress = verifiedCount / docs.length;

  const renderItem = ({ item }) => {
    return (
      <View style={styles.card}>
        <View style={styles.iconBox}>
          <Text style={{fontSize: 24}}>{item.icon}</Text>
        </View>
        
        <View style={{flex: 1}}>
          <Text style={styles.docName}>{item.name}</Text>
          <Text style={[
             styles.statusText, 
             item.status === 'verified' ? {color: 'green'} : 
             item.status === 'error' ? {color: 'red'} : {color: '#999'}
          ]}>
             {item.status === 'pending' ? 'Not Uploaded' : 
              item.status === 'scanning' ? 'Scanning...' : 
              item.status === 'verified' ? 'Verified ✅' : 'Re-upload Required ❌'}
          </Text>
        </View>

        {/* Action Button */}
        {item.status === 'scanning' ? (
          <ActivityIndicator color="#1A237E" />
        ) : item.status === 'verified' ? (
          <View style={styles.checkCircle}><Text style={{color:'#fff'}}>✓</Text></View>
        ) : (
          <TouchableOpacity style={styles.uploadBtn} onPress={() => handleUpload(item.id)}>
            <Text style={styles.uploadText}>Upload</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Doc Validator 📑</Text>
      </View>

      {/* Progress Bar Section */}
      <View style={styles.progressSection}>
        <Text style={styles.progressLabel}>Readiness Score: {Math.round(progress * 100)}%</Text>
        <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${progress * 100}%` }]} />
        </View>
        <Text style={styles.progressSub}>
            {verifiedCount} of {docs.length} documents verified
        </Text>
      </View>

      <FlatList
        data={docs}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
      />

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

  // Progress Styles
  progressSection: { padding: 20, backgroundColor: '#fff', borderBottomLeftRadius: 20, borderBottomRightRadius: 20, elevation: 3 },
  progressLabel: { fontSize: 16, fontWeight: 'bold', color: '#1A237E', marginBottom: 10 },
  progressBarBg: { height: 10, backgroundColor: '#E0E0E0', borderRadius: 5, overflow: 'hidden' },
  progressBarFill: { height: '100%', backgroundColor: '#4CAF50' }, // Green Progress
  progressSub: { marginTop: 8, color: '#666', fontSize: 12 },

  listContent: { padding: 20 },

  // Card Styles
  card: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff', padding: 15, borderRadius: 12, marginBottom: 15,
    elevation: 2
  },
  iconBox: {
    width: 50, height: 50, borderRadius: 25, backgroundColor: '#E8EAF6',
    justifyContent: 'center', alignItems: 'center', marginRight: 15
  },
  docName: { fontSize: 16, fontWeight: '600', color: '#333' },
  statusText: { fontSize: 12, marginTop: 4 },

  uploadBtn: {
    backgroundColor: '#1A237E', paddingVertical: 8, paddingHorizontal: 15, borderRadius: 8
  },
  uploadText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },

  checkCircle: {
    width: 30, height: 30, borderRadius: 15, backgroundColor: '#4CAF50',
    justifyContent: 'center', alignItems: 'center'
  }
});