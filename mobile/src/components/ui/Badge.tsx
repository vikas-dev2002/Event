import React from 'react';
import { Text, View } from 'react-native';

interface BadgeProps {
  label: string;
  tone?: 'default' | 'secondary' | 'success' | 'warning' | 'destructive';
}

const toneMap: Record<NonNullable<BadgeProps['tone']>, string> = {
  default: 'bg-neutral-900',
  secondary: 'bg-neutral-100',
  success: 'bg-green-100',
  warning: 'bg-amber-100',
  destructive: 'bg-red-100',
};

const textToneMap: Record<NonNullable<BadgeProps['tone']>, string> = {
  default: 'text-white',
  secondary: 'text-neutral-700',
  success: 'text-green-700',
  warning: 'text-amber-800',
  destructive: 'text-red-700',
};

export function Badge({ label, tone = 'secondary' }: BadgeProps) {
  return (
    <View className={['self-start rounded-full px-3 py-1', toneMap[tone]].join(' ')}>
      <Text className={['text-xs font-semibold', textToneMap[tone]].join(' ')}>{label}</Text>
    </View>
  );
}
