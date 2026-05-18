import React from 'react';
import { View } from 'react-native';
import { Button } from './Button';
import { AppText } from './Typography';

interface ErrorStateProps {
  title?: string;
  description: string;
  onRetry?: () => void;
}

export function ErrorState({
  title = 'Something went wrong',
  description,
  onRetry,
}: ErrorStateProps) {
  return (
    <View className="rounded-3xl border border-red-200 bg-red-50 px-5 py-8">
      <AppText variant="cardTitle" tone="destructive" style={{ textAlign: 'center' }}>
        {title}
      </AppText>
      <AppText variant="bodySmall" tone="destructive" style={{ marginTop: 8, textAlign: 'center' }}>
        {description}
      </AppText>
      {onRetry ? <View className="mt-4"><Button title="Try Again" onPress={onRetry} /></View> : null}
    </View>
  );
}
