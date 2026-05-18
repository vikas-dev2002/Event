import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';

export function useAuth() {
  const user = useAuthStore(state => state.user);
  const accessToken = useAuthStore(state => state.accessToken);
  const refreshToken = useAuthStore(state => state.refreshToken);
  const loading = useAuthStore(state => state.loading);
  const hydrated = useAuthStore(state => state.hydrated);
  const bootstrap = useAuthStore(state => state.bootstrap);
  const login = useAuthStore(state => state.login);
  const loginWithGoogle = useAuthStore(state => state.loginWithGoogle);
  const register = useAuthStore(state => state.register);
  const logout = useAuthStore(state => state.logout);
  const setUser = useAuthStore(state => state.setUser);

  useEffect(() => {
    if (!hydrated && !loading) {
      bootstrap().catch(() => undefined);
    }
  }, [bootstrap, hydrated, loading]);

  return {
    user,
    accessToken,
    refreshToken,
    loading,
    hydrated,
    bootstrap,
    login,
    loginWithGoogle,
    register,
    logout,
    setUser,
  };
}
