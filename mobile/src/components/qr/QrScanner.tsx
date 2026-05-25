import React, { useRef } from 'react';
import { Platform, Text, View } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { Camera as CameraKitCamera, CameraType } from 'react-native-camera-kit';
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

function ScannerContainer({
  children,
  message,
}: {
  children: React.ReactNode;
  message: string;
}) {
  return (
    <View className="overflow-hidden rounded-3xl border border-neutral-200">
      {children}
      <View className="absolute inset-x-4 bottom-4 rounded-2xl bg-black/60 px-4 py-3">
        <Text className="text-center text-sm text-white">{message}</Text>
      </View>
    </View>
  );
}

function IOSScannerPreview({
  device,
  isFocused,
  onCodeScanned,
  isProcessing = false,
}: {
  device: NonNullable<ReturnType<typeof useCameraDevice>>;
  isFocused: boolean;
  onCodeScanned: (value: string) => void;
  isProcessing?: boolean;
}) {
  const cameraRef = useRef<React.ComponentRef<typeof Camera> | null>(null);
  const objectOutput = useObjectOutput({
    types: ['qr'],
    onObjectsScanned(objects) {
      if (isProcessing) {
        return;
      }

      const firstDecodedValue = objects
        .map(object => object as ScannedCode)
        .find(object => typeof object.value === 'string' && object.value.trim().length > 0)
        ?.value?.trim();

      if (firstDecodedValue) {
        onCodeScanned(firstDecodedValue);
      }
    },
  });

  return (
    <ScannerContainer message="Point the camera at a student QR code to scan it automatically. Manual entry remains available below as a fallback.">
      <Camera
        ref={cameraRef}
        style={{ height: 360 }}
        device={device}
        isActive={isFocused}
        outputs={[objectOutput]}
      />
    </ScannerContainer>
  );
}

function AndroidScannerPreview({
  isFocused,
  onCodeScanned,
  isProcessing = false,
}: {
  isFocused: boolean;
  onCodeScanned: (value: string) => void;
  isProcessing?: boolean;
}) {
  return (
    <ScannerContainer message="Point the camera at a student QR code to scan it automatically. Manual entry remains available below as a fallback.">
      <CameraKitCamera
        style={{ height: 360 }}
        cameraType={CameraType.Back}
        scanBarcode
        showFrame
        laserColor="red"
        frameColor="white"
        onReadCode={event => {
          if (!isFocused || isProcessing) {
            return;
          }

          const value = event.nativeEvent.codeStringValue?.trim();
          if (value) {
            onCodeScanned(value);
          }
        }}
      />
    </ScannerContainer>
  );
}

export function QrScanner({ onCodeScanned, isProcessing }: QrScannerProps) {
  const isFocused = useIsFocused();
  const { hasPermission, requestPermission } = useCameraPermission();
  const device = useCameraDevice('back');

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

  if (Platform.OS === 'android') {
    return (
      <AndroidScannerPreview
        isFocused={isFocused}
        onCodeScanned={onCodeScanned}
        isProcessing={isProcessing}
      />
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
    <IOSScannerPreview
      device={device}
      isFocused={isFocused}
      onCodeScanned={onCodeScanned}
      isProcessing={isProcessing}
    />
  );
}
