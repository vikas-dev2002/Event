import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Building2, CalendarDays, Home, ShieldCheck, User } from 'lucide-react-native';
import { AdminHomeScreen } from '@/screens/admin/AdminHomeScreen';
import { AdminEventsScreen } from '@/screens/admin/AdminEventsScreen';
import { AdminOrganizationsScreen } from '@/screens/admin/AdminOrganizationsScreen';
import { AdminOrganizerRequestsScreen } from '@/screens/admin/AdminOrganizerRequestsScreen';
import { ProfileScreen } from '@/screens/student/ProfileScreen';

const Tab = createBottomTabNavigator();

const iconMap = {
  Overview: Home,
  Events: CalendarDays,
  Colleges: Building2,
  Requests: ShieldCheck,
  Profile: User,
};

export function AdminTabs() {
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
      <Tab.Screen name="Overview" component={AdminHomeScreen} />
      <Tab.Screen name="Events" component={AdminEventsScreen} />
      <Tab.Screen name="Colleges" component={AdminOrganizationsScreen} />
      <Tab.Screen name="Requests" component={AdminOrganizerRequestsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
