// =============================================================================
// App — 라우터 설정 + 레이아웃 래퍼
// =============================================================================
//
// TODO 구현 사항:
// 1. BrowserRouter 또는 createBrowserRouter 사용
// 2. 라우트 정의:
//    - / → LandingPage
//    - /wizard → WizardPage
//    - /result → ResultPage
// 3. 공통 레이아웃: Header + <Outlet /> + Footer
// 4. 404 페이지: / 로 리다이렉트
// =============================================================================

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { LandingPage } from '@/pages/LandingPage';
import { WizardPage } from '@/pages/WizardPage';
import { ResultPage } from '@/pages/ResultPage';

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/wizard" element={<WizardPage />} />
            <Route path="/result" element={<ResultPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}
