import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Alert, 
  KeyboardAvoidingView, 
  Platform, 
  ScrollView 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// 1. Storage Import
import AsyncStorage from '@react-native-async-storage/async-storage';

// 2. Custom Components
import PrimaryButton from '../../components/PrimaryButton';
import ProgressDots from '../../components/ProgressDots';

export default function Step5_Financial({ route, navigation }) {
  // Piche se aya hua Sara Data (Step 1 to 4)
  const prevData = route.params || {};

  const [budget, setBudget] = useState('');
  const [sponsor, setSponsor] = useState('');
  const [bankStatement, setBankStatement] = useState(null); // null means nothing selected

  // --- SMART LOGIC ---
  async function handleFinish() {
    // 1. Validation Logic
    if (!budget.trim()) {
      Alert.alert("Budget Missing", "Please enter your estimated budget for 1 year.");
      return;
    }
    
    // Budget Number Validation
    const budgetValue = parseFloat(budget);
    if (isNaN(budgetValue) || budgetValue < 1000) {
      Alert.alert("Invalid Budget", "Please enter a realistic budget amount (e.g. 15000).");
      return;
    }

    if (!sponsor.trim()) {
      Alert.alert("Sponsor Missing", "Please enter who is sponsoring you (e.g. Father, Self).");
      return;
    }

    if (bankStatement === null) {
      Alert.alert("Selection Required", "Please tell us if you have a bank statement.");
      return;
    }

    // 2. Data Consolidation (Sab steps ka data combine)
    const financialData = {
      budget: budgetValue, // Saving as Number for calculations
      sponsor: sponsor.trim(),
      hasStatement: bankStatement === 'yes'
    };

    const finalUserData = {
      ...prevData,        // Step 1, 2, 3, 4 Data
      financialData,      // Step 5 Data
      isProfileComplete: true
    };

    // 3. Save to Permanent Memory (Phone Storage)
    try {
      await AsyncStorage.setItem('userData', JSON.stringify(finalUserData));
      await AsyncStorage.setItem('onboardingCompleted', 'true');
      console.log("Data Saved Successfully!");
    } catch (e) {
      console.log("Error saving data:", e);
      Alert.alert("Error", "Could not save data locally.");
    }

    // 4. Navigate to Login (Data pass kar ke)
    console.log("Navigating to SignIn with Final Data:", finalUserData);
    
    navigation.reset({
      index: 0,
      routes: [{ 
        name: 'SignIn', 
        params: { finalUserData } 
      }], 
    });
  }

  return (
    <SafeAreaView style={styles.container}>
      
      {/* Top Section: Progress Bar */}
      <View style={styles.topSection}>
         <ProgressDots step={5} total={5} />
      </View>

      {/* Keyboard Handling: Inputs upar ajayenge */}
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"} 
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

          <Text style={styles.stepBadge}>Final Step</Text>
          <Text style={styles.mainTitle}>Financial & Sponsor</Text>
          <Text style={styles.subTitle}>
            Visa officers strictly check proof of funds. Be accurate.
          </Text>

          {/* Budget Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Estimated Budget (USD / Year)</Text>
            <TextInput 
              placeholder="e.g. 20000" 
              keyboardType="number-pad" 
              style={styles.input} 
              value={budget} 
              onChangeText={setBudget}
              placeholderTextColor="#999"
            />
            <Text style={styles.hint}>* Include Tuition + Living expenses.</Text>
          </View>

          {/* Sponsor Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Who is your Sponsor?</Text>
            <TextInput 
              placeholder="e.g. Father, Uncle, Self" 
              style={styles.input} 
              value={sponsor} 
              onChangeText={setSponsor}
              placeholderTextColor="#999"
            />
          </View>

          {/* Bank Statement Radio Buttons */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Do you have a Bank Statement?</Text>
            <View style={styles.radioContainer}>
              <TouchableOpacity 
                style={[styles.radioBtn, bankStatement === 'yes' && styles.radioActive]} 
                onPress={() => setBankStatement('yes')}
              >
                <Text style={{fontSize: 20}}>📄</Text>
                <Text style={[styles.radioText, bankStatement === 'yes' && styles.textActive]}>Yes, I have</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.radioBtn, bankStatement === 'no' && styles.radioActive]} 
                onPress={() => setBankStatement('no')}
              >
                 <Text style={{fontSize: 20}}>❌</Text>
                <Text style={[styles.radioText, bankStatement === 'no' && styles.textActive]}>No, not yet</Text>
              </TouchableOpacity>
            </View>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>

      {/* Bottom Section: Finish Button */}
      <View style={styles.bottomSection}>
        <PrimaryButton
          title="Finish & Create Account 🚀"
          onPress={handleFinish}
        />
      </View>

    </SafeAreaView>
  );
}

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
    paddingHorizontal: 25,
    paddingBottom: 20
  },

  stepBadge: { 
    fontSize: 12, 
    color: '#D32F2F', 
    fontWeight: 'bold',
    backgroundColor: '#FFEBEE',
    paddingHorizontal: 12,
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
    marginBottom: 8,
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

  // Radio Button Styles
  radioContainer: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    width: '100%' 
  },
  
  radioBtn: { 
    width: '48%', 
    paddingVertical: 15,
    paddingHorizontal: 10, 
    borderRadius: 12, 
    borderWidth: 1.5, 
    borderColor: '#E0E0E0', 
    alignItems: 'center', 
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8
  },
  
  radioActive: { 
    borderColor: '#1A237E', 
    backgroundColor: '#E8EAF6',
    borderWidth: 2
  },
  
  radioText: { 
    color: '#666', 
    fontWeight: '600',
    fontSize: 14
  },
  
  textActive: { 
    color: '#1A237E', 
    fontWeight: 'bold' 
  },

  bottomSection: {
    padding: 25,
    width: '100%',
    paddingBottom: 30
  }
});