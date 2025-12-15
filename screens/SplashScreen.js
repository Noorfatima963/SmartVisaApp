import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
// 1. Logic ke liye AsyncStorage import kiya
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SplashScreen({ navigation }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.7)).current; 

  useEffect(() => {
    // --- PART 1: Animation (Same as before) ---
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1200, 
        useNativeDriver: true
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4, 
        useNativeDriver: true
      }),
    ]).start();

    // --- PART 2: Smart Logic (Added here) ---
    const checkNavigation = async () => {
      try {
        // Memory check karna
        const value = await AsyncStorage.getItem('onboardingCompleted');

        // 2.5 seconds ka wait (Animation dekhne ke liye)
        setTimeout(() => {
          if (value === 'true') {
            // Agar purana user hai -> Dashboard
            navigation.replace('Dashboard'); 
          } else {
            // Agar naya user hai -> Start Screen
            navigation.replace('Start'); 
          }
        }, 2500);

      } catch (error) {
        console.log('Error checking memory:', error);
        navigation.replace('Start'); // Fallback
      }
    };

    checkNavigation();
  }, []);

  return (
    <View style={styles.container}>
      {/* --- Visuals Same as Before --- */}
      
      {/* Logo */}
      <Animated.Text
        style={[styles.logoText, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}
      >
        S V
      </Animated.Text>
      
      {/* Title */}
      <Animated.Text style={[styles.title, { opacity: fadeAnim }]}>
        SmartVisa
      </Animated.Text>

      {/* Tagline */}
      <Animated.Text style={[styles.tagline, { opacity: fadeAnim, transform: [{ translateY: fadeAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [10, 0] 
          }) }] }]}
      >
        Your AI Study Abroad Assistant
      </Animated.Text>
    </View>
  );
}

// --- Styles Same as Before ---
const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#1A237E', // Deep Navy Blue
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  logoText: { 
    color: '#FFD700', // Gold
    fontSize: 70,
    fontWeight: '800', 
    marginBottom: 5,
    letterSpacing: 2, 
    textShadowColor: 'rgba(0, 0, 0, 0.3)', 
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  title: { 
    color: '#E0E0E0', 
    fontSize: 32, 
    fontWeight: 'bold',
    marginBottom: 10,
  },
  tagline: {
    color: '#90CAF9', 
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: 1.5, 
  }
});