import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { AppText } from './Typography';

interface LoadingStateProps {
  label?: string;
}

export function LoadingState({ label = 'Loading...' }: LoadingStateProps) {
  return (
    <View className="items-center justify-center rounded-3xl border border-neutral-200 bg-white px-5 py-12">
      <ActivityIndicator />
      <AppText variant="bodySmall" tone="muted" style={{ marginTop: 12 }}>
        {label}
      </AppText>
    </View>
  );
}
