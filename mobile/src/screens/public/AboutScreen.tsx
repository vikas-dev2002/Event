import React from 'react';
import { Pressable, View } from 'react-native';
import {
  ArrowLeft,
  Award,
  BarChart3,
  Bell,
  Calendar,
  QrCode,
  Shield,
  Users,
  Zap,
} from 'lucide-react-native';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Screen } from '@/components/ui/Screen';
import { AppText } from '@/components/ui/Typography';

type AboutNavigation = {
  goBack: () => void;
  navigate: (screen: string, params?: Record<string, unknown>) => void;
};

const stats = [
  { label: 'Events Managed', value: '500+', icon: Calendar },
  { label: 'Students Served', value: '10,000+', icon: Users },
  { label: 'Certificates Issued', value: '8,000+', icon: Award },
  { label: 'QR Check-ins', value: '25,000+', icon: QrCode },
];

const steps = [
  {
    number: '1',
    title: 'Create & Publish',
    description:
      'Organizers prepare event details, posters, dates, venue, and capacity before publishing.',
  },
  {
    number: '2',
    title: 'Register & Attend',
    description:
      'Students browse events, register in one tap, receive a QR code, and check in at the venue.',
  },
  {
    number: '3',
    title: 'Certify & Analyze',
    description:
      'Issue verified certificates and review registrations, attendance rates, and exports after the event.',
  },
];

const features = [
  {
    icon: Calendar,
    title: 'Full Event Lifecycle',
    description: 'Create, publish, manage, complete, and archive events with a clear workflow.',
  },
  {
    icon: Users,
    title: 'Instant Registration',
    description: 'Students register quickly while organizers see live participant lists.',
  },
  {
    icon: QrCode,
    title: 'QR Attendance',
    description: 'Unique QR codes help keep attendance fast, clean, and proxy-free.',
  },
  {
    icon: Award,
    title: 'Verified Certificates',
    description: 'Certificates can be checked publicly with unique verification codes.',
  },
  {
    icon: BarChart3,
    title: 'Analytics & Export',
    description: 'Track attendance and registrations, then export records when needed.',
  },
  {
    icon: Bell,
    title: 'Smart Notifications',
    description: 'Keep students and organizers updated with reminders and announcements.',
  },
  {
    icon: Shield,
    title: 'Role-Based Access',
    description: 'Students, organizers, and admins each get the right tools and permissions.',
  },
  {
    icon: Zap,
    title: 'Duplicate & Reuse',
    description: 'Reuse previous events without starting from scratch every time.',
  },
];

const roles = [
  {
    title: 'Students',
    description: 'Browse events, register, check in, and access certificates from one place.',
    accent: '#2563eb',
  },
  {
    title: 'Organizers',
    description: 'Create events, scan attendance, manage participants, and issue certificates.',
    accent: '#16a34a',
  },
  {
    title: 'Admins',
    description: 'Oversee approvals, platform activity, and institution-wide event operations.',
    accent: '#7c3aed',
  },
];

export function AboutScreen({ navigation }: { navigation: AboutNavigation }) {
  return (
    <Screen>
      <View className="flex-row items-center justify-between">
        <Pressable
          onPress={() => navigation.goBack()}
          className="h-11 w-11 items-center justify-center rounded-2xl bg-neutral-100">
          <ArrowLeft size={20} color="#171717" />
        </Pressable>
        <AppText variant="label">About EventEase</AppText>
        <View className="w-11" />
      </View>

      <View className="rounded-[32px] bg-neutral-950 px-6 py-8">
        <AppText variant="screenTitle" tone="inverse" style={{ textAlign: 'center' }}>
          About EventEase
        </AppText>
        <AppText variant="body" tone="subtle" style={{ marginTop: 16, textAlign: 'center' }}>
          A unified platform for managing the complete college event lifecycle from approvals and
          registration to attendance and certificates.
        </AppText>
      </View>

      <View className="flex-row flex-wrap gap-4">
        {stats.map(stat => {
          const Icon = stat.icon;

          return (
            <View key={stat.label} className="w-[47%]">
              <Card>
                <View className="items-center gap-3">
                  <View className="h-12 w-12 items-center justify-center rounded-2xl bg-neutral-100">
                    <Icon size={22} color="#171717" />
                  </View>
                  <AppText variant="sectionTitle">{stat.value}</AppText>
                  <AppText variant="bodySmall" tone="muted" style={{ textAlign: 'center' }}>
                    {stat.label}
                  </AppText>
                </View>
              </Card>
            </View>
          );
        })}
      </View>

      <View className="gap-3">
        <AppText variant="sectionTitle">How It Works</AppText>
        <AppText variant="bodySmall" tone="muted">
          Three simple steps take an event from idea to verified completion.
        </AppText>
      </View>

      <View className="gap-4">
        {steps.map(step => (
          <Card key={step.number}>
            <View className="gap-4">
              <View className="h-12 w-12 items-center justify-center rounded-full bg-neutral-950">
                <AppText variant="cardTitle" tone="inverse">
                  {step.number}
                </AppText>
              </View>
              <View className="gap-2">
                <AppText variant="cardTitle">{step.title}</AppText>
                <AppText variant="bodySmall" tone="muted">
                  {step.description}
                </AppText>
              </View>
            </View>
          </Card>
        ))}
      </View>

      <View className="gap-3">
        <AppText variant="sectionTitle">Platform Features</AppText>
        <AppText variant="bodySmall" tone="muted">
          Everything a college needs to run events professionally.
        </AppText>
      </View>

      <View className="gap-4">
        {features.map(feature => {
          const Icon = feature.icon;

          return (
            <Card key={feature.title}>
              <View className="gap-4">
                <View className="h-12 w-12 items-center justify-center rounded-2xl bg-neutral-100">
                  <Icon size={22} color="#171717" />
                </View>
                <View className="gap-1.5">
                  <AppText variant="cardTitle">{feature.title}</AppText>
                  <AppText variant="bodySmall" tone="muted">
                    {feature.description}
                  </AppText>
                </View>
              </View>
            </Card>
          );
        })}
      </View>

      <View className="gap-3">
        <AppText variant="sectionTitle">Built for Every Role</AppText>
        <AppText variant="bodySmall" tone="muted">
          Each user gets an experience tailored to how they use the platform.
        </AppText>
      </View>

      <View className="gap-4">
        {roles.map(role => (
          <Card key={role.title}>
            <View className="gap-4">
              <View className="h-2 rounded-full" style={{ backgroundColor: role.accent }} />
              <View className="gap-1.5">
                <AppText variant="cardTitle">{role.title}</AppText>
                <AppText variant="bodySmall" tone="muted">
                  {role.description}
                </AppText>
              </View>
            </View>
          </Card>
        ))}
      </View>

      <View className="rounded-[32px] bg-neutral-50 px-6 py-8">
        <AppText variant="sectionTitle" style={{ textAlign: 'center' }}>
          Ready to get started?
        </AppText>
        <AppText variant="bodySmall" tone="muted" style={{ marginTop: 12, textAlign: 'center' }}>
          Join your college community on EventEase and manage events the right way.
        </AppText>
        <View className="mt-6 gap-3">
          <Button title="Create Account" onPress={() => navigation.navigate('Register')} />
          <Button title="Browse Events" variant="outline" onPress={() => navigation.navigate('Events')} />
        </View>
      </View>
    </Screen>
  );
}
