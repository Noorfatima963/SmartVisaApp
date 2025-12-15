// navigation/AppNavigator.js
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';

// --- Screens Imports ---

// 1. Launch & Auth
import SplashScreen from '../screens/SplashScreen';
import StartScreen from '../screens/StartScreen'; 
import SignIn from '../screens/Auth/SignIn';

// 2. Onboarding Flow
import Step1_Country from '../screens/Onboarding/Step1_Country';
import Step2_VisaType from '../screens/Onboarding/Step2_VisaType';
import Step3_Education from '../screens/Onboarding/Step3_Education';
import Step4_English from '../screens/Onboarding/Step4_English';
import Step5_Financial from '../screens/Onboarding/Step5_Financial';

// 3. Main App Hub
import Dashboard from '../screens/Dashboard'; 
import ProfileScreen from '../screens/ProfileScreen'; 

// 4. Feature Tools
import EligibilityScreen from '../screens/EligibilityScreen';
import DocumentCheckerScreen from '../screens/DocumentCheckerScreen';
import UniversityCompareScreen from '../screens/UniversityCompareScreen';
import VisaTimelineScreen from '../screens/VisaTimelineScreen';
import SuccessProbabilityScreen from '../screens/SuccessProbabilityScreen';
import CostEstimatorScreen from '../screens/CostEstimatorScreen';
import ChatbotScreen from '../screens/ChatbotScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName="Splash" 
        screenOptions={{ 
          headerShown: false, 
          animation: 'slide_from_right' 
        }}
      >

        {/* --- 1. STARTUP FLOW --- */}
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Start" component={StartScreen} />
        <Stack.Screen name="SignIn" component={SignIn} />

        {/* --- 2. ONBOARDING LOOP --- */}
        <Stack.Screen name="Step1_Country" component={Step1_Country} />
        <Stack.Screen name="Step2_VisaType" component={Step2_VisaType} />
        <Stack.Screen name="Step3_Education" component={Step3_Education} />
        <Stack.Screen name="Step4_English" component={Step4_English} />
        <Stack.Screen name="Step5_Financial" component={Step5_Financial} />

        {/* --- 3. MAIN DASHBOARD --- */}
        <Stack.Screen name="Dashboard" component={Dashboard} />
        <Stack.Screen name="Profile" component={ProfileScreen} />

        {/* --- 4. TOOLS & FEATURES --- */}
        <Stack.Screen name="SuccessProbability" component={SuccessProbabilityScreen} />
        <Stack.Screen name="DocumentChecker" component={DocumentCheckerScreen} />
        <Stack.Screen name="Eligibility" component={EligibilityScreen} />
        <Stack.Screen name="UniversityCompare" component={UniversityCompareScreen} />
        <Stack.Screen name="VisaTimeline" component={VisaTimelineScreen} />
        <Stack.Screen name="CostEstimator" component={CostEstimatorScreen} />
        <Stack.Screen name="Chatbot" component={ChatbotScreen} />

      </Stack.Navigator>
    </NavigationContainer>
  );
}