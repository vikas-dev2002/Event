import React, { useRef, useState } from 'react';
import { Alert, Text, View } from 'react-native';
import { markAttendance } from '@/api/attendance.api';
import { Header } from '@/components/layout/Header';
import { QrScanner } from '@/components/qr/QrScanner';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Screen } from '@/components/ui/Screen';
import { Button } from '@/components/ui/Button';
import { getErrorMessage } from '@/utils/errors';

export function ScannerScreen() {
  const [processing, setProcessing] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const [lastMessage, setLastMessage] = useState<string | null>(null);
  const lastScannedCode = useRef<string | null>(null);

  const submitCode = async (value: string) => {
    if (!value || processing || value === lastScannedCode.current) {
      return;
    }

    setProcessing(true);
    lastScannedCode.current = value;
    try {
      const result = await markAttendance(value);
      const message = result.message ?? `Attendance marked for ${result.registration?.student ?? 'student'}`;
      setLastMessage(message);
      Alert.alert('Success', message);
    } catch (error) {
      const message = getErrorMessage(error, 'Unable to mark attendance.');
      setLastMessage(message);
      Alert.alert('Scan failed', message);
    } finally {
      setProcessing(false);
      setTimeout(() => {
        lastScannedCode.current = null;
      }, 1500);
    }
  };

  return (
    <Screen>
      <Header title="Scanner" subtitle="Use the device camera or manual code entry to mark attendance." />
      <QrScanner onCodeScanned={submitCode} isProcessing={processing} />
      <Card>
        <View className="gap-3">
          <Text className="text-lg font-semibold text-neutral-900">Manual entry</Text>
          <Input value={manualCode} onChangeText={setManualCode} placeholder="Paste QR code or registration ID" />
          <Button title="Mark Attendance" onPress={() => submitCode(manualCode)} loading={processing} disabled={!manualCode} />
        </View>
      </Card>
      {lastMessage ? (
        <Card>
          <Text className="text-sm text-neutral-700">{lastMessage}</Text>
        </Card>
      ) : null}
    </Screen>
  );
}
