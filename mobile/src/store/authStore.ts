import { create } from 'zustand';
import type { AuthResponse, LoginPayload, RegisterPayload, VerificationPendingResponse } from '@/types/auth';
import type { User } from '@/types/user';
import { clearStoredAuth, getStoredAuth, saveStoredAuth, setUnauthorizedHandler } from '@/api/client';
import { getCurrentUser, login, loginWithGoogle, refresh, register } from '@/api/auth.api';

type AuthState = {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  loading: boolean;
  hydrated: boolean;
  bootstrap: () => Promise<void>;
  login: (payload: LoginPayload) => Promise<{ requiresVerification?: boolean }>;
  loginWithGoogle: (idToken: string) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<{ requiresVerification?: boolean; message?: string }>;
  logout: () => Promise<void>;
  setUser: (user: User) => void;
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  loading: false,
  hydrated: false,
  bootstrap: async () => {
    set({ loading: true });
    setUnauthorizedHandler(async () => {
      await get().logout();
    });

    try {
      const stored = await getStoredAuth();
      if (!stored?.accessToken) {
        set({ hydrated: true, loading: false, user: null, accessToken: null, refreshToken: null });
        return;
      }

      set({
        accessToken: stored.accessToken,
        refreshToken: stored.refreshToken ?? null,
      });

      try {
        const user = await getCurrentUser();
        set({ user, hydrated: true, loading: false });
      } catch {
        if (stored.refreshToken) {
          const refreshed = await refresh(stored.refreshToken);
          await saveStoredAuth({
            accessToken: refreshed.accessToken,
            refreshToken: refreshed.refreshToken,
          });
          const user = await getCurrentUser();
          set({
            user,
            accessToken: refreshed.accessToken,
            refreshToken: refreshed.refreshToken,
            hydrated: true,
            loading: false,
          });
          return;
        }

        await clearStoredAuth();
        set({ user: null, accessToken: null, refreshToken: null, hydrated: true, loading: false });
      }
    } catch {
      await clearStoredAuth();
      set({ user: null, accessToken: null, refreshToken: null, hydrated: true, loading: false });
    }
  },
  login: async payload => {
    set({ loading: true });
    try {
      const response = await login(payload);
      await saveStoredAuth({
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
      });
      set({
        user: response.user,
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
        loading: false,
        hydrated: true,
      });
      return {};
    } catch (error) {
      set({ loading: false, hydrated: true });
      throw error;
    }
  },
  loginWithGoogle: async idToken => {
    set({ loading: true });
    try {
      const response = await loginWithGoogle(idToken);
      await saveStoredAuth({
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
      });
      set({
        user: response.user,
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
        loading: false,
        hydrated: true,
      });
    } catch (error) {
      set({ loading: false, hydrated: true });
      throw error;
    }
  },
  register: async payload => {
    set({ loading: true });
    try {
      const response = await register(payload);

      if (isVerificationPendingResponse(response)) {
        set({ loading: false, hydrated: true });
        return { requiresVerification: true, message: response.message };
      }

      await saveStoredAuth({
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
      });
      set({
        user: response.user,
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
        loading: false,
        hydrated: true,
      });
      return {};
    } catch (error) {
      set({ loading: false, hydrated: true });
      throw error;
    }
  },
  logout: async () => {
    await clearStoredAuth();
    set({
      user: null,
      accessToken: null,
      refreshToken: null,
      loading: false,
      hydrated: true,
    });
  },
  setUser: user => set({ user }),
}));

function isVerificationPendingResponse(
  response: AuthResponse | VerificationPendingResponse,
): response is VerificationPendingResponse {
  return 'requiresVerification' in response && response.requiresVerification === true;
}
