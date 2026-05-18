import { apiClient } from './client';
import type { AnnouncementDetail, AnnouncementListResponse, AnnouncementSummary } from '@/types/announcement';

export async function getAnnouncements(page = 1, limit = 20) {
  const { data } = await apiClient.get<AnnouncementListResponse>('/api/announcements', { params: { page, limit } });
  return data;
}

export async function getAnnouncementById(id: string) {
  const { data } = await apiClient.get<AnnouncementDetail>(`/api/announcements/${id}`);
  return data;
}

export async function createAnnouncement(payload: {
  title: string;
  content: string;
  isPinned?: boolean;
  eventId?: string | null;
}) {
  const { data } = await apiClient.post<{ announcement: AnnouncementSummary; message: string }>(
    '/api/announcements',
    payload,
  );
  return data;
}

export async function updateAnnouncement(
  id: string,
  payload: { title?: string; content?: string; isPinned?: boolean; eventId?: string | null },
) {
  const { data } = await apiClient.put(`/api/announcements/${id}`, payload);
  return data;
}

export async function deleteAnnouncement(id: string) {
  const { data } = await apiClient.delete(`/api/announcements/${id}`);
  return data;
}

export async function toggleAnnouncementReaction(id: string, emoji: string) {
  const { data } = await apiClient.post<{ action: 'added' | 'removed'; emoji: string }>(
    `/api/announcements/${id}/reactions`,
    { emoji },
  );
  return data;
}

export async function postAnnouncementComment(id: string, payload: { content: string; parentId?: string | null }) {
  const { data } = await apiClient.post(`/api/announcements/${id}/comments`, payload);
  return data;
}

export async function toggleCommentReaction(id: string, emoji: string) {
  const { data } = await apiClient.post<{ action: 'added' | 'removed'; emoji: string }>(
    `/api/comments/${id}/reactions`,
    { emoji },
  );
  return data;
}
