import React from 'react';
import { View } from 'react-native';
import { AppText } from './Typography';

interface EmptyStateProps {
  title: string;
  description: string;
}

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <View className="rounded-3xl border border-dashed border-neutral-300 bg-neutral-50 px-5 py-10">
      <AppText variant="cardTitle" style={{ textAlign: 'center' }}>{title}</AppText>
      <AppText variant="bodySmall" tone="muted" style={{ marginTop: 8, textAlign: 'center' }}>
        {description}
      </AppText>
    </View>
  );
}
