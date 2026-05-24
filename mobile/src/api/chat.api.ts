import { apiClient } from '@/api/client';

export type ChatRole = 'user' | 'assistant';

export interface ChatMessagePayload {
  role: ChatRole;
  content: string;
}

interface ChatResponse {
  message: string;
}

export async function sendChatMessages(messages: ChatMessagePayload[]) {
  const response = await apiClient.post<ChatResponse>('/api/chat', { messages });
  return response.data;
}
