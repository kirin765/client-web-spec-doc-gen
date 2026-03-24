// App — BrowserRouter 라우팅. / → Landing, /wizard → Wizard, /result → Result, * → 리다이렉트.

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { LandingPage } from '@/pages/LandingPage';
import { WizardPage } from '@/pages/WizardPage';
import { ResultPage } from '@/pages/ResultPage';
import { CustomerMatchesPage } from '@/pages/CustomerMatchesPage';
import { CustomerProposalsPage } from '@/pages/CustomerProposalsPage';
import { DeveloperWorkspacePage } from '@/pages/DeveloperWorkspacePage';
import { AdminPage } from '@/pages/AdminPage';

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
            <Route path="/projects/:projectId/matches" element={<CustomerMatchesPage />} />
            <Route path="/projects/:projectId/proposals" element={<CustomerProposalsPage />} />
            <Route path="/developers/workspace" element={<DeveloperWorkspacePage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}
