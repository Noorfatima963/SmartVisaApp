import React, { useState } from 'react';
import { View, Text, StyleSheet, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Picker } from '@react-native-picker/picker';

// Custom Components
import PrimaryButton from '../../components/PrimaryButton';
import ProgressDots from '../../components/ProgressDots';

const Step1_Country = ({ navigation }) => {
  const [country, setCountry] = useState('USA');

  // Countries ka data flags ke sath
  const countries = [
    { label: "🇺🇸 United States (USA)", value: "USA" },
    { label: "🇨🇦 Canada", value: "Canada" },
    { label: "🇬🇧 United Kingdom (UK)", value: "UK" },
    { label: "🇦🇺 Australia", value: "Australia" },
    { label: "🇩🇪 Germany", value: "Germany" },
    { label: "🇵🇰 Pakistan", value: "Pakistan" },
    { label: "🇦🇪 UAE", value: "UAE" },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Status Bar ko Dark Content kiya taake icons nazar ayen */}
      <StatusBar barStyle="dark-content" backgroundColor="#F5F8FF" />

      {/* 1. Top Section: Progress Bar */}
      <View style={styles.topSection}>
         <ProgressDots step={1} total={5} />
      </View>

      {/* 2. Content Section */}
      <View style={styles.contentSection}>
        <Text style={styles.mainTitle}>Where do you want to go?</Text>
        <Text style={styles.subTitle}>Select the destination country for your visa application.</Text>
        
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={country}
            onValueChange={(itemValue) => setCountry(itemValue)}
            style={styles.picker}
            dropdownIconColor="#1A237E" // Arrow ka color fix kiya
            mode="dropdown" // Android pe list ki tarah khulega
          >
            {countries.map((item, index) => (
              <Picker.Item 
                key={index} 
                label={item.label} 
                value={item.value} 
                color="#000000" // Text color BLACK fix kiya (White screen issue fix)
                style={{ fontSize: 16 }}
              />
            ))}
          </Picker>
        </View>
        
        {/* Selected Country Display (Optional - Visual Feedback) */}
        <View style={styles.selectionBox}>
          <Text style={styles.selectionText}>Selected: {country}</Text>
        </View>
      </View>

      {/* 3. Bottom Section: Next Button */}
      <View style={styles.bottomSection}>
        <PrimaryButton
          title="Continue to Visa Type"
          onPress={() =>
            navigation.navigate('Step2_VisaType', { selectedCountry: country })
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
    backgroundColor: '#F5F8FF' // Light Background
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
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
    paddingHorizontal: 20
  },
  
  pickerWrapper: {
    borderWidth: 1.5,
    borderColor: '#1A237E', // Border color thoda dark kiya
    borderRadius: 12,
    width: '100%',
    backgroundColor: '#FFFFFF',
    elevation: 3, // Android shadow
    shadowColor: '#000', // iOS shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginBottom: 20,
  },
  
  picker: {
    width: '100%',
    height: 55,
    color: '#000000', // Input text color fix
  },

  selectionBox: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#E8EAF6',
    borderRadius: 8,
  },
  
  selectionText: {
    color: '#1A237E',
    fontWeight: '600'
  },

  bottomSection: {
    width: '100%',
    marginBottom: 20
  }
});

export default Step1_Country;