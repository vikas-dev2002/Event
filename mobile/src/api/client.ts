import axios from 'axios';
import * as Keychain from 'react-native-keychain';
import { API_BASE_URL, API_TIMEOUT_MS, KEYCHAIN_SERVICE } from '@/constants/config';

type AuthRecord = {
  accessToken: string;
  refreshToken?: string;
};

let onUnauthorized: (() => void) | null = null;

export function setUnauthorizedHandler(handler: (() => void) | null) {
  onUnauthorized = handler;
}

export async function getStoredAuth(): Promise<AuthRecord | null> {
  const credentials = await Keychain.getGenericPassword({ service: KEYCHAIN_SERVICE });
  if (!credentials) {
    return null;
  }

  try {
    return JSON.parse(credentials.password) as AuthRecord;
  } catch {
    return null;
  }
}

export async function saveStoredAuth(auth: AuthRecord) {
  await Keychain.setGenericPassword('eventease', JSON.stringify(auth), {
    service: KEYCHAIN_SERVICE,
  });
}

export async function clearStoredAuth() {
  await Keychain.resetGenericPassword({ service: KEYCHAIN_SERVICE });
}

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT_MS,
});

apiClient.interceptors.request.use(async config => {
  const stored = await getStoredAuth();
  if (stored?.accessToken) {
    config.headers.Authorization = `Bearer ${stored.accessToken}`;
  }

  return config;
});

apiClient.interceptors.response.use(
  response => response,
  async error => {
    if (error?.response?.status === 401 && onUnauthorized) {
      onUnauthorized();
    }

    return Promise.reject(error);
  },
);
