import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Bell, Home, ListTodo, ScanLine, User } from 'lucide-react-native';
import { OrganizerHomeScreen } from '@/screens/organizer/OrganizerHomeScreen';
import { OrganizedEventsScreen } from '@/screens/organizer/OrganizedEventsScreen';
import { ScannerScreen } from '@/screens/organizer/ScannerScreen';
import { NotificationsScreen } from '@/screens/student/NotificationsScreen';
import { ProfileScreen } from '@/screens/student/ProfileScreen';

const Tab = createBottomTabNavigator();

const iconMap = {
  Home,
  MyEvents: ListTodo,
  Scanner: ScanLine,
  Notifications: Bell,
  Profile: User,
};

export function OrganizerTabs() {
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
      <Tab.Screen name="Home" component={OrganizerHomeScreen} />
      <Tab.Screen name="MyEvents" component={OrganizedEventsScreen} options={{ title: 'My Events' }} />
      <Tab.Screen name="Scanner" component={ScannerScreen} />
      <Tab.Screen name="Notifications" component={NotificationsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
