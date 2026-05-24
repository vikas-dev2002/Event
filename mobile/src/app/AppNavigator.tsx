import React, { useState } from 'react';
import { createNavigationContainerRef, NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Text, View } from 'react-native';
import { AdminTabs } from '@/app/AdminTabs';
import { AuthNavigator } from '@/app/AuthNavigator';
import { OrganizerTabs } from '@/app/OrganizerTabs';
import { StudentTabs } from '@/app/StudentTabs';
import { EevaLauncher } from '@/components/chatbot/EevaLauncher';
import { Screen } from '@/components/ui/Screen';
import { useAuth } from '@/hooks/useAuth';
import { CompleteProfileScreen } from '@/screens/auth/CompleteProfileScreen';
import { SplashScreen } from '@/screens/auth/SplashScreen';
import { AnnouncementDetailScreen } from '@/screens/shared/AnnouncementDetailScreen';
import { AnnouncementsScreen } from '@/screens/shared/AnnouncementsScreen';
import { ChatbotScreen } from '@/screens/shared/ChatbotScreen';
import { CreateAnnouncementScreen } from '@/screens/shared/CreateAnnouncementScreen';
import { EventDetailScreen } from '@/screens/student/EventDetailScreen';
import { NotificationsScreen } from '@/screens/student/NotificationsScreen';
import { OrganizerEventDetailScreen } from '@/screens/organizer/OrganizerEventDetailScreen';
import { EventStudentsScreen } from '@/screens/organizer/EventStudentsScreen';

const RootStack = createNativeStackNavigator();
const navigationRef = createNavigationContainerRef<any>();

function AdminWebOnlyScreen() {
  return (
    <Screen>
      <View className="rounded-3xl border border-neutral-200 bg-white p-6">
        <Text className="text-2xl font-bold text-neutral-900">Admin on Web</Text>
        <Text className="mt-2 text-sm leading-6 text-neutral-500">
          Please use the EventEase web admin panel for college, event, and organizer administration.
        </Text>
      </View>
    </Screen>
  );
}

function VerificationPendingScreen() {
  return (
    <Screen>
      <View className="rounded-3xl border border-amber-200 bg-amber-50 p-6">
        <Text className="text-2xl font-bold text-amber-900">Verification Pending</Text>
        <Text className="mt-2 text-sm leading-6 text-amber-800">
          Your organizer account has been submitted and is waiting for admin approval. Please continue on the web once you are verified.
        </Text>
      </View>
    </Screen>
  );
}

export function AppNavigator() {
  const { hydrated, loading, user } = useAuth();
  const [currentRouteName, setCurrentRouteName] = useState<string>();

  if (!hydrated || loading) {
    return <SplashScreen />;
  }

  return (
    <View className="flex-1 bg-white">
      <NavigationContainer
        ref={navigationRef}
        onReady={() => setCurrentRouteName(navigationRef.getCurrentRoute()?.name as string | undefined)}
        onStateChange={() => setCurrentRouteName(navigationRef.getCurrentRoute()?.name as string | undefined)}>
        <RootStack.Navigator screenOptions={{ headerShown: false }}>
          {!user ? (
            <RootStack.Screen name="Auth" component={AuthNavigator} />
          ) : user.role === 'ADMIN' ? (
            <>
              <RootStack.Screen name="AdminTabs" component={AdminTabs} />
              <RootStack.Screen name="OrganizerEventDetail" component={OrganizerEventDetailScreen} />
              <RootStack.Screen name="EventStudents" component={EventStudentsScreen} />
              <RootStack.Screen name="Announcements" component={AnnouncementsScreen} />
              <RootStack.Screen name="AnnouncementDetail" component={AnnouncementDetailScreen} />
              <RootStack.Screen name="CreateAnnouncement" component={CreateAnnouncementScreen} />
            </>
          ) : !user.profileCompleted ? (
            <RootStack.Screen name="CompleteProfile" component={CompleteProfileScreen} />
          ) : user.role === 'ORGANIZER' && !user.isVerified ? (
            <RootStack.Screen name="VerificationPending" component={VerificationPendingScreen} />
          ) : user.role === 'ORGANIZER' ? (
            <>
              <RootStack.Screen name="OrganizerTabs" component={OrganizerTabs} />
              <RootStack.Screen name="OrganizerEventDetail" component={OrganizerEventDetailScreen} />
              <RootStack.Screen name="EventStudents" component={EventStudentsScreen} />
              <RootStack.Screen name="NotificationsDetail" component={NotificationsScreen} />
              <RootStack.Screen name="Announcements" component={AnnouncementsScreen} />
              <RootStack.Screen name="AnnouncementDetail" component={AnnouncementDetailScreen} />
              <RootStack.Screen name="CreateAnnouncement" component={CreateAnnouncementScreen} />
            </>
          ) : (
            <>
              <RootStack.Screen name="StudentTabs" component={StudentTabs} />
              <RootStack.Screen name="EventDetail" component={EventDetailScreen} />
              <RootStack.Screen name="NotificationsDetail" component={NotificationsScreen} />
              <RootStack.Screen name="Announcements" component={AnnouncementsScreen} />
              <RootStack.Screen name="AnnouncementDetail" component={AnnouncementDetailScreen} />
            </>
          )}

          <RootStack.Screen name="Chatbot" component={ChatbotScreen} />
        </RootStack.Navigator>
      </NavigationContainer>

      {currentRouteName !== 'Chatbot' ? (
        <EevaLauncher
          onPress={() => {
            if (navigationRef.isReady()) {
              navigationRef.navigate('Chatbot');
            }
          }}
        />
      ) : null}
    </View>
  );
}
