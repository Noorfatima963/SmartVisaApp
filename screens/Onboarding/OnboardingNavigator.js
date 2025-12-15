import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Step1_Country from './Step1_Country';
import Step2_VisaType from './Step2_VisaType';
import Step3_Education from './Step3_Education';
import Step4_English from './Step4_English';
import Step5_Financial from './Step5_Financial';

const Stack = createNativeStackNavigator();

export default function OnboardingNavigator() {
  return (
    <Stack.Navigator initialRouteName="Step1_Country" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Step1_Country" component={Step1_Country} />
      <Stack.Screen name="Step2_VisaType" component={Step2_VisaType} />
      <Stack.Screen name="Step3_Education" component={Step3_Education} />
      <Stack.Screen name="Step4_English" component={Step4_English} />
      <Stack.Screen name="Step5_Financial" component={Step5_Financial} />
    </Stack.Navigator>
  );
}
