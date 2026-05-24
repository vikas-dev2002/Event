import React from 'react';
import { Text, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { getAdminOverview } from '@/api/admin.api';
import { Header } from '@/components/layout/Header';
import { Card } from '@/components/ui/Card';
import { ErrorState } from '@/components/ui/ErrorState';
import { LoadingState } from '@/components/ui/LoadingState';
import { OrgIdentity } from '@/components/ui/OrgIdentity';
import { Screen } from '@/components/ui/Screen';

export function AdminHomeScreen() {
  const overviewQuery = useQuery({
    queryKey: ['admin-overview'],
    queryFn: getAdminOverview,
  });

  if (overviewQuery.isLoading) {
    return (
      <Screen>
        <LoadingState label="Loading admin overview..." />
      </Screen>
    );
  }

  if (overviewQuery.isError || !overviewQuery.data) {
    return (
      <Screen>
        <ErrorState description="Unable to load the admin overview." onRetry={() => overviewQuery.refetch()} />
      </Screen>
    );
  }

  const { stats, recentOrganizations, recentEvents } = overviewQuery.data;

  return (
    <Screen refreshing={overviewQuery.isRefetching} onRefresh={() => overviewQuery.refetch()}>
      <Header title="Platform Overview" subtitle="Platform-wide analytics and recent activity." />

      <View className="flex-row flex-wrap gap-4">
        {[
          { label: 'Colleges', value: stats.totalColleges },
          { label: 'Users', value: stats.totalUsers },
          { label: 'Events', value: stats.totalEvents },
          { label: 'Registrations', value: stats.totalRegistrations },
          { label: 'Certificates', value: stats.totalCertificates },
          { label: 'Pending Requests', value: stats.pendingOrganizerRequests },
        ].map(item => (
          <View key={item.label} className="w-[47%]">
            <Card>
              <Text className="text-sm text-neutral-500">{item.label}</Text>
              <Text className="mt-2 text-2xl font-bold text-neutral-900">{item.value}</Text>
            </Card>
          </View>
        ))}
      </View>

      <Card>
        <Text className="text-lg font-semibold text-neutral-900">Recent Colleges</Text>
        <View className="mt-4 gap-3">
          {recentOrganizations.map(org => (
            <View key={org.id} className="rounded-2xl bg-neutral-50 p-3">
              <OrgIdentity name={org.name} logoUrl={org.logo} subtitle={org.slug} size="sm" variant="plain" />
              <Text className="text-sm text-neutral-500">
                {org._count.users} users • {org._count.events} events
              </Text>
            </View>
          ))}
        </View>
      </Card>

      <Card>
        <Text className="text-lg font-semibold text-neutral-900">Recent Events</Text>
        <View className="mt-4 gap-3">
          {recentEvents.map(event => (
            <View key={event.id} className="rounded-2xl bg-neutral-50 p-3">
              <Text className="font-semibold text-neutral-900">{event.title}</Text>
              {event.org ? (
                <OrgIdentity
                  name={event.org.name}
                  logoUrl={event.org.logo}
                  subtitle={event.organizer?.name ?? 'Unknown organizer'}
                  size="sm"
                  variant="plain"
                />
              ) : (
                <Text className="text-sm text-neutral-500">{event.organizer?.name ?? 'Unknown organizer'}</Text>
              )}
              <Text className="text-sm text-neutral-500">
                {new Date(event.startDate).toLocaleDateString('en-IN')} • {event._count.registrations} registrations
              </Text>
            </View>
          ))}
        </View>
      </Card>
    </Screen>
  );
}
