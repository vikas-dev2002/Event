import type { EventDetail, EventSummary, OrganizedEventsResponse } from '@/types/event';
import { API_BASE_URL } from '@/constants/config';
import { apiClient, getStoredAuth } from './client';

export interface EventQueryParams {
  page?: number;
  limit?: number;
  status?: string;
  category?: string;
  q?: string;
  sort?: string;
}

export async function getEvents(params: EventQueryParams = {}) {
  const { data } = await apiClient.get<{
    events: EventSummary[];
    pagination: { total: number; page: number; limit: number; pages: number };
  }>('/api/events', { params });
  return data;
}

export async function getEventById(id: string) {
  const { data } = await apiClient.get<{ event: EventDetail }>(`/api/events/${id}`);
  return data.event;
}

export async function registerForEvent(id: string, joinWaitlist = false) {
  const { data } = await apiClient.post(`/api/events/${id}/register`, { joinWaitlist });
  return data;
}

export async function getOrganizedEvents(view: 'active' | 'archived' | 'all' = 'active') {
  const { data } = await apiClient.get<OrganizedEventsResponse>('/api/mobile/organized-events', {
    params: { view },
  });
  return data;
}

export async function getOrganizerEventStudents(id: string) {
  const { data } = await apiClient.get(`/api/mobile/organized-events/${id}/students`);
  return data;
}

export async function issueCertificatesForEvent(eventId: string, studentIds: string[]) {
  const { data } = await apiClient.post(`/api/events/${eventId}/certificates`, { studentIds });
  return data;
}

export async function updateEventStatus(id: string, status: string) {
  const { data } = await apiClient.put(`/api/events/${id}`, { status });
  return data;
}

export async function duplicateEvent(id: string) {
  const { data } = await apiClient.post<{ eventId: string; message: string }>(`/api/events/${id}/duplicate`);
  return data;
}

export async function getEventExportUrl(id: string) {
  const storedAuth = await getStoredAuth();
  if (!storedAuth?.accessToken) {
    throw new Error('Please sign in again before exporting CSV.');
  }

  return `${API_BASE_URL}/api/events/${id}/export-csv?token=${encodeURIComponent(storedAuth.accessToken)}`;
}
