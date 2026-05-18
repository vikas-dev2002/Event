import { useQuery } from '@tanstack/react-query';
import { getRegistrations } from '@/api/registrations.api';

export function useRegistrations() {
  return useQuery({
    queryKey: ['registrations'],
    queryFn: getRegistrations,
  });
}
