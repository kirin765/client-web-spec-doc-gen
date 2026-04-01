// Footer — 페이지 하단 저작권 및 면책 조항.

import { Zap } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export function Footer() {
  const { t } = useTranslation('common');

  return (
    <footer className="border-t border-secondary-700 bg-secondary-900">
      <div className="container-base py-12">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary-400" />
            <span className="text-body-sm font-semibold text-white">{t('app.title')}</span>
          </div>
          <p className="text-body-sm text-secondary-400">{t('footer.copyright')}</p>
          <p className="text-body-xs text-secondary-500">{t('footer.disclaimer')}</p>
        </div>
      </div>
    </footer>
  );
}
