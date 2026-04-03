// App — BrowserRouter 라우팅. / → Landing, /wizard → Wizard, /result → Result, * → 리다이렉트.

import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { LandingPage } from '@/pages/LandingPage';
import { WizardPage } from '@/pages/WizardPage';
import { ResultPage } from '@/pages/ResultPage';
import { CustomerMatchesPage } from '@/pages/CustomerMatchesPage';
import { CustomerProposalsPage } from '@/pages/CustomerProposalsPage';
import { AdminPage } from '@/pages/AdminPage';
import { ExpertDirectoryPage } from '@/pages/ExpertDirectoryPage';
import { ExpertDetailPage } from '@/pages/ExpertDetailPage';
import { UserQuotesPage } from '@/pages/UserQuotesPage';
import { MyPage } from '@/pages/MyPage';
import { ChatPage } from '@/pages/ChatPage';
import { RequireAdmin, RequireAuth } from '@/components/auth/RouteGuards';
import { useAuthStore } from '@/store/useAuthStore';
import { Analytics } from '@vercel/analytics/react';

export default function App() {
  const refreshMe = useAuthStore((state) => state.refreshMe);

  useEffect(() => {
    void refreshMe();
  }, [refreshMe]);

  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/wizard" element={<WizardPage />} />
            <Route path="/result" element={<ResultPage />} />
            <Route path="/projects/:projectId/matches" element={<CustomerMatchesPage />} />
            <Route path="/projects/:projectId/proposals" element={<CustomerProposalsPage />} />
            <Route path="/experts" element={<ExpertDirectoryPage />} />
            <Route path="/experts/:developerId" element={<ExpertDetailPage />} />
            <Route
              path="/quotes"
              element={
                <RequireAuth>
                  <UserQuotesPage />
                </RequireAuth>
              }
            />
            <Route
              path="/mypage"
              element={
                <RequireAuth>
                  <MyPage />
                </RequireAuth>
              }
            />
            <Route
              path="/chat"
              element={
                <RequireAuth>
                  <ChatPage />
                </RequireAuth>
              }
            />
            <Route
              path="/chat/:roomId"
              element={
                <RequireAuth>
                  <ChatPage />
                </RequireAuth>
              }
            />
            {/* Legacy alias kept so older links still resolve into the unified my page flow. */}
            <Route path="/developers/workspace" element={<Navigate to="/mypage" replace />} />
            <Route
              path="/admin"
              element={
                <RequireAdmin>
                  <AdminPage />
                </RequireAdmin>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <Footer />
        <Analytics />
      </div>
    </BrowserRouter>
  );
}
