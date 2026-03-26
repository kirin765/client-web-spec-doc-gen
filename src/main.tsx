// =============================================================================
// 엔트리 포인트 — React 앱 마운트 + i18n 초기화
// =============================================================================

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { GoogleOAuthProvider } from '@react-oauth/google';
import App from './App';
import './index.css';
import './i18n'; // i18next 초기화 (사이드이펙트 import)

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID?.trim();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {googleClientId ? (
      <GoogleOAuthProvider clientId={googleClientId}>
        <App />
      </GoogleOAuthProvider>
    ) : (
      <App />
    )}
  </StrictMode>,
);
