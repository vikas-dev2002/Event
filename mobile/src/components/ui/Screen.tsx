import React, { PropsWithChildren } from 'react';
import { RefreshControl, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface ScreenProps extends PropsWithChildren {
  scroll?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
}

export function Screen({ children, scroll = true, refreshing, onRefresh }: ScreenProps) {
  if (!scroll) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 bg-white px-5 py-4">{children}</View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView
        className="flex-1 bg-white"
        contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 16, gap: 16 }}
        refreshControl={
          onRefresh ? <RefreshControl refreshing={Boolean(refreshing)} onRefresh={onRefresh} /> : undefined
        }>
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}
