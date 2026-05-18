import React from 'react';
import { Text, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { formatDateTime } from '@/utils/formatDate';

interface StudentQrCodeProps {
  eventTitle: string;
  qrCode: string;
  attended?: boolean;
  attendanceTime?: string;
}

export function StudentQrCode({
  eventTitle,
  qrCode,
  attended,
  attendanceTime,
}: StudentQrCodeProps) {
  return (
    <Card>
      <View className="items-center gap-4">
        <View className="w-full flex-row items-center justify-between">
          <View className="flex-1">
            <Text className="text-lg font-semibold text-neutral-900">Your Event QR</Text>
            <Text className="text-sm text-neutral-500">{eventTitle}</Text>
          </View>
          {attended ? <Badge label="Attended" tone="success" /> : null}
        </View>
        <View className="rounded-3xl bg-white p-4">
          <QRCode value={qrCode} size={220} />
        </View>
        <View className="w-full rounded-2xl bg-blue-50 p-4">
          <Text className="text-sm font-semibold text-blue-900">Registration QR</Text>
          <Text className="mt-1 text-xs text-blue-700">{qrCode}</Text>
          {attendanceTime ? (
            <Text className="mt-2 text-xs text-blue-700">Checked in at {formatDateTime(attendanceTime)}</Text>
          ) : null}
        </View>
      </View>
    </Card>
  );
}
