import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  StyleSheet, 
  Alert, 
  KeyboardAvoidingView, 
  Platform, 
  ScrollView 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Custom Components
import PrimaryButton from '../../components/PrimaryButton';
import ProgressDots from '../../components/ProgressDots';

const Step4_English = ({ route, navigation }) => {
  // Piche se aya hua Sara Data (Step 1, 2, 3)
  const { selectedCountry, visaType, educationData } = route.params || {};
  
  const [ielts, setIelts] = useState('');
  const [toefl, setToefl] = useState('');

  // --- SMART LOGIC ---
  const handleNext = () => {
    // 1. Validation Logic
    
    // Check 1: IELTS Empty Check (Mandatory)
    if (!ielts.trim()) {
      Alert.alert("IELTS Required", "Please enter your IELTS Band Score. If you don't have one, enter 0 or projected score.");
      return;
    }

    // Check 2: IELTS Range (0 - 9.0)
    const ieltsScore = parseFloat(ielts);
    if (isNaN(ieltsScore) || ieltsScore < 0 || ieltsScore > 9.0) {
      Alert.alert("Invalid IELTS", "IELTS Band Score must be between 0 and 9.0");
      return;
    }

    // Check 3: TOEFL Range (0 - 120) - Only if entered
    let toeflScore = 0;
    if (toefl.trim()) {
      toeflScore = parseFloat(toefl);
      if (isNaN(toeflScore) || toeflScore < 0 || toeflScore > 120) {
        Alert.alert("Invalid TOEFL", "TOEFL Score must be between 0 and 120.");
        return;
      }
    }

    // 2. Data Object Creation (Numeric Data for AI)
    const englishData = {
      ielts: ieltsScore,
      toefl: toeflScore // Agar khali tha to 0 jayega
    };

    // 3. Navigation
    navigation.navigate('Step5_Financial', { 
      selectedCountry, 
      visaType, 
      educationData, 
      englishData // Clean Object passed
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      
      {/* 1. Top Section: Progress Bar */}
      <View style={styles.topSection}>
         <ProgressDots step={4} total={5} />
      </View>

      {/* Keyboard Handling */}
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"} 
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

          <Text style={styles.stepBadge}>Step 4 of 5</Text>
          <Text style={styles.mainTitle}>English Proficiency</Text>
          <Text style={styles.subTitle}>
            Language scores are crucial for visa approval in <Text style={{fontWeight:'bold', color:'#1A237E'}}>{selectedCountry}</Text>.
          </Text>

          {/* IELTS Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>IELTS Band Score (Mandatory)</Text>
            <TextInput 
              placeholder="e.g. 6.5" 
              keyboardType="decimal-pad" 
              style={styles.input} 
              value={ielts} 
              onChangeText={setIelts} 
              placeholderTextColor="#999" 
              maxLength={3} // e.g. "6.5" is 3 chars
            />
            <Text style={styles.hint}>* Valid Range: 0 - 9.0</Text>
          </View>
          
          {/* TOEFL Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>TOEFL Score (Optional)</Text>
            <TextInput 
              placeholder="e.g. 90" 
              keyboardType="numeric" 
              style={styles.input} 
              value={toefl} 
              onChangeText={setToefl} 
              placeholderTextColor="#999" 
              maxLength={3} // e.g. "120"
            />
            <Text style={styles.hint}>* Valid Range: 0 - 120 (Leave empty if N/A)</Text>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>

      {/* 3. Bottom Section: Next Button */}
      <View style={styles.bottomSection}>
        <PrimaryButton
          title="Continue to Financials"
          onPress={handleNext}
        />
      </View>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#F5F8FF' 
  },

  topSection: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 10
  },

  keyboardView: {
    flex: 1,
    width: '100%'
  },
  
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 25,
  },

  stepBadge: { 
    fontSize: 12, 
    color: '#1A237E', 
    fontWeight: 'bold',
    backgroundColor: '#E8EAF6',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 10,
    overflow: 'hidden'
  },
  
  mainTitle: { 
    fontSize: 26, 
    fontWeight: 'bold', 
    color: '#1A237E', 
    marginBottom: 10,
    textAlign: 'center'
  },
  
  subText: { // Older style fallback
    fontSize: 16, color: '#666', marginBottom: 40, textAlign: 'center' 
  },
  
  subTitle: { 
    fontSize: 14, 
    color: '#666', 
    marginBottom: 30,
    textAlign: 'center',
    lineHeight: 20
  },

  inputGroup: {
    width: '100%',
    marginBottom: 20
  },

  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A237E',
    marginBottom: 6,
    marginLeft: 5
  },

  input: { 
    width: '100%', 
    borderWidth: 1.5, 
    borderColor: '#E0E0E0', 
    borderRadius: 12, 
    padding: 15, 
    backgroundColor: '#fff',
    fontSize: 16,
    color: '#333'
  },

  hint: {
    fontSize: 12,
    color: '#999',
    marginTop: 5,
    marginLeft: 5,
    fontStyle: 'italic'
  },

  bottomSection: {
    padding: 25,
    width: '100%',
    paddingBottom: 30 
  }
});

export default Step4_English;