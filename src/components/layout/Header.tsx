// Header — 상단 네비게이션 바 (로고, 제목, 새 견적 버튼).

import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuoteStore } from '@/store/useQuoteStore';
import { useAuthStore } from '@/store/useAuthStore';
import { AuthControls } from '@/components/auth/AuthControls';
import { Zap } from 'lucide-react';
import { ModeToggle } from '@/components/mode/ModeToggle';

export function Header() {
  const { t } = useTranslation('common');
  const navigate = useNavigate();
  const { resetQuote } = useQuoteStore();
  const user = useAuthStore((state) => state.user);
  const activeMode = useAuthStore((state) => state.activeMode);
  const setActiveMode = useAuthStore((state) => state.setActiveMode);

  const handleNewQuote = () => {
    if (activeMode === 'expert') {
      navigate('/mypage');
      return;
    }

    resetQuote();
    navigate('/wizard');
  };

  return (
    <header className="sticky top-0 z-40 border-b bg-white/95 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-6 py-4">
        <div className="flex items-center justify-between">
          {/* 로고 + 제목 */}
          <Link to="/" className="flex items-center gap-2">
            <Zap className="h-6 w-6 text-blue-600" />
            <h1 className="hidden text-lg font-bold text-gray-900 sm:inline">
              {t('app.title')}
            </h1>
            <h1 className="inline text-lg font-bold text-gray-900 sm:hidden">견적생성</h1>
          </Link>

          <div className="flex items-center gap-3">
            <nav className="hidden items-center gap-4 text-sm font-medium text-gray-600 md:flex">
              <Link to="/experts" className="hover:text-gray-900">
                전문가 목록
              </Link>
              {user ? (
                <Link to="/quotes" className="hover:text-gray-900">
                  내 견적서
                </Link>
              ) : null}
              {user ? (
                <Link to="/mypage" className="hover:text-gray-900">
                  {activeMode === 'expert' ? '전문가 마이페이지' : '고객 마이페이지'}
                </Link>
              ) : null}
              {user?.role === 'admin' ? (
                <Link to="/admin" className="hover:text-gray-900">
                  관리자
                </Link>
              ) : null}
            </nav>
            {user ? (
              <ModeToggle
                value={activeMode}
                onChange={setActiveMode}
                className="hidden lg:inline-flex"
              />
            ) : null}
            <button
              onClick={handleNewQuote}
              className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700"
            >
              {activeMode === 'expert' ? '마이페이지' : t('nav.newQuote')}
            </button>
            <AuthControls />
          </div>
        </div>
        {user ? (
          <div className="mt-3 lg:hidden">
            <ModeToggle value={activeMode} onChange={setActiveMode} />
          </div>
        ) : null}
      </div>
    </header>
  );
}
