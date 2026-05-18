import React from 'react';
import { Alert, Linking, Text, View } from 'react-native';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  duplicateEvent,
  getEventExportUrl,
  getOrganizerEventStudents,
  issueCertificatesForEvent,
  updateEventStatus,
} from '@/api/events.api';
import { EventStatusBadge } from '@/components/events/EventStatusBadge';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { LoadingState } from '@/components/ui/LoadingState';
import { Screen } from '@/components/ui/Screen';
import { useEvent } from '@/hooks/useEvents';
import type { EventStatus } from '@/types/event';
import { formatDateTime } from '@/utils/formatDate';
import { getErrorMessage } from '@/utils/errors';

interface EventStudentRow {
  id: string;
  attendance?: { checkedInAt: string } | null;
  user: { id: string; name: string; email: string };
}

interface OrganizedEventStudentsResponse {
  event: {
    id: string;
    title: string;
    startDate: string;
    venue: string;
  };
  stats: {
    confirmedCount: number;
    waitlistedCount: number;
    attendedCount: number;
    attendanceRate: number;
  };
  confirmedRegistrations: EventStudentRow[];
}

type OrganizerDetailRoute = {
  params?: {
    id?: string;
  };
};

type OrganizerDetailNavigation = {
  navigate: (screen: string, params?: Record<string, unknown>) => void;
};

const VALID_TRANSITIONS: Record<EventStatus, EventStatus[]> = {
  DRAFT: ['PUBLISHED'],
  PENDING: ['PUBLISHED', 'CANCELLED'],
  PUBLISHED: ['ONGOING', 'CANCELLED'],
  ONGOING: ['COMPLETED', 'CANCELLED'],
  COMPLETED: ['ARCHIVED'],
  CANCELLED: ['DRAFT'],
  ARCHIVED: ['PUBLISHED'],
};

export function OrganizerEventDetailScreen({
  route,
  navigation,
}: {
  route: OrganizerDetailRoute;
  navigation: OrganizerDetailNavigation;
}) {
  const eventId = route.params?.id as string;
  const queryClient = useQueryClient();
  const eventQuery = useQuery<OrganizedEventStudentsResponse>({
    queryKey: ['organized-event-students', eventId],
    queryFn: () => getOrganizerEventStudents(eventId),
    enabled: Boolean(eventId),
  });
  const eventDetailQuery = useEvent(eventId);

  const handleIssueCertificates = async () => {
    const studentIds =
      eventQuery.data?.confirmedRegistrations
        ?.filter(registration => registration.attendance)
        .map(registration => registration.user.id) ?? [];

    if (!studentIds.length) {
      Alert.alert('No eligible students', 'Mark attendance before issuing certificates.');
      return;
    }

    try {
      const response = await issueCertificatesForEvent(eventId, studentIds);
      Alert.alert('Certificates issued', response.message ?? 'Certificates sent successfully.');
    } catch (error) {
      Alert.alert('Issuing failed', getErrorMessage(error));
    }
  };

  const handleStatusChange = async (nextStatus: EventStatus) => {
    try {
      const response = await updateEventStatus(eventId, nextStatus);
      Alert.alert('Status updated', response.message ?? `Event moved to ${nextStatus}.`);
      await queryClient.invalidateQueries({ queryKey: ['event', eventId] });
      await queryClient.invalidateQueries({ queryKey: ['organized-event-students', eventId] });
      await queryClient.invalidateQueries({ queryKey: ['organized-events'] });
    } catch (error) {
      Alert.alert('Update failed', getErrorMessage(error));
    }
  };

  const handleDuplicate = async () => {
    try {
      const response = await duplicateEvent(eventId);
      Alert.alert('Event duplicated', response.message ?? 'A draft copy has been created.');
      await queryClient.invalidateQueries({ queryKey: ['organized-events'] });
      navigation.navigate('OrganizerEventDetail', { id: response.eventId });
    } catch (error) {
      Alert.alert('Duplicate failed', getErrorMessage(error));
    }
  };

  const handleExport = async () => {
    try {
      const url = await getEventExportUrl(eventId);
      await Linking.openURL(url);
    } catch (error) {
      Alert.alert('Export failed', getErrorMessage(error));
    }
  };

  if (eventQuery.isLoading || eventDetailQuery.isLoading) {
    return (
      <Screen>
        <LoadingState label="Loading event analytics..." />
      </Screen>
    );
  }

  if (eventQuery.isError || !eventQuery.data || eventDetailQuery.isError || !eventDetailQuery.data) {
    return (
      <Screen>
        <ErrorState
          description="Unable to load event details."
          onRetry={() => {
            eventQuery.refetch();
            eventDetailQuery.refetch();
          }}
        />
      </Screen>
    );
  }

  const { event, stats, confirmedRegistrations } = eventQuery.data;
  const currentStatus = eventDetailQuery.data.status;
  const transitions = VALID_TRANSITIONS[currentStatus] ?? [];

  return (
    <Screen>
      <Header title={event.title} subtitle={`${formatDateTime(event.startDate)} • ${event.venue}`} />
      <EventStatusBadge status={currentStatus} />

      <View className="flex-row flex-wrap gap-4">
        {[
          { label: 'Confirmed', value: stats.confirmedCount },
          { label: 'Waitlisted', value: stats.waitlistedCount },
          { label: 'Attended', value: stats.attendedCount },
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

      <Button title="View Students" onPress={() => navigation.navigate('EventStudents', { id: event.id })} />
      <Button title="Issue Certificates to Present Students" variant="outline" onPress={handleIssueCertificates} />

      {transitions.length ? (
        <Card>
          <Text className="text-lg font-semibold text-neutral-900">Lifecycle Actions</Text>
          <View className="mt-4 gap-3">
            {transitions.map(status => (
              <Button key={status} title={`Move to ${status}`} variant="outline" onPress={() => handleStatusChange(status)} />
            ))}
          </View>
        </Card>
      ) : null}

      <Card>
        <Text className="text-lg font-semibold text-neutral-900">Organizer Tools</Text>
        <View className="mt-4 gap-3">
          <Button title="Duplicate as Draft" variant="outline" onPress={handleDuplicate} />
          <Button title="Export Registrations CSV" variant="outline" onPress={handleExport} />
        </View>
      </Card>

      <Card>
        <Text className="text-lg font-semibold text-neutral-900">Recent Registrations</Text>
        <View className="mt-4 gap-3">
          {confirmedRegistrations.length ? (
            confirmedRegistrations.slice(0, 5).map(registration => (
              <View key={registration.id} className="rounded-2xl bg-neutral-50 p-3">
                <Text className="font-semibold text-neutral-900">{registration.user.name}</Text>
                <Text className="text-sm text-neutral-500">{registration.user.email}</Text>
                <Text className="text-sm text-neutral-500">
                  {registration.attendance ? 'Present' : 'Absent'}
                </Text>
              </View>
            ))
          ) : (
            <EmptyState title="No confirmed registrations yet" description="Students will show up here as soon as they register." />
          )}
        </View>
      </Card>
    </Screen>
  );
}
