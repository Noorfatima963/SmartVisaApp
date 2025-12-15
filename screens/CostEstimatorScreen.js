import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  ScrollView, 
  TouchableOpacity, 
  Alert,
  KeyboardAvoidingView,
  Platform,
  StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Custom Button
import PrimaryButton from '../components/PrimaryButton';

export default function CostEstimator({ navigation, route }) {
  
  // 1. Get User Data
  const { userData } = route.params || {};
  const selectedCountry = userData?.selectedCountry || 'USA';

  // 2. Country-Specific Defaults (Smart Logic)
  const getDefaults = (country) => {
    switch(country) {
        case 'UK': return { t: '18000', l: '12000', f: '1000', v: '490', m: '1500', curr: '£' };
        case 'Canada': return { t: '25000', l: '15000', f: '1500', v: '150', m: '2000', curr: 'CAD $' };
        case 'Australia': return { t: '30000', l: '20000', f: '1200', v: '650', m: '2000', curr: 'AUD $' };
        case 'Germany': return { t: '500', l: '11208', f: '900', v: '75', m: '1000', curr: '€' }; // Low Tuition, Blocked Account
        default: return { t: '25000', l: '15000', f: '1200', v: '185', m: '2000', curr: '$' }; // USA/Others
    }
  };

  const defaults = getDefaults(selectedCountry);

  // States
  const [tuition, setTuition] = useState(defaults.t);
  const [living, setLiving] = useState(defaults.l);
  const [flight, setFlight] = useState(defaults.f);
  const [visaFee, setVisaFee] = useState(defaults.v);
  const [misc, setMisc] = useState(defaults.m);
  
  const [total, setTotal] = useState(0);

  // Auto Calculate Total
  useEffect(() => {
    const t = parseFloat(tuition) || 0;
    const l = parseFloat(living) || 0;
    const f = parseFloat(flight) || 0;
    const v = parseFloat(visaFee) || 0;
    const m = parseFloat(misc) || 0;
    setTotal(t + l + f + v + m);
  }, [tuition, living, flight, visaFee, misc]);

  // --- SAVE TO PROFILE LOGIC ---
  const handleSaveToProfile = async () => {
    try {
        // 1. Update Object
        const updatedUserData = {
            ...userData,
            financialData: {
                ...userData.financialData,
                budget: total // Update budget with new calculation
            }
        };

        // 2. Save to Storage
        await AsyncStorage.setItem('userData', JSON.stringify(updatedUserData));

        // 3. Feedback
        Alert.alert(
            "Budget Updated!",
            `Your profile budget is now set to ${defaults.curr}${total.toLocaleString()}. This will improve your Success Score analysis.`,
            [
                { text: "OK", onPress: () => navigation.navigate('Dashboard', { userData: updatedUserData }) }
            ]
        );

    } catch (e) {
        console.log(e);
        Alert.alert("Error", "Could not update profile.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#1A237E" barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <View>
            <Text style={styles.headerTitle}>Cost Estimator 💰</Text>
            <Text style={styles.headerSub}>Plan for {selectedCountry}</Text>
        </View>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{flex:1}}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            
            {/* Total Card */}
            <View style={styles.totalCard}>
                <Text style={styles.totalLabel}>Estimated Annual Cost</Text>
                <Text style={styles.totalAmount}>{defaults.curr} {total.toLocaleString()}</Text>
                <Text style={styles.currencyNote}>(Based on current rates)</Text>
            </View>

            {/* Visual Bar */}
            <View style={styles.barContainer}>
                <View style={[styles.barSegment, { flex: parseFloat(tuition)||1, backgroundColor: '#1A237E' }]} />
                <View style={[styles.barSegment, { flex: parseFloat(living)||1, backgroundColor: '#FFD700' }]} />
                <View style={[styles.barSegment, { flex: parseFloat(flight)||0.5, backgroundColor: '#4CAF50' }]} />
            </View>
            <View style={styles.legendRow}>
                <View style={styles.legendItem}><View style={[styles.dot, {backgroundColor:'#1A237E'}]}/><Text style={styles.legendText}>Tuition</Text></View>
                <View style={styles.legendItem}><View style={[styles.dot, {backgroundColor:'#FFD700'}]}/><Text style={styles.legendText}>Living</Text></View>
                <View style={styles.legendItem}><View style={[styles.dot, {backgroundColor:'#4CAF50'}]}/><Text style={styles.legendText}>Travel</Text></View>
            </View>

            {/* Country Tip */}
            {selectedCountry === 'Germany' && (
                <View style={styles.tipBox}>
                    <Text style={styles.tipText}>💡 Tip: Tuition is free in public universities! Just verify the Blocked Account amount (€11,208).</Text>
                </View>
            )}
            {selectedCountry === 'USA' && (
                <View style={styles.tipBox}>
                    <Text style={styles.tipText}>💡 Tip: Living costs vary greatly by state. NYC/LA are 50% more expensive.</Text>
                </View>
            )}

            {/* Inputs */}
            <Text style={styles.sectionTitle}>Expense Breakdown</Text>
            
            <View style={styles.inputCard}>
                <InputItem label="🎓 Tuition Fee" val={tuition} setVal={setTuition} curr={defaults.curr} />
                <InputItem label="🏠 Living (Rent+Food)" val={living} setVal={setLiving} curr={defaults.curr} />
                <InputItem label="✈️ Flight Tickets" val={flight} setVal={setFlight} curr={defaults.curr} />
                <InputItem label="📄 Visa Fees" val={visaFee} setVal={setVisaFee} curr={defaults.curr} />
                <InputItem label="🛍️ Misc / Insurance" val={misc} setVal={setMisc} curr={defaults.curr} />
            </View>

            {/* Update Profile Button */}
            <View style={{marginTop: 20}}>
                <PrimaryButton title="Sync with Profile & Save 💾" onPress={handleSaveToProfile} />
            </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// Sub-component for Inputs to keep code clean
const InputItem = ({ label, val, setVal, curr }) => (
    <View style={styles.inputRow}>
        <Text style={styles.label}>{label}</Text>
        <View style={styles.inputWrapper}>
            <Text style={styles.currPrefix}>{curr}</Text>
            <TextInput 
                style={styles.input} 
                keyboardType="numeric"
                value={val.toString()}
                onChangeText={setVal}
            />
        </View>
    </View>
);

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

  content: { padding: 20 },

  // Total Card
  totalCard: {
    backgroundColor: '#fff', padding: 25, borderRadius: 15, alignItems: 'center',
    marginBottom: 20, elevation: 4, shadowColor: '#1A237E', shadowOpacity: 0.1,
    borderTopWidth: 4, borderTopColor: '#4CAF50'
  },
  totalLabel: { fontSize: 14, color: '#666', marginBottom: 5, fontWeight: '600' },
  totalAmount: { fontSize: 36, fontWeight: 'bold', color: '#1A237E' },
  currencyNote: { fontSize: 12, color: '#999', marginTop: 5, fontStyle: 'italic' },

  // Visual Bar
  barContainer: { flexDirection: 'row', height: 12, borderRadius: 6, overflow: 'hidden', marginBottom: 10, width: '100%' },
  barSegment: { height: '100%' },
  
  legendRow: { flexDirection: 'row', justifyContent: 'center', marginBottom: 20 },
  legendItem: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 8 },
  dot: { width: 8, height: 8, borderRadius: 4, marginRight: 5 },
  legendText: { fontSize: 12, color: '#555' },

  // Tip
  tipBox: { 
      backgroundColor: '#FFF3E0', padding: 12, borderRadius: 10, marginBottom: 20,
      borderLeftWidth: 4, borderLeftColor: '#FF9800'
  },
  tipText: { color: '#E65100', fontSize: 13, lineHeight: 18 },

  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 15 },
  
  inputCard: { backgroundColor: '#fff', padding: 15, borderRadius: 15, elevation: 2 },
  
  inputRow: { marginBottom: 15 },
  label: { fontSize: 14, color: '#333', marginBottom: 5, fontWeight: '600' },
  
  inputWrapper: { 
      flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#DDD', 
      borderRadius: 10, backgroundColor: '#FAFAFA', paddingHorizontal: 10
  },
  currPrefix: { fontSize: 16, color: '#666', fontWeight: 'bold', marginRight: 5 },
  input: { flex: 1, paddingVertical: 12, fontSize: 16, color: '#1A237E', fontWeight: 'bold' }
});