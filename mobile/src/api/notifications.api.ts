import { apiClient } from './client';

export async function getNotifications() {
  const { data } = await apiClient.get('/api/notifications');
  return data;
}

export async function markNotificationRead(id: string) {
  const { data } = await apiClient.patch(`/api/notifications/${id}`);
  return data;
}

export async function markAllNotificationsRead() {
  const { data } = await apiClient.post('/api/notifications/mark-all-read');
  return data;
}
