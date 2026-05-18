import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { CalendarDays, Home, QrCode, Ticket, User, Award } from 'lucide-react-native';
import { StudentHomeScreen } from '@/screens/student/StudentHomeScreen';
import { EventsScreen } from '@/screens/student/EventsScreen';
import { MyRegistrationsScreen } from '@/screens/student/MyRegistrationsScreen';
import { CheckInScreen } from '@/screens/student/CheckInScreen';
import { CertificatesScreen } from '@/screens/student/CertificatesScreen';
import { ProfileScreen } from '@/screens/student/ProfileScreen';

const Tab = createBottomTabNavigator();

const iconMap = {
  Home,
  Events: CalendarDays,
  Registrations: Ticket,
  CheckIn: QrCode,
  Certificates: Award,
  Profile: User,
};

export function StudentTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#171717',
        tabBarInactiveTintColor: '#737373',
        tabBarLabelStyle: { fontSize: 12 },
        tabBarStyle: { height: 64, paddingBottom: 8, paddingTop: 8 },
        tabBarIcon: ({ color, size }) => {
          const Icon = iconMap[route.name as keyof typeof iconMap];
          return <Icon color={color} size={size} />;
        },
      })}>
      <Tab.Screen name="Home" component={StudentHomeScreen} />
      <Tab.Screen name="Events" component={EventsScreen} />
      <Tab.Screen name="Registrations" component={MyRegistrationsScreen} options={{ title: 'My Registrations' }} />
      <Tab.Screen name="CheckIn" component={CheckInScreen} options={{ title: 'Check In' }} />
      <Tab.Screen name="Certificates" component={CertificatesScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
