import React, { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { Header } from '@/components/layout/Header';
import { EventCard } from '@/components/events/EventCard';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { Input } from '@/components/ui/Input';
import { LoadingState } from '@/components/ui/LoadingState';
import { Screen } from '@/components/ui/Screen';
import { useEvents } from '@/hooks/useEvents';

type EventsNavigation = {
  navigate: (screen: string, params?: Record<string, unknown>) => void;
};

const categories = [
  { label: 'All', value: '' },
  { label: 'Technical', value: 'TECHNICAL' },
  { label: 'Cultural', value: 'CULTURAL' },
  { label: 'Workshop', value: 'WORKSHOP' },
  { label: 'Seminar', value: 'SEMINAR' },
  { label: 'Hackathon', value: 'HACKATHON' },
  { label: 'Sports', value: 'SPORTS' },
  { label: 'Social', value: 'SOCIAL' },
  { label: 'Other', value: 'OTHER' },
] as const;

const sortOptions = [
  { label: 'Soonest', value: 'date-asc' },
  { label: 'Latest', value: 'date-desc' },
  { label: 'Popular', value: 'registrations' },
  { label: 'A-Z', value: 'title' },
] as const;

export function EventsScreen({ navigation }: { navigation: EventsNavigation }) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [sort, setSort] = useState<'date-asc' | 'date-desc' | 'registrations' | 'title'>('date-asc');
  const eventsQuery = useEvents({ status: 'PUBLISHED', q: search, category, sort, limit: 20 });
  const hasFilters = Boolean(search.trim() || category || sort !== 'date-asc');

  return (
    <Screen refreshing={eventsQuery.isRefetching} onRefresh={() => eventsQuery.refetch()}>
      <Header title="Events" subtitle="Discover the same published events from the EventEase web app." />
      <View className="gap-2">
        <Text className="text-sm font-medium text-neutral-700">Search</Text>
        <Input value={search} onChangeText={setSearch} placeholder="Search events, venues, or categories" />
      </View>

      <View className="gap-2">
        <Text className="text-sm font-medium text-neutral-700">Category</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View className="flex-row gap-2 pr-2">
            {categories.map(item => (
              <Pressable key={item.value || 'all'} onPress={() => setCategory(item.value)}>
                <View className={`rounded-full border px-4 py-2 ${category === item.value ? 'border-neutral-900 bg-neutral-900' : 'border-neutral-200 bg-white'}`}>
                  <Text className={`text-sm font-medium ${category === item.value ? 'text-white' : 'text-neutral-700'}`}>
                    {item.label}
                  </Text>
                </View>
              </Pressable>
            ))}
          </View>
        </ScrollView>
      </View>

      <View className="gap-2">
        <Text className="text-sm font-medium text-neutral-700">Sort</Text>
        <View className="flex-row flex-wrap gap-2">
          {sortOptions.map(option => (
            <Pressable key={option.value} onPress={() => setSort(option.value)}>
              <View className={`rounded-full border px-4 py-2 ${sort === option.value ? 'border-neutral-900 bg-neutral-900' : 'border-neutral-200 bg-white'}`}>
                <Text className={`text-sm font-medium ${sort === option.value ? 'text-white' : 'text-neutral-700'}`}>
                  {option.label}
                </Text>
              </View>
            </Pressable>
          ))}
        </View>
      </View>

      {hasFilters ? (
        <Button
          title="Clear Filters"
          variant="ghost"
          onPress={() => {
            setSearch('');
            setCategory('');
            setSort('date-asc');
          }}
        />
      ) : null}

      {eventsQuery.isLoading ? <LoadingState label="Loading events..." /> : null}
      {eventsQuery.isError ? (
        <ErrorState description="Unable to load events." onRetry={() => eventsQuery.refetch()} />
      ) : null}

      {!eventsQuery.isLoading && !eventsQuery.isError ? (
        <View className="gap-4">
          {eventsQuery.data?.events.length ? (
            eventsQuery.data.events.map(event => (
              <EventCard key={event.id} event={event} onPress={() => navigation.navigate('EventDetail', { id: event.id })} />
            ))
          ) : (
            <EmptyState title="No matching events" description="Try a different search or check back later." />
          )}
        </View>
      ) : null}
    </Screen>
  );
}
