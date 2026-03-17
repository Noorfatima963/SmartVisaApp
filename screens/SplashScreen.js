import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { getAppState, setProfileComplete } from '../services/storage';
import api from '../services/api';

const STEP_SCREENS = {
  1: 'Step1_PersonalInfo',
  2: 'Step2_Country',
  3: 'Step3_Education',
  4: 'Step4_Language',
  5: 'Step5_Financial',
};

export default function SplashScreen({ navigation }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.7)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, friction: 4, useNativeDriver: true }),
    ]).start();

    const timer = setTimeout(async () => {
      const appState = await getAppState();
      switch (appState.route) {
        case 'dashboard':
          navigation.replace('Dashboard');
          break;
        case 'onboarding':
          try {
            const profile = await api.profile.get();
            if (profile && (profile.nationality || profile.residence_country || (profile.education_history && profile.education_history.length > 0))) {
              await setProfileComplete(true);
              navigation.replace('Dashboard');
              return;
            }
          } catch (e) {
            console.log('Splash screen profile check error:', e.message);
          }
          navigation.replace(STEP_SCREENS[appState.step] || 'Step1_PersonalInfo');
          break;
        case 'signin':
          navigation.replace('SignIn');
          break;
        default:
          navigation.replace('Start');
          break;
      }
    }, 2200);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={s.container}>
      <Animated.Text style={[s.logo, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>SV</Animated.Text>
      <Animated.Text style={[s.title, { opacity: fadeAnim }]}>SmartVisa</Animated.Text>
      <Animated.Text style={[s.tagline, { opacity: fadeAnim, transform: [{ translateY: fadeAnim.interpolate({ inputRange: [0, 1], outputRange: [10, 0] }) }] }]}>
        Your AI Study Abroad Assistant
      </Animated.Text>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1A237E', justifyContent: 'center', alignItems: 'center' },
  logo: { color: '#FFD700', fontSize: 70, fontWeight: '800', marginBottom: 5, letterSpacing: 2 },
  title: { color: '#E0E0E0', fontSize: 32, fontWeight: 'bold', marginBottom: 10 },
  tagline: { color: '#90CAF9', fontSize: 14, fontWeight: '500', letterSpacing: 1.5 },
});