import React from 'react';
import { Alert, Text, View } from 'react-native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getOrganizerRequests, reviewOrganizerRequest } from '@/api/admin.api';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { LoadingState } from '@/components/ui/LoadingState';
import { Screen } from '@/components/ui/Screen';
import { Header } from '@/components/layout/Header';
import { getErrorMessage } from '@/utils/errors';

export function AdminOrganizerRequestsScreen() {
  const queryClient = useQueryClient();
  const requestsQuery = useQuery({
    queryKey: ['organizer-requests'],
    queryFn: getOrganizerRequests,
  });

  const reviewMutation = useMutation({
    mutationFn: ({ id, action }: { id: string; action: 'APPROVED' | 'REJECTED' }) =>
      reviewOrganizerRequest(id, {
        action,
        rejectionReason: action === 'REJECTED' ? 'Please contact admin for more information.' : undefined,
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['organizer-requests'] });
      await queryClient.invalidateQueries({ queryKey: ['admin-overview'] });
    },
    onError: error => Alert.alert('Request update failed', getErrorMessage(error)),
  });

  if (requestsQuery.isLoading) {
    return (
      <Screen>
        <LoadingState label="Loading organizer requests..." />
      </Screen>
    );
  }

  if (requestsQuery.isError || !requestsQuery.data) {
    return (
      <Screen>
        <ErrorState description="Unable to load organizer requests." onRetry={() => requestsQuery.refetch()} />
      </Screen>
    );
  }

  const { requests, pendingCount } = requestsQuery.data;

  return (
    <Screen refreshing={requestsQuery.isRefetching} onRefresh={() => requestsQuery.refetch()}>
      <Header title="Organizer Requests" subtitle={`${pendingCount} pending verification requests.`} />

      {requests.length ? (
        requests.map(request => (
          <Card key={request.id}>
            <View className="gap-3">
              <View className="flex-row items-start justify-between gap-3">
                <View className="flex-1">
                  <Text className="text-lg font-semibold text-neutral-900">{request.user.name}</Text>
                  <Text className="text-sm text-neutral-500">{request.user.email}</Text>
                </View>
                <Badge
                  label={request.status}
                  tone={
                    request.status === 'APPROVED'
                      ? 'success'
                      : request.status === 'REJECTED'
                        ? 'destructive'
                        : 'warning'
                  }
                />
              </View>

              <Text className="text-sm text-neutral-700">College: {request.collegeName}</Text>
              <Text className="text-sm text-neutral-700">Designation: {request.designation}</Text>
              {request.organizationWeb ? <Text className="text-sm text-neutral-700">{request.organizationWeb}</Text> : null}
              <Text className="text-sm text-neutral-500">{request.reason}</Text>

              {request.status === 'PENDING' ? (
                <View className="flex-row gap-3">
                  <View className="flex-1">
                    <Button
                      title="Approve"
                      onPress={() => reviewMutation.mutate({ id: request.id, action: 'APPROVED' })}
                      loading={reviewMutation.isPending}
                    />
                  </View>
                  <View className="flex-1">
                    <Button
                      title="Reject"
                      variant="outline"
                      onPress={() => reviewMutation.mutate({ id: request.id, action: 'REJECTED' })}
                      loading={reviewMutation.isPending}
                    />
                  </View>
                </View>
              ) : null}
            </View>
          </Card>
        ))
      ) : (
        <EmptyState title="No organizer requests" description="New organizer applications will appear here." />
      )}
    </Screen>
  );
}
