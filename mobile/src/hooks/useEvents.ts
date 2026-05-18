import { useQuery } from '@tanstack/react-query';
import { getEventById, getEvents, getOrganizedEvents, type EventQueryParams } from '@/api/events.api';

export function useEvents(params: EventQueryParams) {
  return useQuery({
    queryKey: ['events', params],
    queryFn: () => getEvents(params),
  });
}

export function useEvent(id: string) {
  return useQuery({
    queryKey: ['event', id],
    queryFn: () => getEventById(id),
    enabled: Boolean(id),
  });
}

export function useOrganizedEvents(view: 'active' | 'archived' | 'all' = 'active') {
  return useQuery({
    queryKey: ['organized-events', view],
    queryFn: () => getOrganizedEvents(view),
  });
}
