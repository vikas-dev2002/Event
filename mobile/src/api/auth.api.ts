import axios from 'axios';
import { API_BASE_URL } from '@/constants/config';
import type {
  AuthResponse,
  LoginPayload,
  RegisterPayload,
  VerificationPendingResponse,
} from '@/types/auth';
import type { User } from '@/types/user';
import { apiClient } from './client';

export async function login(payload: LoginPayload) {
  const { data } = await axios.post<AuthResponse>(`${API_BASE_URL}/api/mobile/auth/login`, payload);
  return data;
}

export async function register(payload: RegisterPayload) {
  const { data } = await axios.post<
    AuthResponse | VerificationPendingResponse
  >(`${API_BASE_URL}/api/mobile/auth/register`, payload);
  return data;
}

export async function loginWithGoogle(idToken: string) {
  const { data } = await axios.post<AuthResponse>(`${API_BASE_URL}/api/mobile/auth/google`, {
    idToken,
  });
  return data;
}

export async function refresh(refreshToken: string) {
  const { data } = await axios.post<AuthResponse>(`${API_BASE_URL}/api/mobile/auth/refresh`, {
    refreshToken,
  });
  return data;
}

export async function getCurrentUser() {
  const { data } = await apiClient.get<{ user: User }>('/api/mobile/me');
  return data.user;
}

export async function updateCurrentUser(
  payload: Partial<User> & { name: string; interests: string[]; organizationSlug?: string },
) {
  const { data } = await apiClient.patch<{ user: User; message: string }>('/api/mobile/me', payload);
  return data;
}
