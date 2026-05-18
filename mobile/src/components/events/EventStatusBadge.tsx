import React from 'react';
import { Badge } from '@/components/ui/Badge';
import type { EventStatus } from '@/types/event';

const toneMap: Record<EventStatus, 'secondary' | 'success' | 'warning' | 'destructive' | 'default'> = {
  DRAFT: 'secondary',
  PENDING: 'warning',
  PUBLISHED: 'default',
  ONGOING: 'success',
  COMPLETED: 'success',
  CANCELLED: 'destructive',
  ARCHIVED: 'secondary',
};

export function EventStatusBadge({ status }: { status: EventStatus }) {
  return <Badge label={status.replace('_', ' ')} tone={toneMap[status]} />;
}
