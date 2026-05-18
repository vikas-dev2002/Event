import type { Registration } from '@/types/registration';
import { apiClient } from './client';

export async function getRegistrations() {
  const { data } = await apiClient.get<{ registrations: Registration[]; count: number }>(
    '/api/mobile/registrations',
  );
  return data;
}

export async function cancelRegistration(id: string) {
  const { data } = await apiClient.post(`/api/mobile/registrations/${id}/cancel`);
  return data;
}
