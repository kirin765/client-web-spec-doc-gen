import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ApiError, getCurrentUser, loginWithGoogle } from '@/lib/api';
import type { SessionUser } from '@/types/api';

interface AuthState {
  token: string | null;
  user: SessionUser | null;
  isAuthenticating: boolean;
  errorMessage: string | null;
  loginWithGoogleToken: (idToken: string) => Promise<void>;
  refreshMe: () => Promise<void>;
  clearSession: () => void;
  updateUser: (partial: Partial<SessionUser>) => void;
}

const STORAGE_KEY = 'auth-store';

function getErrorMessage(error: unknown) {
  if (error instanceof ApiError) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return '인증 처리 중 오류가 발생했습니다.';
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      isAuthenticating: false,
      errorMessage: null,

      loginWithGoogleToken: async (idToken: string) => {
        set({ isAuthenticating: true, errorMessage: null });
        try {
          const response = await loginWithGoogle(idToken);
          set({
            token: response.token,
            user: response.user,
            isAuthenticating: false,
          });
        } catch (error) {
          set({
            isAuthenticating: false,
            errorMessage: getErrorMessage(error),
          });
          throw error;
        }
      },

      refreshMe: async () => {
        const token = get().token;
        if (!token) return;

        try {
          const user = await getCurrentUser(token);
          set({ user, errorMessage: null });
        } catch {
          set({
            token: null,
            user: null,
            errorMessage: '세션이 만료되어 로그아웃되었습니다.',
          });
        }
      },

      clearSession: () => {
        set({
          token: null,
          user: null,
          isAuthenticating: false,
          errorMessage: null,
        });
      },

      updateUser: (partial) =>
        set((state) => ({
          user: state.user
            ? {
                ...state.user,
                ...partial,
              }
            : state.user,
        })),
    }),
    {
      name: STORAGE_KEY,
      partialize: (state) => ({
        token: state.token,
        user: state.user,
      }),
    },
  ),
);
