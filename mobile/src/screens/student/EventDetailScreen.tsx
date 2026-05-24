import React from 'react';
import { Image, Linking, Text, View } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';
import { Header } from '@/components/layout/Header';
import { EventRegisterButton } from '@/components/events/EventRegisterButton';
import { EventStatusBadge } from '@/components/events/EventStatusBadge';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { LoadingState } from '@/components/ui/LoadingState';
import { OrgIdentity } from '@/components/ui/OrgIdentity';
import { Screen } from '@/components/ui/Screen';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { useEvent } from '@/hooks/useEvents';
import { formatDate, formatTime } from '@/utils/formatDate';

type EventDetailRoute = {
  params?: {
    id?: string;
  };
};

type EventDetailNavigation = {
  navigate: (screen: string, params?: Record<string, unknown>) => void;
};

function parseDocuments(customFields: unknown) {
  try {
    if (typeof customFields === 'string') {
      return (JSON.parse(customFields).documents ?? []) as Array<{ url: string; name: string }>;
    }
    if (customFields && typeof customFields === 'object' && 'documents' in customFields) {
      return ((customFields as { documents?: Array<{ url: string; name: string }> }).documents ?? []);
    }
  } catch {
    return [];
  }

  return [];
}

export function EventDetailScreen({
  route,
  navigation,
}: {
  route: EventDetailRoute;
  navigation: EventDetailNavigation;
}) {
  const eventId = route.params?.id as string;
  const queryClient = useQueryClient();
  const eventQuery = useEvent(eventId);
  const { user } = useAuth();

  if (eventQuery.isLoading) {
    return (
      <Screen>
        <LoadingState label="Loading event details..." />
      </Screen>
    );
  }

  if (eventQuery.isError || !eventQuery.data) {
    return (
      <Screen>
        <ErrorState description="Unable to load this event." onRetry={() => eventQuery.refetch()} />
      </Screen>
    );
  }

  const event = eventQuery.data;
  const userRegistration = event.registrations?.[0];
  const documents = parseDocuments(event.customFields);
  const isFull = event._count.registrations >= event.capacity;

  return (
    <Screen>
      <Header title={event.title} subtitle={`${formatDate(event.startDate)} • ${formatTime(event.startDate)}`} />

      {event.posterUrl ? (
        <Image source={{ uri: event.posterUrl }} className="h-60 w-full rounded-3xl bg-neutral-100" resizeMode="cover" />
      ) : null}

      <Card>
        <View className="gap-4">
          <View className="flex-row flex-wrap gap-2">
            <Badge label={event.category} tone="secondary" />
            <EventStatusBadge status={event.status} />
          </View>

          {event.org ? <OrgIdentity name={event.org.name} logoUrl={event.org.logo} subtitle="Hosting organization" size="sm" /> : null}

          <Text className="text-base leading-7 text-neutral-700">{event.description}</Text>

          <View className="gap-2">
            <Text className="text-sm text-neutral-700">Venue: {event.venue}</Text>
            <Text className="text-sm text-neutral-700">
              Capacity: {event._count.registrations}/{event.capacity}
            </Text>
            <Text className="text-sm text-neutral-700">Organizer: {event.organizer.name}</Text>
          </View>

          {userRegistration ? (
            <Badge label={userRegistration.status === 'WAITLISTED' ? 'You are on the waitlist' : 'You are registered'} tone={userRegistration.status === 'WAITLISTED' ? 'warning' : 'success'} />
          ) : !user ? (
            <View className="gap-3">
              <Text className="text-sm leading-6 text-neutral-500">
                Sign in to register for this event, join a waitlist, and access your attendance QR code.
              </Text>
              <Button title="Log In to Register" onPress={() => navigation.navigate('Login')} />
              <Button title="Create Account" variant="outline" onPress={() => navigation.navigate('Register')} />
            </View>
          ) : (
            <EventRegisterButton
              eventId={event.id}
              isFull={isFull}
              waitlistEnabled={event.waitlistEnabled}
              onSuccess={() => {
                queryClient.invalidateQueries({ queryKey: ['event', event.id] });
                queryClient.invalidateQueries({ queryKey: ['registrations'] });
              }}
            />
          )}
        </View>
      </Card>

      <Card>
        <Text className="text-lg font-semibold text-neutral-900">Documents</Text>
        <View className="mt-4 gap-3">
          {documents.length ? (
            documents.map(document => (
              <Text
                key={document.url}
                className="text-sm font-medium text-blue-700"
                onPress={() => Linking.openURL(document.url)}>
                {document.name}
              </Text>
            ))
          ) : (
            <EmptyState title="No documents attached" description="This event does not have extra downloads yet." />
          )}
        </View>
      </Card>
    </Screen>
  );
}
