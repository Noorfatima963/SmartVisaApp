// File: screens/Auth/SignUp.js
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, StatusBar, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Aapka Custom Button
import PrimaryButton from '../../components/PrimaryButton';

export default function SignUp({ route, navigation }) {
  // Piche se aya hua Data (Step 5 -> SignIn -> SignUp)
  const { finalUserData } = route.params || {};

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignUp = () => {
    if(!name || !email || !password) {
        Alert.alert("Error", "Please fill all fields");
        return;
    }

    // Yahan Backend Registration Code ayega (Firebase/API)
    console.log("Creating Account for:", name);

    // Account banne ke baad Dashboard par le jayen (Data ke sath)
    navigation.reset({
      index: 0,
      routes: [{ name: 'Dashboard', params: finalUserData }], 
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F5F8FF" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Create Account 🚀</Text>
          <Text style={styles.subtitle}>Join us to start your study abroad journey</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          
          {/* Name Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput 
              placeholder="e.g. Ali Khan" 
              style={styles.input} 
              value={name}
              onChangeText={setName}
            />
          </View>

          {/* Email Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email Address</Text>
            <TextInput 
              placeholder="hello@example.com" 
              style={styles.input} 
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          {/* Password Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Password</Text>
            <TextInput 
              placeholder="********" 
              style={styles.input} 
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          {/* Sign Up Button */}
          <View style={{ marginTop: 20 }}>
            <PrimaryButton 
                title="Sign Up" 
                onPress={handleSignUp} 
            />
          </View>

          {/* Footer Link (Back to Login) */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('SignIn', { finalUserData })}>
              <Text style={styles.linkText}>Log In</Text>
            </TouchableOpacity>
          </View>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F8FF' },
  scrollContent: { padding: 25, justifyContent: 'center', minHeight: '100%' },
  
  header: { marginBottom: 30 },
  title: { fontSize: 30, fontWeight: 'bold', color: '#1A237E' },
  subtitle: { fontSize: 16, color: '#666', marginTop: 8 },
  
  form: { width: '100%' },
  inputContainer: { marginBottom: 20 },
  label: { color: '#1A237E', fontWeight: '600', marginBottom: 8 },
  input: { 
    backgroundColor: '#fff', 
    borderWidth: 1, 
    borderColor: '#E0E0E0', 
    borderRadius: 12, 
    padding: 15, 
    fontSize: 16 
  },

  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 30 },
  footerText: { color: '#666' },
  linkText: { color: '#FFD700', fontWeight: 'bold' } // Gold Color
});