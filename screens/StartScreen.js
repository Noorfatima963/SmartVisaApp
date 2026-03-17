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
        onPress={() => navigation.navigate('SignUp')}
      >
        <Text style={styles.buttonText}>Get Started</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.signinBtn}
        onPress={() => navigation.navigate('SignIn')}
      >
        <Text style={styles.signinText}>Already have an account? Sign In</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F5F8FF' },
  title: { fontSize: 28, fontWeight: '800', color: '#1A237E', marginBottom: 10 },
  subtitle: { fontSize: 16, color: '#666', marginBottom: 30 },
  button: {
    backgroundColor: '#1A237E', paddingVertical: 15, paddingHorizontal: 50,
    borderRadius: 10, marginTop: 20, elevation: 5,
  },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
  signinBtn: { marginTop: 20, padding: 10 },
  signinText: { color: '#1A237E', fontWeight: '600', fontSize: 15 },
});