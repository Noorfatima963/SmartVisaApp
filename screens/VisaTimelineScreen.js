import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  StatusBar,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Custom Button (Optional usage)
import PrimaryButton from '../components/PrimaryButton';

export default function VisaTimeline({ navigation, route }) {
  
  // 1. Dashboard se Data Receive karna
  const { userData } = route.params || {};
  const country = userData?.selectedCountry || 'USA'; // Default to USA if no data

  const [steps, setSteps] = useState([]);
  const [completedCount, setCompletedCount] = useState(0);

  // --- 2. SMART TIMELINE GENERATOR ---
  useEffect(() => {
    generateTimeline();
  }, []);

  const generateTimeline = () => {
    const today = new Date();
    
    // Helper to add days to date
    const addDays = (days) => {
      const result = new Date(today);
      result.setDate(result.getDate() + days);
      return result.toDateString().slice(4, 10); // e.g. "Oct 12"
    };

    // --- COUNTRY SPECIFIC LOGIC ---
    let roadmap = [];

    if (country === 'USA') {
      roadmap = [
        { id: '1', title: 'Profile Assessment', date: addDays(-5), status: 'completed', desc: 'Initial profile evaluation complete.', icon: '📋' },
        { id: '2', title: 'University Shortlisting', date: addDays(0), status: 'completed', desc: 'Selected universities based on CGPA.', icon: '🏫' },
        { id: '3', title: 'Apply & Get Offer', date: addDays(15), status: 'current', desc: 'Waiting for acceptance letters.', icon: '📩' },
        { id: '4', title: 'Request I-20 Form', date: addDays(30), status: 'pending', desc: 'Proof of funds required for I-20.', icon: '📄' },
        { id: '5', title: 'Pay SEVIS Fee', date: addDays(35), status: 'pending', desc: 'Pay $350 SEVIS I-901 fee online.', icon: '💸' },
        { id: '6', title: 'DS-160 & Interview', date: addDays(45), status: 'pending', desc: 'Book embassy appointment slots.', icon: '🎤' },
        { id: '7', title: 'Visa Decision', date: addDays(60), status: 'pending', desc: 'Passport collection.', icon: '🛂' },
      ];
    } 
    else if (country === 'UK') {
      roadmap = [
        { id: '1', title: 'Profile Assessment', date: addDays(-5), status: 'completed', desc: 'Profile evaluation done.', icon: '📋' },
        { id: '2', title: 'Apply for Offer', date: addDays(0), status: 'completed', desc: 'Applications submitted via UCAS/Direct.', icon: '🏫' },
        { id: '3', title: 'Unconditional Offer', date: addDays(20), status: 'current', desc: 'Fulfill conditions (IELTS/Grades).', icon: '✅' },
        { id: '4', title: 'Request CAS Letter', date: addDays(30), status: 'pending', desc: 'Confirmation of Acceptance for Studies.', icon: '📄' },
        { id: '5', title: 'TB Medical Test', date: addDays(35), status: 'pending', desc: 'Get certificate from approved clinic.', icon: '🏥' },
        { id: '6', title: 'Visa Application', date: addDays(40), status: 'pending', desc: 'Pay IHS Surcharge & Visa Fee.', icon: '💷' },
        { id: '7', title: 'Biometrics', date: addDays(45), status: 'pending', desc: 'Visit VFS Global center.', icon: '👆' },
      ];
    }
    else {
      // Generic Roadmap (Canada/Australia etc.)
      roadmap = [
        { id: '1', title: 'University Search', date: addDays(-2), status: 'completed', desc: 'Found matching courses.', icon: '🔍' },
        { id: '2', title: 'Submit Application', date: addDays(0), status: 'current', desc: 'Sending documents to uni.', icon: '📤' },
        { id: '3', title: 'Offer Letter', date: addDays(25), status: 'pending', desc: 'Receive Letter of Acceptance.', icon: '📩' },
        { id: '4', title: 'Fee Payment', date: addDays(30), status: 'pending', desc: 'Pay 1st semester tuition fee.', icon: '💰' },
        { id: '5', title: 'Medical Exam', date: addDays(40), status: 'pending', desc: 'Health checkup required.', icon: '🏥' },
        { id: '6', title: 'File Visa', date: addDays(50), status: 'pending', desc: 'Submit visa application online.', icon: '💻' },
        { id: '7', title: 'Fly High', date: addDays(90), status: 'pending', desc: 'Book flight tickets.', icon: '✈️' },
      ];
    }

    setSteps(roadmap);
    calculateProgress(roadmap);
  };

  const calculateProgress = (data) => {
    const done = data.filter(s => s.status === 'completed').length;
    setCompletedCount(done);
  };

  // --- 3. INTERACTIVE STATUS TOGGLE ---
  const handleStepClick = (index) => {
    // Demo Logic: User can mark 'current' step as 'completed'
    const newSteps = [...steps];
    const clickedStep = newSteps[index];

    if (clickedStep.status === 'current') {
        Alert.alert(
            "Mark as Done?",
            `Have you completed: ${clickedStep.title}?`,
            [
                { text: "No", style: "cancel" },
                { text: "Yes, Completed", onPress: () => {
                    newSteps[index].status = 'completed';
                    if (index + 1 < newSteps.length) {
                        newSteps[index + 1].status = 'current'; // Next step becomes current
                    }
                    setSteps(newSteps);
                    calculateProgress(newSteps);
                }}
            ]
        );
    }
  };

  const renderItem = ({ item, index }) => {
    const isCompleted = item.status === 'completed';
    const isCurrent = item.status === 'current';
    
    return (
      <TouchableOpacity 
        style={styles.itemContainer} 
        activeOpacity={0.9}
        onPress={() => handleStepClick(index)}
      >
        {/* Left Side: Time & Line */}
        <View style={styles.leftColumn}>
          <Text style={styles.dateText}>{item.date}</Text>
          
          {/* Vertical Line */}
          {index !== steps.length - 1 && <View style={styles.line} />}
          
          {/* Dot/Circle */}
          <View style={[
            styles.dot, 
            isCompleted ? styles.dotCompleted : isCurrent ? styles.dotCurrent : styles.dotPending
          ]}>
             {isCompleted && <Text style={{fontSize: 10, color: '#fff'}}>✓</Text>}
          </View>
        </View>

        {/* Right Side: Card */}
        <View style={[
          styles.card, 
          isCurrent ? styles.cardCurrent : styles.cardNormal,
          isCompleted && styles.cardCompleted
        ]}>
          <View style={{flexDirection:'row', justifyContent:'space-between'}}>
            <Text style={[styles.cardTitle, isCurrent && {color: '#1A237E'}]}>{item.icon} {item.title}</Text>
            {isCompleted && <Text style={{fontSize:12, color:'green'}}>Done</Text>}
          </View>
          
          <Text style={styles.cardDesc}>{item.desc}</Text>
          
          {isCurrent && (
             <View style={styles.actionBadge}>
                <Text style={styles.badgeText}>🔥 Action Required</Text>
                <Text style={styles.tapText}>Tap to complete</Text>
             </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const progressPercent = steps.length > 0 ? (completedCount / steps.length) * 100 : 0;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#1A237E" barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <View>
            <Text style={styles.headerTitle}>Visa Roadmap 🗺️</Text>
            <Text style={styles.headerSub}>Target: {country}</Text>
        </View>
      </View>

      {/* Progress Dashboard */}
      <View style={styles.progressContainer}>
         <View style={styles.progressRow}>
             <Text style={styles.progressLabel}>Process Completion</Text>
             <Text style={styles.progressPercent}>{Math.round(progressPercent)}%</Text>
         </View>
         <View style={styles.progressBarBg}>
             <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
         </View>
         <Text style={styles.progressNote}>
            {completedCount} of {steps.length} steps completed
         </Text>
      </View>

      <FlatList
        data={steps}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F8FF' },
  
  header: { 
    flexDirection: 'row', alignItems: 'center', padding: 20, paddingTop: 40,
    backgroundColor: '#1A237E', borderBottomLeftRadius: 25, borderBottomRightRadius: 25,
    elevation: 5
  },
  backBtn: { marginRight: 15 },
  backText: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  headerSub: { color: '#B0BEC5', fontSize: 13 },

  // Progress Section
  progressContainer: { 
    margin: 20, padding: 20, backgroundColor: '#fff', borderRadius: 15,
    elevation: 3, marginTop: -25, marginBottom: 10
  },
  progressRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  progressLabel: { fontSize: 14, fontWeight: 'bold', color: '#555' },
  progressPercent: { fontSize: 16, fontWeight: 'bold', color: '#1A237E' },
  progressBarBg: { height: 8, backgroundColor: '#F0F0F0', borderRadius: 4, overflow: 'hidden' },
  progressBarFill: { height: '100%', backgroundColor: '#4CAF50', borderRadius: 4 },
  progressNote: { marginTop: 10, fontSize: 12, color: '#999', textAlign: 'center' },

  listContent: { padding: 20, paddingTop: 10 },

  itemContainer: { flexDirection: 'row', marginBottom: 20 },
  
  leftColumn: { width: 50, alignItems: 'center', marginRight: 15 },
  dateText: { fontSize: 11, fontWeight: 'bold', color: '#1A237E', marginBottom: 5 },
  
  line: { 
    position: 'absolute', top: 25, bottom: -30, width: 2, 
    backgroundColor: '#E0E0E0', zIndex: -1 
  },
  
  dot: { 
      width: 20, height: 20, borderRadius: 10, borderWidth: 2, 
      backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center' 
  },
  dotCompleted: { borderColor: '#4CAF50', backgroundColor: '#4CAF50' }, 
  dotCurrent: { borderColor: '#FFD700', backgroundColor: '#fff', width: 24, height: 24, borderWidth: 4 }, 
  dotPending: { borderColor: '#BDBDBD' }, 

  // Cards
  card: { 
    flex: 1, backgroundColor: '#fff', padding: 15, borderRadius: 12,
    elevation: 2, shadowColor: '#000', shadowOpacity: 0.05
  },
  cardCurrent: { 
    borderLeftWidth: 4, borderLeftColor: '#FFD700', backgroundColor: '#FFFDE7', elevation: 4 
  },
  cardCompleted: {
    opacity: 0.8, backgroundColor: '#F1F8E9'
  },
  cardNormal: {
    borderLeftWidth: 4, borderLeftColor: '#E0E0E0'
  },
  
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 4 },
  cardDesc: { fontSize: 13, color: '#666', lineHeight: 18 },
  
  actionBadge: { 
    marginTop: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.2)', padding: 8, borderRadius: 8
  },
  badgeText: { fontSize: 12, fontWeight: 'bold', color: '#E65100' },
  tapText: { fontSize: 10, color: '#E65100', fontStyle: 'italic' }
});