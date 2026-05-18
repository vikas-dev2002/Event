import React, { useState } from 'react';
import { Text, View } from 'react-native';
import { Header } from '@/components/layout/Header';
import { EventCard } from '@/components/events/EventCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { LoadingState } from '@/components/ui/LoadingState';
import { Screen } from '@/components/ui/Screen';
import { useEvents } from '@/hooks/useEvents';

type AdminEventsNavigation = {
  navigate: (screen: string, params?: Record<string, unknown>) => void;
};

export function AdminEventsScreen({ navigation }: { navigation: AdminEventsNavigation }) {
  const [view, setView] = useState<'active' | 'archived' | 'all'>('active');
  const status =
    view === 'active' ? 'PUBLISHED' : view === 'archived' ? 'ARCHIVED' : undefined;
  const eventsQuery = useEvents({ status, limit: 50, sort: 'date-desc' });

  return (
    <Screen refreshing={eventsQuery.isRefetching} onRefresh={() => eventsQuery.refetch()}>
      <Header title="Admin Events" subtitle="Browse and oversee events across the platform." />

      <View className="flex-row gap-2">
        {(['active', 'archived', 'all'] as const).map(item => (
          <View key={item} className="flex-1">
            <Text
              className={`rounded-2xl border px-3 py-3 text-center text-sm font-semibold capitalize ${
                view === item ? 'border-neutral-900 bg-neutral-50 text-neutral-900' : 'border-neutral-200 text-neutral-700'
              }`}
              onPress={() => setView(item)}>
              {item}
            </Text>
          </View>
        ))}
      </View>

      {eventsQuery.isLoading ? <LoadingState label="Loading platform events..." /> : null}
      {eventsQuery.isError ? <ErrorState description="Unable to load events." onRetry={() => eventsQuery.refetch()} /> : null}

      {!eventsQuery.isLoading && !eventsQuery.isError ? (
        eventsQuery.data?.events.length ? (
          eventsQuery.data.events.map(event => (
            <EventCard key={event.id} event={event} onPress={() => navigation.navigate('OrganizerEventDetail', { id: event.id })} />
          ))
        ) : (
          <EmptyState title="No events found" description="Try a different admin view." />
        )
      ) : null}
    </Screen>
  );
}
