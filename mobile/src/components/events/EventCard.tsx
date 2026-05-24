import React from 'react';
import { Image, Pressable, Text, View } from 'react-native';
import type { EventSummary } from '@/types/event';
import { formatDate, formatTime } from '@/utils/formatDate';
import { resolveAssetUrl } from '@/utils/assets';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { OrgIdentity } from '@/components/ui/OrgIdentity';

interface EventCardProps {
  event: EventSummary;
  onPress?: () => void;
}

export function EventCard({ event, onPress }: EventCardProps) {
  const spotsLeft = event.capacity - event._count.registrations;
  const posterUrl = resolveAssetUrl(event.posterUrl);

  return (
    <Pressable onPress={onPress}>
      <Card>
        {posterUrl ? (
          <Image
            source={{ uri: posterUrl }}
            className="mb-4 h-44 w-full rounded-2xl bg-neutral-100"
            resizeMode="cover"
          />
        ) : (
          <View className="mb-4 h-44 items-center justify-center rounded-2xl bg-slate-900">
            <Text className="text-4xl text-white">{event.category === 'TECHNICAL' ? '💻' : '🎟️'}</Text>
          </View>
        )}

        <View className="mb-3 flex-row items-center justify-between">
          <Badge label={event.category} tone="secondary" />
          <Text className="text-xs text-neutral-500">{event._count.registrations} registered</Text>
        </View>

        {event.org ? (
          <OrgIdentity name={event.org.name} logoUrl={event.org.logo} size="sm" variant="plain" className="mb-2" />
        ) : null}

        <Text className="text-lg font-semibold text-neutral-900">{event.title}</Text>
        <Text className="mt-2 text-sm leading-6 text-neutral-500">{event.description}</Text>

        <View className="mt-4 gap-1">
          <Text className="text-sm text-neutral-700">{formatDate(event.startDate)} • {formatTime(event.startDate)}</Text>
          <Text className="text-sm text-neutral-700">{event.venue}</Text>
          <Text className="text-sm text-neutral-500">
            Capacity {event._count.registrations}/{event.capacity}
            {spotsLeft > 0 ? ` • ${spotsLeft} left` : ' • Full'}
          </Text>
        </View>
      </Card>
    </Pressable>
  );
}
