import React from 'react';
import { Header } from '@/components/layout/Header';
import { LoadingState } from '@/components/ui/LoadingState';
import { Screen } from '@/components/ui/Screen';

export function SplashScreen() {
  return (
    <Screen>
      <Header title="EventEase" subtitle="College events, registrations, attendance, and certificates." />
      <LoadingState label="Preparing your mobile workspace..." />
    </Screen>
  );
}
