// Header — 상단 네비게이션 바 (로고, 제목, 새 견적 버튼).

import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuoteStore } from '@/store/useQuoteStore';
import { Zap } from 'lucide-react';

export function Header() {
  const { t } = useTranslation('common');
  const navigate = useNavigate();
  const { resetQuote } = useQuoteStore();

  const handleNewQuote = () => {
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

          {/* 우측 버튼 */}
          <button
            onClick={handleNewQuote}
            className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700"
          >
            {t('nav.newQuote')}
          </button>
        </div>
      </div>
    </header>
  );
}
