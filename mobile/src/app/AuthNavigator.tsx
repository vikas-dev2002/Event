import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { CompleteProfileScreen } from '@/screens/auth/CompleteProfileScreen';
import { LoginScreen } from '@/screens/auth/LoginScreen';
import { RegisterScreen } from '@/screens/auth/RegisterScreen';
import { VerificationPendingScreen } from '@/screens/auth/VerificationPendingScreen';
import { AboutScreen } from '@/screens/public/AboutScreen';
import { ContactScreen } from '@/screens/public/ContactScreen';
import { LandingScreen } from '@/screens/public/LandingScreen';
import { VerifyCertificateScreen } from '@/screens/public/VerifyCertificateScreen';
import { EventsScreen } from '@/screens/student/EventsScreen';
import { EventDetailScreen } from '@/screens/student/EventDetailScreen';

const Stack = createNativeStackNavigator();

export function AuthNavigator() {
  return (
    <Stack.Navigator initialRouteName="Landing" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Landing" component={LandingScreen} />
      <Stack.Screen name="Events" component={EventsScreen} />
      <Stack.Screen name="EventDetail" component={EventDetailScreen} />
      <Stack.Screen name="VerifyCertificate" component={VerifyCertificateScreen} />
      <Stack.Screen name="About" component={AboutScreen} />
      <Stack.Screen name="Contact" component={ContactScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="VerificationPending" component={VerificationPendingScreen} />
      <Stack.Screen name="CompleteProfile" component={CompleteProfileScreen} />
    </Stack.Navigator>
  );
}
