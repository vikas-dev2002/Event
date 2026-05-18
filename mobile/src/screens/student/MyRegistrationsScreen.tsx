import React from 'react';
import { Alert, Text, View } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';
import { cancelRegistration } from '@/api/registrations.api';
import { EventStatusBadge } from '@/components/events/EventStatusBadge';
import { Header } from '@/components/layout/Header';
import { StudentQrCode } from '@/components/qr/StudentQrCode';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { LoadingState } from '@/components/ui/LoadingState';
import { Screen } from '@/components/ui/Screen';
import { useRegistrations } from '@/hooks/useRegistrations';
import { formatDateTime } from '@/utils/formatDate';
import { getErrorMessage } from '@/utils/errors';

export function MyRegistrationsScreen() {
  const queryClient = useQueryClient();
  const registrationsQuery = useRegistrations();

  const handleCancel = async (registrationId: string) => {
    try {
      await cancelRegistration(registrationId);
      await queryClient.invalidateQueries({ queryKey: ['registrations'] });
      Alert.alert('Success', 'Registration cancelled successfully.');
    } catch (error) {
      Alert.alert('Cancellation failed', getErrorMessage(error));
    }
  };

  if (registrationsQuery.isLoading) {
    return (
      <Screen>
        <LoadingState label="Loading your registrations..." />
      </Screen>
    );
  }

  if (registrationsQuery.isError) {
    return (
      <Screen>
        <ErrorState description="Unable to load your registrations." onRetry={() => registrationsQuery.refetch()} />
      </Screen>
    );
  }

  const registrations = registrationsQuery.data?.registrations ?? [];

  return (
    <Screen refreshing={registrationsQuery.isRefetching} onRefresh={() => registrationsQuery.refetch()}>
      <Header title="My Registrations" subtitle="Confirmed seats, waitlist positions, and QR check-in codes." />

      {registrations.length ? (
        registrations.map(registration => (
          <View key={registration.id} className="gap-3">
            {registration.status === 'CONFIRMED' ? (
              <StudentQrCode
                eventTitle={registration.event.title}
                qrCode={registration.qrCode}
                attended={Boolean(registration.attendance)}
                attendanceTime={registration.attendance?.checkedInAt}
              />
            ) : null}

            <Card>
              <View className="gap-3">
                <View className="flex-row items-start justify-between">
                  <View className="flex-1">
                    <Text className="text-lg font-semibold text-neutral-900">{registration.event.title}</Text>
                    <Text className="mt-1 text-sm text-neutral-500">
                      {formatDateTime(registration.event.startDate)} • {registration.event.venue}
                    </Text>
                  </View>
                  <EventStatusBadge status={registration.event.status} />
                </View>

                <Text className="text-sm text-neutral-700">
                  Registration status: {registration.status}
                  {registration.waitlistPosition ? ` • Waitlist #${registration.waitlistPosition}` : ''}
                </Text>
                {registration.attendance ? (
                  <Text className="text-sm text-green-700">
                    Checked in at {formatDateTime(registration.attendance.checkedInAt)}
                  </Text>
                ) : null}
                <Button
                  title={registration.status === 'WAITLISTED' ? 'Leave Waitlist' : 'Cancel Registration'}
                  variant="outline"
                  onPress={() => handleCancel(registration.id)}
                />
              </View>
            </Card>
          </View>
        ))
      ) : (
        <EmptyState title="No registrations yet" description="Register for an event to see your tickets and QR codes here." />
      )}
    </Screen>
  );
}
