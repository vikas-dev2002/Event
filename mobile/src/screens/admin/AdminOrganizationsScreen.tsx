import React, { useState } from 'react';
import { Alert, Text, View } from 'react-native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createOrganization, getOrganizations } from '@/api/admin.api';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { Input } from '@/components/ui/Input';
import { LoadingState } from '@/components/ui/LoadingState';
import { Screen } from '@/components/ui/Screen';
import { getErrorMessage } from '@/utils/errors';

export function AdminOrganizationsScreen() {
  const queryClient = useQueryClient();
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');

  const organizationsQuery = useQuery({
    queryKey: ['organizations', 1, 30, ''],
    queryFn: () => getOrganizations(1, 30),
  });

  const createMutation = useMutation({
    mutationFn: () => createOrganization({ name: name.trim(), slug: slug.trim() }),
    onSuccess: async () => {
      setName('');
      setSlug('');
      await queryClient.invalidateQueries({ queryKey: ['organizations'] });
      Alert.alert('College added', 'The organization has been created successfully.');
    },
    onError: error => Alert.alert('Create failed', getErrorMessage(error)),
  });

  const submit = () => {
    if (!name.trim() || !slug.trim()) {
      Alert.alert('Missing details', 'Please provide both a college name and slug.');
      return;
    }
    createMutation.mutate();
  };

  if (organizationsQuery.isLoading) {
    return (
      <Screen>
        <LoadingState label="Loading colleges..." />
      </Screen>
    );
  }

  if (organizationsQuery.isError || !organizationsQuery.data) {
    return (
      <Screen>
        <ErrorState description="Unable to load colleges." onRetry={() => organizationsQuery.refetch()} />
      </Screen>
    );
  }

  const organizations = organizationsQuery.data.organizations;

  return (
    <Screen refreshing={organizationsQuery.isRefetching} onRefresh={() => organizationsQuery.refetch()}>
      <Header title="Colleges" subtitle="Manage organizations across the platform." />

      <Card>
        <View className="gap-3">
          <Text className="text-lg font-semibold text-neutral-900">Add College</Text>
          <Input value={name} onChangeText={setName} placeholder="College name" />
          <Input value={slug} onChangeText={setSlug} placeholder="slug-like-this" autoCapitalize="none" />
          <Button title="Create College" onPress={submit} loading={createMutation.isPending} />
        </View>
      </Card>

      {organizations.length ? (
        organizations.map(org => (
          <Card key={org.id}>
            <View className="gap-2">
              <Text className="text-lg font-semibold text-neutral-900">{org.name}</Text>
              <Text className="text-sm text-neutral-500">{org.slug}</Text>
              <Text className="text-sm text-neutral-500">
                {org._count.users} users • {org._count.events} events
              </Text>
            </View>
          </Card>
        ))
      ) : (
        <EmptyState title="No colleges yet" description="Create the first organization to start structuring the platform." />
      )}
    </Screen>
  );
}
