import { GoogleLogin } from '@react-oauth/google';
import { useAuthStore } from '@/store/useAuthStore';

export function AuthControls() {
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
