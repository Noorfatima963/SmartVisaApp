import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  Alert, 
  KeyboardAvoidingView, 
  Platform,
  StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Picker } from '@react-native-picker/picker';

// Custom Button
import PrimaryButton from '../components/PrimaryButton';

export default function Eligibility({ navigation, route }) {
  
  // 1. Dashboard se Data Pre-fill karna (Smart Feature)
  const { userData } = route.params || {};
  
  const [country, setCountry] = useState(userData?.selectedCountry || 'USA');
  const [degreeLevel, setDegreeLevel] = useState('Masters'); // New Field
  const [cgpa, setCgpa] = useState(userData?.educationData?.cgpa?.toString() || '');
  const [ielts, setIelts] = useState(userData?.englishData?.ielts?.toString() || '');
  
  const [result, setResult] = useState(null); 
  // Result Object Structure: { status: 'eligible' | 'risky' | 'not_eligible', title: '', msg: '', details: [] }

  // --- SMART LOGIC ENGINE ---
  const checkStatus = () => {
    // 1. Validation
    if(!cgpa || !ielts) {
        Alert.alert("Missing Input", "Please enter your CGPA and IELTS score.");
        return;
    }

    const gpa = parseFloat(cgpa);
    const score = parseFloat(ielts);

    if (gpa < 0 || gpa > 4.0) {
        Alert.alert("Invalid CGPA", "CGPA must be between 0.0 and 4.0");
        return;
    }
    if (score < 0 || score > 9.0) {
        Alert.alert("Invalid IELTS", "IELTS score must be between 0.0 and 9.0");
        return;
    }

    let isEligible = false;
    let isRisky = false;
    let feedback = [];
    let requirementMsg = "";

    // 2. Country Specific Rules (Real Requirements)
    const rules = {
        USA: { 
            Bachelors: { minGpa: 2.5, minIelts: 6.0 }, 
            Masters: { minGpa: 3.0, minIelts: 6.5 } 
        },
        UK: { 
            Bachelors: { minGpa: 2.2, minIelts: 6.0 }, 
            Masters: { minGpa: 2.5, minIelts: 6.5 } 
        },
        Canada: { 
            Bachelors: { minGpa: 2.8, minIelts: 6.0 }, 
            Masters: { minGpa: 3.0, minIelts: 6.5 } // Strict for SDS
        },
        Australia: { 
            Bachelors: { minGpa: 2.5, minIelts: 6.0 }, 
            Masters: { minGpa: 2.8, minIelts: 6.5 } 
        },
        Germany: { 
            Bachelors: { minGpa: 3.0, minIelts: 6.0 }, 
            Masters: { minGpa: 2.8, minIelts: 6.5 } 
        },
    };

    const targetRule = rules[country] ? rules[country][degreeLevel] : { minGpa: 2.5, minIelts: 6.0 };
    
    // 3. Evaluation
    const gpaPass = gpa >= targetRule.minGpa;
    const ieltsPass = score >= targetRule.minIelts;

    // Build Feedback
    if (gpaPass) {
        feedback.push(`✅ Academic: Your CGPA (${gpa}) meets the requirement (${targetRule.minGpa}+).`);
    } else {
        feedback.push(`❌ Academic: Low CGPA. Requirement is ${targetRule.minGpa}.`);
    }

    if (ieltsPass) {
        feedback.push(`✅ Language: IELTS Score (${score}) is sufficient.`);
    } else {
        feedback.push(`❌ Language: Low IELTS. You need at least ${targetRule.minIelts}.`);
    }

    // Final Verdict
    if (gpaPass && ieltsPass) {
        isEligible = true;
        requirementMsg = "You have a high chance of acceptance!";
    } else if (gpaPass || ieltsPass) {
        isRisky = true;
        requirementMsg = "You meet some requirements, but not all. Consider Foundation courses.";
    } else {
        requirementMsg = "It will be difficult to get admission directly.";
    }

    setResult({
        status: isEligible ? 'eligible' : isRisky ? 'risky' : 'not_eligible',
        title: isEligible ? "🎉 Eligible" : isRisky ? "⚠️ Conditional" : "❌ Not Eligible",
        msg: requirementMsg,
        details: feedback
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#1A237E" barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Eligibility AI 🤖</Text>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{flex:1}}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

            <Text style={styles.subText}>
                Check admission chances for <Text style={{fontWeight:'bold', color:'#1A237E'}}>{degreeLevel}</Text> in <Text style={{fontWeight:'bold', color:'#1A237E'}}>{country}</Text>.
            </Text>

            {/* --- INPUT FORM --- */}
            <View style={styles.card}>
                
                {/* Country Picker */}
                <Text style={styles.label}>Destination Country</Text>
                <View style={styles.pickerBox}>
                    <Picker
                        selectedValue={country}
                        onValueChange={(val) => setCountry(val)}
                        dropdownIconColor="#1A237E"
                    >
                        <Picker.Item label="🇺🇸 USA" value="USA" />
                        <Picker.Item label="🇬🇧 UK" value="UK" />
                        <Picker.Item label="🇨🇦 Canada" value="Canada" />
                        <Picker.Item label="🇦🇺 Australia" value="Australia" />
                        <Picker.Item label="🇩🇪 Germany" value="Germany" />
                    </Picker>
                </View>

                {/* Degree Level Picker */}
                <Text style={styles.label}>Applying For</Text>
                <View style={styles.pickerBox}>
                    <Picker
                        selectedValue={degreeLevel}
                        onValueChange={(val) => setDegreeLevel(val)}
                        dropdownIconColor="#1A237E"
                    >
                        <Picker.Item label="🎓 Masters / Post-Grad" value="Masters" />
                        <Picker.Item label="📚 Bachelors / Under-Grad" value="Bachelors" />
                    </Picker>
                </View>

                <View style={styles.rowInputs}>
                    <View style={{flex:1, marginRight:10}}>
                        <Text style={styles.label}>CGPA (4.0)</Text>
                        <TextInput 
                            style={styles.input} 
                            keyboardType="decimal-pad" 
                            placeholder="3.2" 
                            value={cgpa}
                            onChangeText={setCgpa}
                            maxLength={4}
                        />
                    </View>
                    <View style={{flex:1}}>
                        <Text style={styles.label}>IELTS Score</Text>
                        <TextInput 
                            style={styles.input} 
                            keyboardType="decimal-pad" 
                            placeholder="6.5" 
                            value={ielts}
                            onChangeText={setIelts}
                            maxLength={3}
                        />
                    </View>
                </View>

                <View style={{marginTop: 25}}>
                    <PrimaryButton title="Check Eligibility" onPress={checkStatus} />
                </View>
            </View>

            {/* --- RESULT SECTION --- */}
            {result && (
                <View style={[
                    styles.resultCard, 
                    result.status === 'eligible' ? styles.successCard : 
                    result.status === 'risky' ? styles.riskyCard : styles.failCard
                ]}>
                    <Text style={[
                        styles.resultTitle,
                        result.status === 'eligible' ? {color:'#2E7D32'} : 
                        result.status === 'risky' ? {color:'#E65100'} : {color:'#C62828'}
                    ]}>
                        {result.title}
                    </Text>
                    
                    <Text style={styles.resultMsg}>{result.msg}</Text>
                    
                    <View style={styles.divider} />
                    
                    {/* Detailed Points */}
                    {result.details.map((detail, index) => (
                        <Text key={index} style={styles.detailText}>{detail}</Text>
                    ))}
                </View>
            )}

        </ScrollView>
      </KeyboardAvoidingView>
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
  subText: { textAlign: 'center', color: '#666', marginBottom: 20, fontSize: 15 },

  // Form Card
  card: { backgroundColor: '#fff', padding: 20, borderRadius: 15, elevation: 3, marginBottom: 20 },
  
  label: { fontSize: 13, fontWeight: 'bold', color: '#1A237E', marginTop: 12, marginBottom: 5 },
  
  pickerBox: { 
    borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 10, 
    backgroundColor: '#FAFAFA', height: 50, justifyContent: 'center' 
  },
  
  rowInputs: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 5 },
  
  input: { 
    borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 10, 
    padding: 12, backgroundColor: '#FAFAFA', fontSize: 16, textAlign: 'center', color: '#333'
  },

  // Result Cards
  resultCard: { padding: 20, borderRadius: 15, alignItems: 'center', elevation: 4 },
  successCard: { backgroundColor: '#E8F5E9', borderLeftWidth: 5, borderLeftColor: '#4CAF50' },
  riskyCard: { backgroundColor: '#FFF3E0', borderLeftWidth: 5, borderLeftColor: '#FF9800' },
  failCard: { backgroundColor: '#FFEBEE', borderLeftWidth: 5, borderLeftColor: '#F44336' },

  resultTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 5 },
  resultMsg: { textAlign: 'center', color: '#555', fontSize: 15, marginBottom: 15 },
  
  divider: { width: '100%', height: 1, backgroundColor: 'rgba(0,0,0,0.1)', marginBottom: 15 },
  
  detailText: { 
    fontSize: 14, color: '#444', marginBottom: 8, width: '100%', 
    backgroundColor: 'rgba(255,255,255,0.5)', padding: 8, borderRadius: 8 
  }
});