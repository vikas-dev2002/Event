import React from 'react';
import { Alert, Pressable, Text, View } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';
import { markAllNotificationsRead, markNotificationRead } from '@/api/notifications.api';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { LoadingState } from '@/components/ui/LoadingState';
import { Screen } from '@/components/ui/Screen';
import { useNotifications } from '@/hooks/useNotifications';
import { formatDateTime } from '@/utils/formatDate';

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  createdAt: string;
  isRead: boolean;
}

interface NotificationsResponse {
  notifications?: NotificationItem[];
  unreadCount?: number;
}

export function NotificationsScreen() {
  const queryClient = useQueryClient();
  const notificationsQuery = useNotifications();

  const handleRefresh = async () => {
    await queryClient.invalidateQueries({ queryKey: ['notifications'] });
  };

  const handleMarkRead = async (id: string) => {
    await markNotificationRead(id);
    handleRefresh();
  };

  const handleMarkAll = async () => {
    try {
      await markAllNotificationsRead();
      handleRefresh();
    } catch {
      Alert.alert('Unable to mark all notifications as read');
    }
  };

  if (notificationsQuery.isLoading) {
    return (
      <Screen>
        <LoadingState label="Loading notifications..." />
      </Screen>
    );
  }

  if (notificationsQuery.isError) {
    return (
      <Screen>
        <ErrorState description="Unable to load notifications." onRetry={() => notificationsQuery.refetch()} />
      </Screen>
    );
  }

  const response = notificationsQuery.data as NotificationsResponse | undefined;
  const notifications = response?.notifications ?? [];
  const unreadCount = response?.unreadCount ?? 0;

  return (
    <Screen refreshing={notificationsQuery.isRefetching} onRefresh={() => notificationsQuery.refetch()}>
      <Header title="Notifications" subtitle={`${unreadCount} unread updates from registrations, certificates, and announcements.`} />
      {unreadCount > 0 ? <Button title="Mark All Read" variant="outline" onPress={handleMarkAll} /> : null}
      {notifications.length ? (
        notifications.map(notification => (
          <Pressable key={notification.id} onPress={() => !notification.isRead && handleMarkRead(notification.id)}>
            <Card>
              <View className="gap-2">
                <View className="flex-row items-center justify-between">
                  <Text className="text-base font-semibold text-neutral-900">{notification.title}</Text>
                  {!notification.isRead ? <Text className="text-xs font-semibold text-blue-700">New</Text> : null}
                </View>
                <Text className="text-sm text-neutral-600">{notification.message}</Text>
                <Text className="text-xs text-neutral-500">{formatDateTime(notification.createdAt)}</Text>
              </View>
            </Card>
          </Pressable>
        ))
      ) : (
        <EmptyState title="No notifications yet" description="EventEase will show event updates, registration changes, and certificate alerts here." />
      )}
    </Screen>
  );
}
