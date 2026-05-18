import React, { useRef } from 'react';
import { Text, View } from 'react-native';
import {
  Camera,
  type ScannedCode,
  useCameraDevice,
  useCameraPermission,
  useObjectOutput,
} from 'react-native-vision-camera';
import { Button } from '@/components/ui/Button';

interface QrScannerProps {
  onCodeScanned: (value: string) => void;
  isProcessing?: boolean;
}

export function QrScanner({ onCodeScanned: _onCodeScanned, isProcessing: _isProcessing }: QrScannerProps) {
  const cameraRef = useRef<React.ComponentRef<typeof Camera> | null>(null);
  const { hasPermission, requestPermission } = useCameraPermission();
  const device = useCameraDevice('back');
  const objectOutput = useObjectOutput({
    types: ['qr'],
    onObjectsScanned(objects) {
      if (_isProcessing) {
        return;
      }

      const firstDecodedValue = objects
        .map(object => object as ScannedCode)
        .find(object => typeof object.value === 'string' && object.value.trim().length > 0)
        ?.value?.trim();

      if (firstDecodedValue) {
        _onCodeScanned(firstDecodedValue);
      }
    },
  });

  if (!hasPermission) {
    return (
      <View className="rounded-3xl border border-neutral-200 bg-white p-5">
        <Text className="text-lg font-semibold text-neutral-900">Camera access required</Text>
        <Text className="mt-2 text-sm text-neutral-500">
          Allow camera access so organizers can scan student QR codes.
        </Text>
        <View className="mt-4">
          <Button title="Grant Camera Access" onPress={requestPermission} />
        </View>
      </View>
    );
  }

  if (!device) {
    return (
      <View className="rounded-3xl border border-neutral-200 bg-white p-5">
        <Text className="text-sm text-neutral-500">No camera device available.</Text>
      </View>
    );
  }

  return (
    <View className="overflow-hidden rounded-3xl border border-neutral-200">
      <Camera
        ref={cameraRef}
        style={{ height: 360 }}
        device={device}
        isActive
        outputs={[objectOutput]}
      />
      <View className="absolute inset-x-4 bottom-4 rounded-2xl bg-black/60 px-4 py-3">
        <Text className="text-center text-sm text-white">
          Point the camera at a student QR code to scan it automatically. Manual entry remains available below as a fallback.
        </Text>
      </View>
    </View>
  );
}
