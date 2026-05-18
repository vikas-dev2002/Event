import React, { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Header } from '@/components/layout/Header';
import { EventCard } from '@/components/events/EventCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { LoadingState } from '@/components/ui/LoadingState';
import { Screen } from '@/components/ui/Screen';
import { useOrganizedEvents } from '@/hooks/useEvents';

type OrganizerEventsNavigation = {
  navigate: (screen: string, params?: Record<string, unknown>) => void;
};

export function OrganizedEventsScreen({ navigation }: { navigation: OrganizerEventsNavigation }) {
  const [view, setView] = useState<'active' | 'archived' | 'all'>('active');
  const eventsQuery = useOrganizedEvents(view);

  return (
    <Screen refreshing={eventsQuery.isRefetching} onRefresh={() => eventsQuery.refetch()}>
      <Header title="My Events" subtitle="Manage the same organization-scoped events and attendance flows from mobile." />

      <View className="flex-row gap-2">
        {(['active', 'archived', 'all'] as const).map(item => (
          <Pressable key={item} className="flex-1" onPress={() => setView(item)}>
            <View className={`rounded-2xl border p-3 ${view === item ? 'border-neutral-900 bg-neutral-50' : 'border-neutral-200'}`}>
              <Text className="text-center text-sm font-semibold capitalize text-neutral-900">{item}</Text>
            </View>
          </Pressable>
        ))}
      </View>

      {eventsQuery.isLoading ? <LoadingState label="Loading organized events..." /> : null}
      {eventsQuery.isError ? <ErrorState description="Unable to load organized events." onRetry={() => eventsQuery.refetch()} /> : null}

      {!eventsQuery.isLoading && !eventsQuery.isError ? (
        eventsQuery.data?.events.length ? (
          eventsQuery.data.events.map(event => (
            <EventCard key={event.id} event={event} onPress={() => navigation.navigate('OrganizerEventDetail', { id: event.id })} />
          ))
        ) : (
          <EmptyState title="No events in this view" description="Switch filters or create a new event from the web app." />
        )
      ) : null}
    </Screen>
  );
}
