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

const Step3_Education = ({ route, navigation }) => {
  // Piche se aya hua Data (Step 1 & 2)
  const { selectedCountry = 'Pakistan', visaType = 'Student' } = route.params || {};
  
  const [degree, setDegree] = useState('');
  const [cgpa, setCgpa] = useState('');

  // --- SMART LOGIC ---
  const handleNext = () => {
    // 1. Validation (Khali fields rokna)
    if (!degree.trim()) {
      Alert.alert("Missing Degree", "Please enter your highest qualification (e.g. High School or Bachelor's).");
      return;
    }
    if (!cgpa.trim()) {
      Alert.alert("Missing CGPA", "Please enter your CGPA or Percentage.");
      return;
    }

    // 2. Number Conversion & Safety Check
    const cgpaValue = parseFloat(cgpa);
    if (isNaN(cgpaValue) || cgpaValue > 100 || cgpaValue < 0) {
      Alert.alert("Invalid Score", "Please enter a valid CGPA (0.0 - 4.0) or Percentage (0 - 100).");
      return;
    }

    // 3. Data Object Creation (For AI Calculation later)
    const educationData = {
      degree: degree.trim(),
      cgpa: cgpaValue
    };

    // 4. Navigation to Step 4
    navigation.navigate('Step4_English', {
      selectedCountry,
      visaType,
      educationData, // Ab ye Object form mein ja raha hai
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      
      {/* 1. Top Section: Progress Bar */}
      <View style={styles.topSection}>
         <ProgressDots step={3} total={5} />
      </View>

      {/* Keyboard Handling: Inputs upar ajayenge jab keyboard khulega */}
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"} 
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          <Text style={styles.stepBadge}>Step 3 of 5</Text>
          <Text style={styles.mainTitle}>Academic Profile</Text>
          <Text style={styles.subTitle}>
            Enter your most recent educational details for <Text style={{fontWeight:'bold', color:'#1A237E'}}>{selectedCountry}</Text>.
          </Text>

          {/* Degree Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Highest Qualification</Text>
            <TextInput 
              placeholder="e.g. BS Computer Science / A-Levels" 
              style={styles.input} 
              value={degree} 
              onChangeText={setDegree} 
              placeholderTextColor="#999" 
            />
          </View>
          
          {/* CGPA Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>CGPA or Percentage</Text>
            <TextInput 
              placeholder="e.g. 3.5 or 85%" 
              keyboardType="decimal-pad" 
              style={styles.input} 
              value={cgpa} 
              onChangeText={setCgpa} 
              placeholderTextColor="#999" 
            />
            <Text style={styles.hint}>* Use 0.0 - 4.0 for CGPA or 0-100 for Percentage.</Text>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>

      {/* 3. Bottom Section: Next Button */}
      <View style={styles.bottomSection}>
        <PrimaryButton
          title="Continue to English Test"
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
    marginTop: 20, // Thoda gap
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
    borderWidth: 1.5, // Thoda mota border
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
    paddingBottom: 30 // Safe area for bottom swipe
  }
});

export default Step3_Education;