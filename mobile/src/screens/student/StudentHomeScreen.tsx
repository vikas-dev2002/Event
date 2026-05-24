import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Header } from '@/components/layout/Header';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { LoadingState } from '@/components/ui/LoadingState';
import { OrgIdentity } from '@/components/ui/OrgIdentity';
import { Screen } from '@/components/ui/Screen';
import { EventCard } from '@/components/events/EventCard';
import { Card } from '@/components/ui/Card';
import { Text, View } from 'react-native';
import { useAuth } from '@/hooks/useAuth';
import { useEvents } from '@/hooks/useEvents';
import { useRegistrations } from '@/hooks/useRegistrations';
import { getCertificates } from '@/api/certificates.api';

type AppNavigation = {
  navigate: (screen: string, params?: Record<string, unknown>) => void;
};

interface CertificatesResponse {
  certificates?: unknown[];
}

export function StudentHomeScreen({ navigation }: { navigation: AppNavigation }) {
  const { user } = useAuth();
  const eventsQuery = useEvents({ status: 'PUBLISHED', limit: 3 });
  const registrationsQuery = useRegistrations();
  const certificatesQuery = useQuery<CertificatesResponse>({
    queryKey: ['certificates'],
    queryFn: getCertificates,
  });

  if (eventsQuery.isLoading || registrationsQuery.isLoading || certificatesQuery.isLoading) {
    return (
      <Screen>
        <LoadingState label="Loading your dashboard..." />
      </Screen>
    );
  }

  if (eventsQuery.isError || registrationsQuery.isError || certificatesQuery.isError) {
    return (
      <Screen>
        <ErrorState description="Unable to load your dashboard right now." onRetry={() => {
          eventsQuery.refetch();
          registrationsQuery.refetch();
          certificatesQuery.refetch();
        }} />
      </Screen>
    );
  }

  const registrations = registrationsQuery.data?.registrations ?? [];
  const certificates = certificatesQuery.data?.certificates ?? [];

  return (
    <Screen>
      <Header title="Dashboard" subtitle="Your student overview for upcoming events and achievements." />

      <View className="flex-row flex-wrap gap-4">
        {[
          { label: 'Registrations', value: registrations.length },
          {
            label: 'Upcoming',
            value: registrations.filter(item => new Date(item.event.startDate) >= new Date()).length,
          },
          { label: 'Certificates', value: certificates.length },
        ].map(item => (
          <View key={item.label} className="w-[31%]">
            <Card>
              <Text className="text-sm text-neutral-500">{item.label}</Text>
              <Text className="mt-2 text-2xl font-bold text-neutral-900">{item.value}</Text>
            </Card>
          </View>
        ))}
      </View>

      <View className="gap-3">
        <Card>
          <View className="gap-3">
            <Text className="text-lg font-semibold text-neutral-900">Organization Updates</Text>
            {user?.org ? <OrgIdentity name={user.org.name} logoUrl={user.org.logo} size="sm" /> : null}
            <Text className="text-sm text-neutral-500">
              Open announcements for reminders, certificate notices, and event updates from your organization.
            </Text>
            <View>
              <Text
                className="text-sm font-semibold text-neutral-900"
                onPress={() => navigation.navigate('Announcements')}>
                View Announcements
              </Text>
            </View>
          </View>
        </Card>
      </View>

      <View className="gap-3">
        <Text className="text-xl font-semibold text-neutral-900">Recommended Events</Text>
        {eventsQuery.data?.events.length ? (
          eventsQuery.data.events.map(event => (
            <EventCard key={event.id} event={event} onPress={() => navigation.navigate('EventDetail', { id: event.id })} />
          ))
        ) : (
          <EmptyState title="No published events yet" description="Check back soon for new college events." />
        )}
      </View>
    </Screen>
  );
}
