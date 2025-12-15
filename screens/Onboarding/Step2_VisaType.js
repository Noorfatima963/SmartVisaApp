import React, { useState } from 'react';
import { View, Text, StyleSheet, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Picker } from '@react-native-picker/picker';

// Custom Components
import PrimaryButton from '../../components/PrimaryButton';
import ProgressDots from '../../components/ProgressDots';

const Step2_VisaType = ({ route, navigation }) => {
  // Piche se aya hua data (Step 1 se)
  const { selectedCountry = 'Pakistan' } = route.params || {};
  
  const [visaType, setVisaType] = useState('Student');

  // Visa Types List (Easily expandable)
  const visaOptions = [
    { label: "🎓 Student Visa", value: "Student" },
    { label: "✈️ Tourist / Visit", value: "Tourist" },
    { label: "💼 Work Permit", value: "Work" },
    { label: "🏥 Medical Visa", value: "Medical" },
    { label: "🤝 Business Visa", value: "Business" },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F5F8FF" />

      {/* 1. Top Section: Progress Bar */}
      <View style={styles.topSection}>
         <ProgressDots step={2} total={5} />
      </View>

      {/* 2. Content Section */}
      <View style={styles.contentSection}>
        <Text style={styles.mainTitle}>Visa Category</Text>
        <Text style={styles.subTitle}>
          Which type of visa are you applying for in <Text style={{fontWeight:'bold', color:'#1A237E'}}>{selectedCountry}</Text>?
        </Text>
        
        {/* Picker / Dropdown */}
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={visaType}
            onValueChange={(itemValue) => setVisaType(itemValue)}
            style={styles.picker}
            dropdownIconColor="#1A237E"
            mode="dropdown"
          >
            {visaOptions.map((item, index) => (
              <Picker.Item 
                key={index} 
                label={item.label} 
                value={item.value} 
                color="#000000" // Fix for Dark Mode (White Text Issue)
                style={{ fontSize: 16 }}
              />
            ))}
          </Picker>
        </View>

        {/* Visual Selection Feedback */}
        <View style={styles.selectionBox}>
          <Text style={styles.selectionText}>Selected: {visaType} Visa</Text>
        </View>
      </View>

      {/* 3. Bottom Section: Next Button */}
      <View style={styles.bottomSection}>
        <PrimaryButton
          title="Continue to Education"
          onPress={() =>
            // Logic: Country (Step 1) + VisaType (Step 2) -> Step 3
            navigation.navigate('Step3_Education', {
              selectedCountry,
              visaType,
            })
          }
        />
      </View>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    padding: 25, 
    backgroundColor: '#F5F8FF' 
  },

  topSection: {
    width: '100%',
    alignItems: 'center',
    marginTop: 10,
  },

  contentSection: {
    width: '100%',
    alignItems: 'center',
    flex: 1,            
    justifyContent: 'center' 
  },

  mainTitle: { 
    fontSize: 26, 
    fontWeight: 'bold', 
    color: '#1A237E', 
    marginBottom: 10, 
    textAlign: 'center' 
  },

  subTitle: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
    paddingHorizontal: 10,
    lineHeight: 22
  },

  pickerWrapper: {
    borderWidth: 1.5,
    borderColor: '#1A237E',
    borderRadius: 12,
    width: '100%',     
    backgroundColor: '#FFFFFF',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginBottom: 20,
  },

  picker: {
    width: '100%',
    height: 55,
    color: '#000000'
  },

  selectionBox: {
    marginTop: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#E8EAF6',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#C5CAE9'
  },
  
  selectionText: {
    color: '#1A237E',
    fontWeight: '600',
    fontSize: 14
  },

  bottomSection: {
    width: '100%',
    marginBottom: 20
  }
});

export default Step2_VisaType;