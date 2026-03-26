import { GoogleLogin } from '@react-oauth/google';
import { LogOut } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';

export function AuthControls() {
  const user = useAuthStore((state) => state.user);
  const isAuthenticating = useAuthStore((state) => state.isAuthenticating);
  const errorMessage = useAuthStore((state) => state.errorMessage);
  const loginWithGoogleToken = useAuthStore((state) => state.loginWithGoogleToken);
  const clearSession = useAuthStore((state) => state.clearSession);

  if (user) {
    return (
      <div className="flex items-center gap-3">
        <span className="hidden rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700 md:inline">
          {user.email}
        </span>
        <button
          onClick={clearSession}
          className="inline-flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-700"
        >
          <LogOut className="h-4 w-4" />
          로그아웃
        </button>
      </div>
    );
  }

  if (!import.meta.env.VITE_GOOGLE_CLIENT_ID) {
    return (
      <span className="text-xs font-medium text-amber-700">
        VITE_GOOGLE_CLIENT_ID 설정 필요
      </span>
    );
  }

  return (
    <div className="space-y-1">
      <GoogleLogin
        size="medium"
        text="signin_with"
        shape="pill"
        onSuccess={async (credentialResponse) => {
          const idToken = credentialResponse.credential;
          if (!idToken || isAuthenticating) return;
          try {
            await loginWithGoogleToken(idToken);
          } catch {
            // 에러 메시지는 스토어에서 표시
          }
        }}
        onError={() => {
          // no-op
        }}
      />
      {errorMessage ? (
        <p className="text-xs font-medium text-rose-600">{errorMessage}</p>
      ) : null}
    </div>
  );
}
