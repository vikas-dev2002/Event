import React from 'react';
import { Alert, Text, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { getOrganizerEventStudents, issueCertificatesForEvent } from '@/api/events.api';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { LoadingState } from '@/components/ui/LoadingState';
import { Screen } from '@/components/ui/Screen';
import { formatDateTime } from '@/utils/formatDate';
import { getErrorMessage } from '@/utils/errors';

interface EventStudentRow {
  id: string;
  attendance?: { checkedInAt: string } | null;
  user: { id: string; name: string; email: string };
}

interface WaitlistedStudentRow {
  id: string;
  user: { name: string; email: string };
}

interface EventStudentsResponse {
  event: {
    id: string;
    title: string;
  };
  confirmedRegistrations: EventStudentRow[];
  waitlistedRegistrations: WaitlistedStudentRow[];
}

type EventStudentsRoute = {
  params?: {
    id?: string;
  };
};

export function EventStudentsScreen({ route }: { route: EventStudentsRoute }) {
  const eventId = route.params?.id as string;
  const studentsQuery = useQuery<EventStudentsResponse>({
    queryKey: ['organized-event-students', eventId],
    queryFn: () => getOrganizerEventStudents(eventId),
    enabled: Boolean(eventId),
  });

  const handleIssueCertificates = async () => {
    const studentIds =
      studentsQuery.data?.confirmedRegistrations
        ?.filter(registration => registration.attendance)
        .map(registration => registration.user.id) ?? [];

    try {
      const response = await issueCertificatesForEvent(eventId, studentIds);
      Alert.alert('Certificates issued', response.message ?? 'Certificates sent successfully.');
    } catch (error) {
      Alert.alert('Unable to issue certificates', getErrorMessage(error));
    }
  };

  if (studentsQuery.isLoading) {
    return (
      <Screen>
        <LoadingState label="Loading students..." />
      </Screen>
    );
  }

  if (studentsQuery.isError || !studentsQuery.data) {
    return (
      <Screen>
        <ErrorState description="Unable to load students for this event." onRetry={() => studentsQuery.refetch()} />
      </Screen>
    );
  }

  const { event, confirmedRegistrations, waitlistedRegistrations } = studentsQuery.data;

  return (
    <Screen>
      <Header title="Event Students" subtitle={event.title} />
      <Button title="Issue Certificates to Present Students" variant="outline" onPress={handleIssueCertificates} />

      <Card>
        <Text className="text-lg font-semibold text-neutral-900">Confirmed Students</Text>
        <View className="mt-4 gap-3">
          {confirmedRegistrations.length ? (
            confirmedRegistrations.map(registration => (
              <View key={registration.id} className="rounded-2xl bg-neutral-50 p-3">
                <Text className="font-semibold text-neutral-900">{registration.user.name}</Text>
                <Text className="text-sm text-neutral-500">{registration.user.email}</Text>
                <Text className="text-sm text-neutral-500">
                  {registration.attendance ? `Present • ${formatDateTime(registration.attendance.checkedInAt)}` : 'Absent'}
                </Text>
              </View>
            ))
          ) : (
            <EmptyState title="No confirmed students" description="Confirmed registrations will appear here." />
          )}
        </View>
      </Card>

      <Card>
        <Text className="text-lg font-semibold text-neutral-900">Waitlist</Text>
        <View className="mt-4 gap-3">
          {waitlistedRegistrations.length ? (
            waitlistedRegistrations.map((registration, index: number) => (
              <View key={registration.id} className="rounded-2xl bg-amber-50 p-3">
                <Text className="font-semibold text-neutral-900">#{index + 1} {registration.user.name}</Text>
                <Text className="text-sm text-neutral-500">{registration.user.email}</Text>
              </View>
            ))
          ) : (
            <EmptyState title="No waitlisted students" description="The waitlist is currently empty." />
          )}
        </View>
      </Card>
    </Screen>
  );
}
