import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { Header } from '@/components/layout/Header';
import { EventCard } from '@/components/events/EventCard';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { LoadingState } from '@/components/ui/LoadingState';
import { OrgIdentity } from '@/components/ui/OrgIdentity';
import { Screen } from '@/components/ui/Screen';
import { useOrganizedEvents } from '@/hooks/useEvents';
import { Card } from '@/components/ui/Card';
import { useAuth } from '@/hooks/useAuth';

type OrganizerNavigation = {
  navigate: (screen: string, params?: Record<string, unknown>) => void;
};

export function OrganizerHomeScreen({ navigation }: { navigation: OrganizerNavigation }) {
  const { user } = useAuth();
  const organizedEventsQuery = useOrganizedEvents('active');

  if (organizedEventsQuery.isLoading) {
    return (
      <Screen>
        <LoadingState label="Loading organizer dashboard..." />
      </Screen>
    );
  }

  if (organizedEventsQuery.isError || !organizedEventsQuery.data) {
    return (
      <Screen>
        <ErrorState description="Unable to load your organizer dashboard." onRetry={() => organizedEventsQuery.refetch()} />
      </Screen>
    );
  }

  const { stats, events } = organizedEventsQuery.data;

  return (
    <Screen>
      <Header title="Organizer Dashboard" subtitle="Analytics and recent events from your EventEase workspace." />
      <View className="flex-row flex-wrap gap-4">
        {[
          { label: 'Events', value: stats.totalEvents },
          { label: 'Registrations', value: stats.totalRegistrations },
          { label: 'Attended', value: stats.totalAttended },
          { label: 'Attendance', value: `${stats.attendanceRate}%` },
        ].map(item => (
          <View key={item.label} className="w-[47%]">
            <Card>
              <Text className="text-sm text-neutral-500">{item.label}</Text>
              <Text className="mt-2 text-2xl font-bold text-neutral-900">{item.value}</Text>
            </Card>
          </View>
        ))}
      </View>

      <Card>
        <View className="gap-3">
          <Text className="text-lg font-semibold text-neutral-900">Organization Feed</Text>
          {user?.org ? <OrgIdentity name={user.org.name} logoUrl={user.org.logo} size="sm" /> : null}
          <Text className="text-sm text-neutral-500">
            Publish announcements, event reminders, and certificate updates for your organization.
          </Text>
          <View className="flex-row gap-3">
            <View className="flex-1">
              <Button title="Announcements" variant="outline" onPress={() => navigation.navigate('Announcements')} />
            </View>
            <View className="flex-1">
              <Button title="Post Update" onPress={() => navigation.navigate('CreateAnnouncement')} />
            </View>
          </View>
        </View>
      </Card>

      <View className="gap-3">
        <Text className="text-xl font-semibold text-neutral-900">Recent Events</Text>
        {events.length ? (
          events.slice(0, 3).map(event => (
            <EventCard
              key={event.id}
              event={event}
              onPress={() => navigation.navigate('OrganizerEventDetail', { id: event.id })}
            />
          ))
        ) : (
          <EmptyState title="No organized events yet" description="Create your first event on the web or extend the mobile create flow next." />
        )}
      </View>
    </Screen>
  );
}
