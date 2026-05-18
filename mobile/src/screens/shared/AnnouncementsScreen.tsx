import React from 'react';
import { Alert, Pressable, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { MessageSquarePlus, Pin } from 'lucide-react-native';
import { getAnnouncements } from '@/api/announcements.api';
import { Header } from '@/components/layout/Header';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { LoadingState } from '@/components/ui/LoadingState';
import { Screen } from '@/components/ui/Screen';
import { AppText } from '@/components/ui/Typography';
import { useAuth } from '@/hooks/useAuth';
import type { AnnouncementListResponse, AnnouncementSummary } from '@/types/announcement';

type NavigationLike = {
  navigate: (screen: string, params?: Record<string, unknown>) => void;
};

function formatRelativeTime(date: string) {
  const diffMs = Date.now() - new Date(date).getTime();
  const diffMinutes = Math.floor(diffMs / 60000);

  if (diffMinutes < 1) return 'just now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;

  return new Date(date).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function AnnouncementRow({
  announcement,
  onPress,
}: {
  announcement: AnnouncementSummary;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress}>
      <Card>
        <View className="gap-3">
          <View className="flex-row items-start justify-between gap-3">
            <View className="flex-1 gap-1.5">
              <View className="flex-row flex-wrap items-center gap-2">
                <AppText variant="cardTitle">{announcement.title}</AppText>
                {announcement.isPinned ? <Badge label="Pinned" tone="warning" /> : null}
              </View>
              <AppText variant="caption" tone="muted">
                {announcement.author.name} • {formatRelativeTime(announcement.createdAt)}
              </AppText>
            </View>
            {announcement.isPinned ? <Pin size={16} color="#a16207" /> : null}
          </View>

          <AppText variant="bodySmall" tone="muted" numberOfLines={3}>
            {announcement.content}
          </AppText>

          {announcement.event ? <Badge label={announcement.event.title} tone="secondary" /> : null}

          <View className="flex-row flex-wrap gap-2">
            {announcement.reactionCounts.length ? (
              announcement.reactionCounts.slice(0, 4).map(item => (
                <View key={`${announcement.id}-${item.emoji}`} className="rounded-full bg-neutral-100 px-2.5 py-1">
                  <AppText variant="caption">{item.emoji} {item.count}</AppText>
                </View>
              ))
            ) : (
              <View className="rounded-full bg-neutral-100 px-2.5 py-1">
                <AppText variant="caption" tone="muted">No reactions yet</AppText>
              </View>
            )}
            <View className="rounded-full bg-neutral-100 px-2.5 py-1">
              <AppText variant="caption" tone="muted">{announcement._count.comments} comments</AppText>
            </View>
          </View>
        </View>
      </Card>
    </Pressable>
  );
}

export function AnnouncementsScreen({ navigation }: { navigation: NavigationLike }) {
  const { user } = useAuth();
  const announcementsQuery = useQuery<AnnouncementListResponse>({
    queryKey: ['announcements', 1],
    queryFn: () => getAnnouncements(1, 20),
  });

  const canCreate = user?.role === 'ORGANIZER' || user?.role === 'ADMIN';

  if (announcementsQuery.isLoading) {
    return (
      <Screen>
        <LoadingState label="Loading announcements..." />
      </Screen>
    );
  }

  if (announcementsQuery.isError) {
    return (
      <Screen>
        <ErrorState description="Unable to load announcements." onRetry={() => announcementsQuery.refetch()} />
      </Screen>
    );
  }

  const announcements = announcementsQuery.data?.announcements ?? [];

  return (
    <Screen refreshing={announcementsQuery.isRefetching} onRefresh={() => announcementsQuery.refetch()}>
      <Header title="Announcements" subtitle="Updates, reminders, and event notices from your organization." />

      {canCreate ? (
        <Button
          title="Post Announcement"
          variant="outline"
          onPress={() => navigation.navigate('CreateAnnouncement')}
        />
      ) : null}

      {announcements.length ? (
        announcements.map(announcement => (
          <AnnouncementRow
            key={announcement.id}
            announcement={announcement}
            onPress={() => navigation.navigate('AnnouncementDetail', { id: announcement.id })}
          />
        ))
      ) : (
        <EmptyState
          title="No announcements yet"
          description={
            canCreate
              ? 'Post the first announcement to share updates with your organization.'
              : 'Announcements from your organization will appear here.'
          }
        />
      )}

      {canCreate && !announcements.length ? (
        <Card>
          <View className="gap-3">
            <View className="flex-row items-center gap-3">
              <View className="h-12 w-12 items-center justify-center rounded-2xl bg-neutral-100">
                <MessageSquarePlus size={22} color="#171717" />
              </View>
              <View className="flex-1 gap-1">
                <AppText variant="cardTitle">Start your organization feed</AppText>
                <AppText variant="bodySmall" tone="muted">
                  Publish reminders, event notices, and quick updates directly from mobile.
                </AppText>
              </View>
            </View>
            <Button title="Create First Announcement" onPress={() => navigation.navigate('CreateAnnouncement')} />
          </View>
        </Card>
      ) : null}
    </Screen>
  );
}
