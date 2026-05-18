import React from 'react';
import { View } from 'react-native';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Screen } from '@/components/ui/Screen';
import { AppText } from '@/components/ui/Typography';

type PendingNavigation = {
  navigate: (screen: string) => void;
};

export function VerificationPendingScreen({ navigation }: { navigation: PendingNavigation }) {
  return (
    <Screen>
      <Card>
        <View className="gap-5">
          <View className="gap-2">
            <AppText variant="screenTitle">Verification Pending</AppText>
            <AppText variant="body" tone="muted">
              Your organizer request has been submitted. An admin needs to review it before organizer tools become available.
            </AppText>
          </View>

          <View className="gap-2 rounded-2xl bg-amber-50 px-4 py-4">
            <AppText variant="label" tone="warning">What happens next?</AppText>
            <AppText variant="bodySmall" tone="muted">
              Once approved, you can sign in on mobile and access event management, scanner, announcements, and certificates.
            </AppText>
          </View>

          <Button title="Back to Login" onPress={() => navigation.navigate('Login')} />
        </View>
      </Card>
    </Screen>
  );
}
