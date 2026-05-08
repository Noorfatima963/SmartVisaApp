// import React from 'react';
// import { StatusBar } from 'react-native';
// import { SafeAreaProvider } from 'react-native-safe-area-context';
// import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
// import { createNativeStackNavigator } from '@react-navigation/native-stack';

// // --- Screens Import ---
// import SplashScreen from './screens/SplashScreen';
// import StartScreen from './screens/StartScreen';
// import SignIn from './screens/Auth/SignIn';
// import SignUp from './screens/Auth/SignUp';
// import Dashboard from './screens/Dashboard';
// import Profile from './screens/Profile';

// // --- Feature Screens ---
// import SuccessProbability from './screens/SuccessProbabilityScreen';
// import Chatbot from './screens/ChatbotScreen';
// import VisaTimeline from './screens/VisaTimelineScreen';
// import CostEstimator from './screens/CostEstimatorScreen';
// import UniversityCompare from './screens/UniversityCompareScreen';
// import DocumentChecker from './screens/DocumentCheckerScreen';
// import Eligibility from './screens/EligibilityScreen';

// // --- Nested Navigator ---
// import OnboardingNavigator from './screens/Onboarding/OnboardingNavigator';

// const Stack = createNativeStackNavigator();

// // --- Theme Design (Navy Blue Vibe) ---
// const MyTheme = {
//   ...DefaultTheme,
//   colors: {
//     ...DefaultTheme.colors,
//     primary: '#1A237E',     // Aapka Main Navy Blue Color
//     background: '#F5F8FF',  // Light Blue-ish White Background
//     text: '#1A237E',        // Default Text Color
//   },
// };

// export default function App() {
//   return (
//     <SafeAreaProvider>
//       <NavigationContainer theme={MyTheme}>

//         <StatusBar 
//           barStyle="dark-content" 
//           backgroundColor="#F5F8FF" 
//           translucent={false} 
//         />

//         <Stack.Navigator 
//           screenOptions={{ 
//             headerShown: false, // Header chupana
//             animation: 'slide_from_right' // Smooth animation
//           }} 
//           initialRouteName="Splash"
//         >

//           {/* 1. Splash & Start */}
//           <Stack.Screen name="Splash" component={SplashScreen} />
//           <Stack.Screen name="Start" component={StartScreen} />

//           {/* 2. Auth Flow */}
//           <Stack.Screen name="SignIn" component={SignIn} />
//           <Stack.Screen name="SignUp" component={SignUp} />

//           {/* 3. Onboarding Flow */}
//           <Stack.Screen name="Onboarding" component={OnboardingNavigator} />

//           {/* 4. Main App Flow */}
//           <Stack.Screen name="Dashboard" component={Dashboard} />
//           <Stack.Screen name="Profile" component={Profile} />

//           {/* 5. Features / Tools */}
//           <Stack.Screen name="SuccessProbability" component={SuccessProbability} />
//           <Stack.Screen name="Chatbot" component={Chatbot} /> 
//           <Stack.Screen name="VisaTimeline" component={VisaTimeline} /> 
//           <Stack.Screen name="CostEstimator" component={CostEstimator} />
//           <Stack.Screen name="UniversityCompare" component={UniversityCompare} />
//           <Stack.Screen name="DocumentChecker" component={DocumentChecker} />
//           <Stack.Screen name="Eligibility" component={Eligibility} />


//         </Stack.Navigator>
//       </NavigationContainer>
//     </SafeAreaProvider>
//   );
// }

/**
 * App.js
 * ───────
 * Root of the app. Wraps everything in AuthProvider so every
 * screen can access user + token via useAuth().
 */

import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './context/AuthContext';
import AppNavigator from './navigation/AppNavigator';

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <AppNavigator />
      </AuthProvider>
    </SafeAreaProvider>
  );
}