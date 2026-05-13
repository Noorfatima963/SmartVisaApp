import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';

import SplashScreen from '../screens/SplashScreen';
import StartScreen from '../screens/StartScreen';
import SignIn from '../screens/Auth/SignIn';
import SignUp from '../screens/Auth/SignUp';
import OTPVerification from '../screens/Auth/OTPVerification';

// Onboarding — 5 focused steps
import Step1_PersonalInfo from '../screens/Onboarding/Step1_PersonalInfo';
import Step2_Country from '../screens/Onboarding/Step2_Country';
import Step3_Education from '../screens/Onboarding/Step3_Education';
import Step4_Language from '../screens/Onboarding/Step4_Language';
import Step5_Financial from '../screens/Onboarding/Step5_Financial';
import Step6_Background from '../screens/Onboarding/Step6_Background';

import Dashboard from '../screens/Dashboard';
import Profile from '../screens/Profile';
import ProfileEditScreen from '../screens/ProfileEditScreen';

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
      <Stack.Navigator initialRouteName="Splash" screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Start" component={StartScreen} />
        <Stack.Screen name="SignIn" component={SignIn} />
        <Stack.Screen name="SignUp" component={SignUp} />
        <Stack.Screen name="OTPVerification" component={OTPVerification} />

        {/* Onboarding */}
        <Stack.Screen name="Step1_PersonalInfo" component={Step1_PersonalInfo} />
        <Stack.Screen name="Step2_Country" component={Step2_Country} />
        <Stack.Screen name="Step3_Education" component={Step3_Education} />
        <Stack.Screen name="Step4_Language" component={Step4_Language} />
        <Stack.Screen name="Step5_Financial" component={Step5_Financial} />
        <Stack.Screen name="Step6_Background" component={Step6_Background} />

        <Stack.Screen name="Dashboard" component={Dashboard} />
        <Stack.Screen name="Profile" component={Profile} />
        <Stack.Screen name="ProfileEdit" component={ProfileEditScreen} />
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