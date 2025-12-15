// screens/StartScreen.js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function StartScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to SmartVisa</Text>
      <Text style={styles.subtitle}>Get started with your study abroad journey.</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() =>
          // Navigation logic for Onboarding is correct.
          navigation.navigate('Onboarding', {
            screen: 'Step1_Country',
            params: { selectedCountry: 'Pakistan' },
          })
        }
      >
        <Text style={styles.buttonText}>Get Started</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: '#F5F8FF' // Light background
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1A237E', // Navy Text
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
  },
  button: {
    backgroundColor: '#0b3d91', // Primary Button Color
    paddingVertical: 15,
    paddingHorizontal: 50,
    borderRadius: 10,
    marginTop: 20,
    elevation: 5,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
});