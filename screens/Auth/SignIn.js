import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView } from 'react-native';

// 1. 'route' prop receive karna zaroori hai data ke liye
export default function SignIn({ route, navigation }) {
  // 2. Step 5 se aya hua data extract karna
  const { finalUserData } = route.params || {};

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Welcome Back!</Text>
      <Text style={styles.subtitle}>Sign in to your SmartVisa account.</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        placeholderTextColor="#777"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        placeholderTextColor="#777"
      />
      
      {/* Forgot Password Link */}
      <TouchableOpacity style={styles.forgot}>
        <Text style={styles.forgotText}>Forgot Password?</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, { opacity: email && password ? 1 : 0.6 }]}
        disabled={!email || !password}
        onPress={() => {
            // Login ke baad Dashboard par jana (Data sath lekar)
            navigation.reset({
                index: 0,
                routes: [{ name: 'Dashboard', params: finalUserData }], 
            });
        }} 
      >
        <Text style={styles.buttonText}>Sign In</Text>
      </TouchableOpacity>

      <Text style={styles.orText}>OR</Text>

      <View style={styles.socialButtons}>
        <TouchableOpacity style={styles.socialButton}><Text style={styles.socialText}>Google</Text></TouchableOpacity>
        <TouchableOpacity style={styles.socialButton}><Text style={styles.socialText}>Apple</Text></TouchableOpacity>
        <TouchableOpacity style={styles.socialButton}><Text style={styles.socialText}>Facebook</Text></TouchableOpacity>
      </View>

      {/* --- 3. Added Footer Section Here --- */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>Don't have an account? </Text>
        
        <TouchableOpacity onPress={() => {
            // SignUp par bhej rahe hain data ke sath
            navigation.navigate('SignUp', { finalUserData });
        }}>
          <Text style={styles.signupText}>Sign Up</Text>
        </TouchableOpacity>
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 25, justifyContent: 'center', backgroundColor: '#F5F8FF' },
  title: { fontSize: 32, fontWeight: '800', color: '#1A237E', marginBottom: 5, textAlign: 'center' },
  subtitle: { fontSize: 16, color: '#555', marginBottom: 40, textAlign: 'center' },
  input: { 
    width: '100%', 
    borderWidth: 1, 
    borderColor: '#ccc', 
    borderRadius: 10, 
    padding: 15, 
    marginVertical: 8,
    backgroundColor: '#fff',
    fontSize: 16,
  },
  forgot: {
    alignSelf: 'flex-end',
    marginBottom: 20,
  },
  forgotText: {
    color: '#0b3d91',
    fontWeight: '600',
  },
  button: { 
    backgroundColor: '#0b3d91', // Primary Button Color
    paddingVertical: 14, 
    borderRadius: 10, 
    marginTop: 10,
    width: '100%',
    alignItems: 'center',
    elevation: 4,
  },
  buttonText: { 
    color: '#fff', 
    fontWeight: 'bold', 
    fontSize: 17 
  },
  orText: { 
    marginVertical: 25, 
    fontWeight: 'bold', 
    color: '#666', 
    textAlign: 'center' 
  },
  socialButtons: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    width: '100%' 
  },
  socialButton: { 
    backgroundColor: '#fff', 
    padding: 12, 
    borderRadius: 10, 
    minWidth: '30%', 
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  socialText: { 
    color: '#1A237E', 
    fontWeight: '600' 
  },

  // --- New Styles for Footer ---
  footer: { 
    flexDirection: 'row', 
    justifyContent: 'center', 
    marginTop: 30,
    marginBottom: 20 
  },
  footerText: { 
    color: '#666',
    fontSize: 15
  },
  signupText: { 
    color: '#FFD700', // Gold color for standout (ya #1A237E use karein theme match ke liye)
    fontWeight: 'bold',
    fontSize: 15,
    marginLeft: 5
  }
});