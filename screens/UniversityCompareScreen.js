import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  StatusBar,
  Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Picker } from '@react-native-picker/picker';

const { width } = Dimensions.get('window');

export default function UniversityCompare({ navigation }) {
  
  // 1. EXTENDED DATA SOURCE (Full Details)
  const universities = [
    { 
        id: '1', name: 'Harvard Uni', full: 'Harvard University', country: 'USA 🇺🇸', 
        fee: 55000, rank: 1, ielts: 7.5, acceptance: '5%', 
        living: 20000, psw: '1-3 Yrs', scholarship: 'Limited', sat: 'Required'
    },
    { 
        id: '2', name: 'Oxford Uni', full: 'University of Oxford', country: 'UK 🇬🇧', 
        fee: 40000, rank: 2, ielts: 7.5, acceptance: '17%', 
        living: 15000, psw: '2 Yrs', scholarship: 'Chevening', sat: 'Optional'
    },
    { 
        id: '3', name: 'U of Toronto', full: 'University of Toronto', country: 'Canada 🇨🇦', 
        fee: 35000, rank: 21, ielts: 6.5, acceptance: '43%', 
        living: 12000, psw: '3 Yrs', scholarship: 'Merit-Based', sat: 'Optional'
    },
    { 
        id: '4', name: 'Melbourne Uni', full: 'University of Melbourne', country: 'Australia 🇦🇺', 
        fee: 30000, rank: 33, ielts: 6.5, acceptance: '70%', 
        living: 18000, psw: '2-4 Yrs', scholarship: 'Available', sat: 'No'
    },
    { 
        id: '5', name: 'LUMS', full: 'LUMS Pakistan', country: 'Pakistan 🇵🇰', 
        fee: 5000, rank: 600, ielts: 0, acceptance: '50%', 
        living: 3000, psw: 'N/A', scholarship: 'Financial Aid', sat: 'LCAT/SAT'
    },
    { 
        id: '6', name: 'TU Munich', full: 'Technical Univ Munich', country: 'Germany 🇩🇪', 
        fee: 200, rank: 50, ielts: 6.5, acceptance: '8%', 
        living: 10000, psw: '1.5 Yrs', scholarship: 'DAAD', sat: 'No'
    },
    { 
        id: '7', name: 'NUS', full: 'National Univ Singapore', country: 'Singapore 🇸🇬', 
        fee: 25000, rank: 11, ielts: 6.5, acceptance: '5%', 
        living: 14000, psw: '1 Yr', scholarship: 'Bond-Free', sat: 'Required'
    },
  ];

  // 2. STATE
  const [uni1, setUni1] = useState(universities[0]); 
  const [uni2, setUni2] = useState(universities[1]);
  const [winner, setWinner] = useState(null);

  // 3. SELECTION HANDLERS
  const handleSelectUni1 = (id) => setUni1(universities.find(u => u.id === id));
  const handleSelectUni2 = (id) => setUni2(universities.find(u => u.id === id));

  // 4. SMART VERDICT ENGINE (Automatic Calculation)
  useEffect(() => {
    // Simple Score Logic
    let score1 = 0;
    let score2 = 0;

    // Rank Logic (Lower is better)
    uni1.rank < uni2.rank ? score1++ : score2++;
    
    // Fee Logic (Lower is better)
    uni1.fee < uni2.fee ? score1++ : score2++;
    
    // Acceptance Logic (Higher is better - simplified string check)
    parseInt(uni1.acceptance) > parseInt(uni2.acceptance) ? score1++ : score2++;

    // Verdict String
    if (score1 > score2) setWinner({ name: uni1.name, reason: 'Better Rank & Reputation 🏆' });
    else if (score2 > score1) setWinner({ name: uni2.name, reason: 'Better Value & Acceptance 🚀' });
    else setWinner({ name: 'Tie', reason: 'Both are equally good options! 🤝' });

  }, [uni1, uni2]);

  // 5. RENDER ROW COMPONENT
  const ComparisonRow = ({ label, val1, val2, type, icon }) => {
    let color1 = '#333';
    let color2 = '#333';
    let weight1 = 'normal';
    let weight2 = 'normal';

    const setHighlight = (betterSide) => {
        if (betterSide === 1) { color1 = '#2E7D32'; color2 = '#D32F2F'; weight1 = 'bold'; }
        else { color2 = '#2E7D32'; color1 = '#D32F2F'; weight2 = 'bold'; }
    };

    // Logic Engine
    if (type === 'fee' || type === 'living' || type === 'rank') {
       // Lower is Better
       if (val1 < val2) setHighlight(1);
       else if (val2 < val1) setHighlight(2);
    } 
    else if (type === 'acceptance') {
       // Higher is Better
       if (parseInt(val1) > parseInt(val2)) setHighlight(1);
       else if (parseInt(val2) > parseInt(val1)) setHighlight(2);
    }
    else if (type === 'psw') {
       // Longer string (approx) is better logic
       if (val1.length > val2.length || val1.includes('4')) setHighlight(1); 
       // Note: This is simple logic, real app would parse numbers
    }

    return (
      <View style={styles.row}>
        <View style={styles.labelContainer}>
             <Text style={styles.rowIcon}>{icon}</Text>
             <Text style={styles.cellLabel}>{label}</Text>
        </View>
        <Text style={[styles.cellValue, { color: color1, fontWeight: weight1 }]}>
            {type === 'fee' || type === 'living' ? `$${val1.toLocaleString()}` : val1}
        </Text>
        <Text style={[styles.cellValue, { color: color2, fontWeight: weight2 }]}>
            {type === 'fee' || type === 'living' ? `$${val2.toLocaleString()}` : val2}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#1A237E" barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Uni Clash ⚔️</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* Selectors */}
        <View style={styles.selectorContainer}>
            <View style={[styles.pickerWrapper, {backgroundColor: '#E8EAF6'}]}>
                <Picker
                    selectedValue={uni1.id}
                    onValueChange={handleSelectUni1}
                    style={styles.picker}
                    dropdownIconColor="#1A237E"
                >
                    {universities.map((u) => <Picker.Item key={u.id} label={u.name} value={u.id} style={{fontSize:13}} />)}
                </Picker>
            </View>

            <View style={styles.vsCircle}>
                <Text style={styles.vsText}>VS</Text>
            </View>

            <View style={[styles.pickerWrapper, {backgroundColor: '#FFF3E0'}]}>
                <Picker
                    selectedValue={uni2.id}
                    onValueChange={handleSelectUni2}
                    style={styles.picker}
                    dropdownIconColor="#E65100"
                >
                    {universities.map((u) => <Picker.Item key={u.id} label={u.name} value={u.id} style={{fontSize:13}} />)}
                </Picker>
            </View>
        </View>

        {/* --- MAIN COMPARISON TABLE --- */}
        <View style={styles.tableCard}>
            
            {/* Table Header */}
            <View style={styles.headerRow}>
                <View style={{flex:1}} />
                <View style={{flex:1, alignItems:'center'}}>
                    <Text style={{fontSize:30, marginBottom:5}}>{uni1.country.split(' ')[1]}</Text>
                    <Text style={styles.headerUniName}>{uni1.country.split(' ')[0]}</Text>
                </View>
                <View style={{flex:1, alignItems:'center'}}>
                    <Text style={{fontSize:30, marginBottom:5}}>{uni2.country.split(' ')[1]}</Text>
                    <Text style={styles.headerUniName}>{uni2.country.split(' ')[0]}</Text>
                </View>
            </View>

            <View style={styles.divider} />

            {/* Rows */}
            <ComparisonRow label="Global Rank" icon="🏆" val1={uni1.rank} val2={uni2.rank} type="rank" />
            <ComparisonRow label="Tuition / Yr" icon="🎓" val1={uni1.fee} val2={uni2.fee} type="fee" />
            <ComparisonRow label="Living Cost" icon="🏠" val1={uni1.living} val2={uni2.living} type="living" />
            <ComparisonRow label="Acceptance" icon="🎟️" val1={uni1.acceptance} val2={uni2.acceptance} type="acceptance" />
            <ComparisonRow label="IELTS Req" icon="🗣️" val1={uni1.ielts > 0 ? uni1.ielts : 'None'} val2={uni2.ielts > 0 ? uni2.ielts : 'None'} type="ielts" />
            <ComparisonRow label="PSW Visa" icon="🛂" val1={uni1.psw} val2={uni2.psw} type="psw" />
            <ComparisonRow label="Scholarship" icon="💰" val1={uni1.scholarship} val2={uni2.scholarship} type="text" />
            
             <View style={[styles.row, {borderBottomWidth:0}]}>
                <View style={styles.labelContainer}>
                     <Text style={styles.rowIcon}>📝</Text>
                     <Text style={styles.cellLabel}>SAT/GRE</Text>
                </View>
                <Text style={styles.cellValue}>{uni1.sat}</Text>
                <Text style={styles.cellValue}>{uni2.sat}</Text>
            </View>

        </View>

        {/* --- AI VERDICT --- */}
        {winner && winner.name !== 'Tie' && (
            <View style={styles.verdictCard}>
                <Text style={styles.verdictTitle}>AI Verdict 🤖</Text>
                <Text style={styles.winnerName}>{winner.name} Wins!</Text>
                <Text style={styles.reasonText}>{winner.reason}</Text>
            </View>
        )}

        <Text style={styles.note}>
            * Data is approximate. Green indicates a generally 'better' metric.
        </Text>

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

  content: { padding: 15, paddingBottom: 30 },

  // SELECTORS
  selectorContainer: { 
      flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', 
      marginBottom: 20, paddingHorizontal: 5 
  },
  pickerWrapper: { 
      flex: 1, borderRadius: 12, overflow: 'hidden', elevation: 2, height: 50, justifyContent: 'center' 
  },
  picker: { width: '100%', color: '#333' },
  
  vsCircle: { 
      width: 40, height: 40, borderRadius: 20, backgroundColor: '#1A237E', 
      justifyContent: 'center', alignItems: 'center', marginHorizontal: 10, elevation: 5 
  },
  vsText: { color: '#FFD700', fontWeight: 'bold', fontSize: 14 },

  // TABLE
  tableCard: { backgroundColor: '#fff', borderRadius: 15, padding: 10, elevation: 4, marginBottom: 20 },
  
  headerRow: { flexDirection: 'row', paddingVertical: 10 },
  headerUniName: { fontWeight: 'bold', color: '#333', fontSize: 14 },
  
  divider: { height: 2, backgroundColor: '#F0F0F0', marginBottom: 5 },

  row: { 
      flexDirection: 'row', paddingVertical: 14, 
      borderBottomWidth: 1, borderBottomColor: '#F5F5F5', alignItems: 'center' 
  },
  labelContainer: { flex: 1.2, flexDirection: 'row', alignItems: 'center' },
  rowIcon: { marginRight: 6, fontSize: 14 },
  cellLabel: { fontSize: 12, color: '#666', fontWeight: '600' },
  cellValue: { flex: 1, textAlign: 'center', fontSize: 13, color: '#333' },

  // VERDICT
  verdictCard: { 
      backgroundColor: '#333', borderRadius: 15, padding: 20, alignItems: 'center', 
      elevation: 5, shadowColor: '#000', shadowOpacity: 0.3 
  },
  verdictTitle: { color: '#FFD700', fontWeight: 'bold', marginBottom: 5, letterSpacing: 1 },
  winnerName: { color: '#fff', fontSize: 22, fontWeight: 'bold', marginBottom: 5 },
  reasonText: { color: '#ccc', fontSize: 14, fontStyle: 'italic' },

  note: { marginTop: 20, textAlign: 'center', color: '#999', fontSize: 11 }
});