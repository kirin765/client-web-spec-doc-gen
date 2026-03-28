import { GoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';

interface AuthControlsProps {
  redirectTo?: string;
}

export function AuthControls({ redirectTo = '/mypage' }: AuthControlsProps) {
  const navigate = useNavigate();
  const isAuthenticating = useAuthStore((state) => state.isAuthenticating);
  const errorMessage = useAuthStore((state) => state.errorMessage);
  const loginWithGoogleToken = useAuthStore((state) => state.loginWithGoogleToken);

  if (!import.meta.env.VITE_GOOGLE_CLIENT_ID) {
    return (
      <span className="text-xs font-medium text-amber-700">
        VITE_GOOGLE_CLIENT_ID 설정 필요
      </span>
    );
  }

  return (
    <div className="space-y-1">
      {isAuthenticating ? (
        <div
          className="inline-flex min-h-[40px] items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700"
          aria-live="polite"
          aria-busy="true"
        >
          <Loader2 className="h-4 w-4 animate-spin" />
          Google 계정 확인 중...
        </div>
      ) : (
        <GoogleLogin
          size="medium"
          text="signin_with"
          shape="pill"
          onSuccess={async (credentialResponse) => {
            const idToken = credentialResponse.credential;
            if (!idToken || isAuthenticating) return;
            try {
              await loginWithGoogleToken(idToken);
              navigate(redirectTo, { replace: true });
            } catch {
              // 에러 메시지는 스토어에서 표시
            }
          }}
          onError={() => {
            // no-op
          }}
        />
      )}
      {errorMessage ? (
        <p className="text-xs font-medium text-rose-600">{errorMessage}</p>
      ) : null}
    </div>
  );
}
