// Footer — 페이지 하단 저작권 및 면책 조항.

import { Zap } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export function Footer() {
  const { t } = useTranslation('common');

  return (
    <footer className="bg-navy-950">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-blue-400" />
            <span className="text-sm font-bold text-white">{t('app.title')}</span>
          </div>
          <p className="text-sm text-slate-400">{t('footer.copyright')}</p>
          <p className="text-xs text-slate-600">{t('footer.disclaimer')}</p>
        </div>
      </div>
    </footer>
  );
}
