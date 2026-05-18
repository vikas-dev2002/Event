import React, { useMemo, useState } from 'react';
import { Alert, Text, View } from 'react-native';
import { selfCheckIn } from '@/api/attendance.api';
import { Header } from '@/components/layout/Header';
import { StudentQrCode } from '@/components/qr/StudentQrCode';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Input } from '@/components/ui/Input';
import { LoadingState } from '@/components/ui/LoadingState';
import { Screen } from '@/components/ui/Screen';
import { useRegistrations } from '@/hooks/useRegistrations';
import { getErrorMessage } from '@/utils/errors';

export function CheckInScreen() {
  const registrationsQuery = useRegistrations();
  const [qrCode, setQrCode] = useState('');
  const [loading, setLoading] = useState(false);

  const activeRegistration = useMemo(
    () => registrationsQuery.data?.registrations.find(item => item.status === 'CONFIRMED'),
    [registrationsQuery.data?.registrations],
  );

  const handleCheckIn = async () => {
    setLoading(true);
    try {
      const result = await selfCheckIn(qrCode);
      Alert.alert('Checked in', result.message ?? 'Attendance marked successfully.');
      registrationsQuery.refetch();
      setQrCode('');
    } catch (error) {
      Alert.alert('Check-in failed', getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  if (registrationsQuery.isLoading) {
    return (
      <Screen>
        <LoadingState label="Loading your QR check-in data..." />
      </Screen>
    );
  }

  return (
    <Screen>
      <Header title="Check In" subtitle="Use your registration QR code for self check-in." />

      {activeRegistration ? (
        <StudentQrCode
          eventTitle={activeRegistration.event.title}
          qrCode={activeRegistration.qrCode}
          attended={Boolean(activeRegistration.attendance)}
          attendanceTime={activeRegistration.attendance?.checkedInAt}
        />
      ) : (
        <EmptyState title="No confirmed registration" description="Register for an event first to generate a check-in QR code." />
      )}

      <Card>
        <View className="gap-3">
          <Text className="text-lg font-semibold text-neutral-900">Self Check-In</Text>
          <Text className="text-sm text-neutral-500">
            Paste or scan your QR code value to call the same self check-in API used on the web app.
          </Text>
          <Input value={qrCode} onChangeText={setQrCode} placeholder="Paste your QR code value" />
          <Button title="Check In" onPress={handleCheckIn} loading={loading} disabled={!qrCode} />
        </View>
      </Card>
    </Screen>
  );
}
