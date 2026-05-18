import React, { PropsWithChildren } from 'react';
import { View } from 'react-native';

export function Card({ children }: PropsWithChildren) {
  return <View className="rounded-3xl border border-neutral-200 bg-white p-4">{children}</View>;
}
