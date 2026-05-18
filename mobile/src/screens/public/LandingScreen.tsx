import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import {
  Award,
  BarChart3,
  Bell,
  Calendar,
  Menu,
  QrCode,
  Users,
  X,
} from 'lucide-react-native';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Screen } from '@/components/ui/Screen';
import { AppText } from '@/components/ui/Typography';

type LandingNavigation = {
  navigate: (screen: string, params?: Record<string, unknown>) => void;
};

const features = [
  {
    icon: Calendar,
    title: 'Event Lifecycle',
    description: 'Create, approve, publish, and archive events with a clear workflow.',
  },
  {
    icon: Users,
    title: 'One-Click Registration',
    description: 'Students register instantly while organizers track participants in real time.',
  },
  {
    icon: QrCode,
    title: 'QR Attendance',
    description: 'Unique QR codes reduce proxy check-ins and keep attendance fast and clean.',
  },
  {
    icon: Award,
    title: 'Auto Certificates',
    description: 'Issue verified certificates moments after an event wraps up.',
  },
  {
    icon: BarChart3,
    title: 'Live Dashboards',
    description: 'Track registrations, attendance, and event performance in one place.',
  },
  {
    icon: Bell,
    title: 'Smart Notifications',
    description: 'Keep students and organizers updated with reminders and announcements.',
  },
];

const quickLinks = [
  { label: 'Events', action: 'events' as const },
  { label: 'Verify Certificate', action: 'verify' as const },
  { label: 'About', action: 'about' as const },
  { label: 'Contact', action: 'contact' as const },
];

export function LandingScreen({ navigation }: { navigation: LandingNavigation }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <Screen>
      <View className="px-1 py-2">
        <View className="flex-row items-center justify-between gap-3">
          <Pressable
            onPress={() => setMenuOpen(current => !current)}
            className="h-11 w-11 items-center justify-center rounded-2xl bg-white">
            {menuOpen ? <X size={20} color="#171717" /> : <Menu size={20} color="#171717" />}
          </Pressable>

          <View className="flex-row items-center gap-3">
            <Pressable onPress={() => navigation.navigate('Login')} className="px-2 py-1">
              <AppText variant="label">Log in</AppText>
            </Pressable>
            <Pressable
              onPress={() => navigation.navigate('Register')}
              className="rounded-2xl bg-neutral-950 px-5 py-3">
              <AppText variant="label" tone="inverse">Get Started</AppText>
            </Pressable>
          </View>
        </View>

        {menuOpen ? (
          <View className="mt-4 gap-1 rounded-2xl bg-neutral-50 p-2">
            {quickLinks.map(link =>
              <Pressable
                key={link.label}
                onPress={() => {
                  setMenuOpen(false);

                  const target =
                    link.action === 'verify'
                      ? 'VerifyCertificate'
                      : link.action === 'about'
                        ? 'About'
                        : link.action === 'contact'
                          ? 'Contact'
                          : 'Events';

                  navigation.navigate(target);
                }}
                className="rounded-xl px-3 py-3">
                <AppText variant="label" tone="muted">{link.label}</AppText>
              </Pressable>,
            )}
          </View>
        ) : null}
      </View>

      <View className="items-center rounded-[32px] border border-neutral-200 bg-white px-6 py-8">
        <View className="rounded-full border border-neutral-200 px-4 py-2">
          <AppText variant="bodySmall" tone="muted">Built for colleges that care about events</AppText>
        </View>

        <AppText
          variant="display"
          style={{ marginTop: 24, textAlign: 'center', fontSize: 36, lineHeight: 42 }}>
          Manage college events{'\n'}without the chaos
        </AppText>

        <AppText variant="body" tone="muted" style={{ marginTop: 24, textAlign: 'center' }}>
          One platform for the entire event lifecycle: creation, approval, registration,
          attendance, and certificates.
        </AppText>

        <View className="mt-8 w-full gap-3">
          <Button title="Get Started Free" onPress={() => navigation.navigate('Register')} />
          <Button title="Browse Events" variant="outline" onPress={() => navigation.navigate('Events')} />
          <Button title="Log In" variant="ghost" onPress={() => navigation.navigate('Login')} />
        </View>
      </View>

      <View className="gap-3">
        <AppText variant="sectionTitle">
          Everything you need, nothing you don&apos;t
        </AppText>
        <AppText variant="bodySmall" tone="muted">
          Replace disconnected tools with one clean workflow built for college events.
        </AppText>
      </View>

      <View className="gap-4">
        {features.map(feature => {
          const Icon = feature.icon;

          return (
            <Card key={feature.title}>
              <View className="gap-4">
                <View className="h-12 w-12 items-center justify-center rounded-2xl bg-neutral-950">
                  <Icon size={22} color="#ffffff" />
                </View>
                <View className="gap-1.5">
                  <AppText variant="cardTitle">{feature.title}</AppText>
                  <AppText variant="bodySmall" tone="muted">{feature.description}</AppText>
                </View>
              </View>
            </Card>
          );
        })}
      </View>

      <View className="items-center rounded-[32px] border border-neutral-200 bg-neutral-50 px-6 py-8">
        <AppText variant="screenTitle" style={{ textAlign: 'center' }}>
          Ready to simplify event management?
        </AppText>
        <AppText variant="bodySmall" tone="muted" style={{ marginTop: 12, textAlign: 'center' }}>
          Join colleges that have moved from spreadsheets and chat groups to a real platform.
        </AppText>
        <View className="mt-6 w-full">
          <Button title="Create Your Account" onPress={() => navigation.navigate('Register')} />
        </View>
      </View>
    </Screen>
  );
}
