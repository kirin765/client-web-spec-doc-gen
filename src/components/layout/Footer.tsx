// Footer — 페이지 하단 저작권 및 면책 조항.

import { useTranslation } from 'react-i18next';

export function Footer() {
  const { t } = useTranslation('common');

  return (
    <footer className="border-t bg-gray-50">
      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="space-y-3 text-center">
          <p className="text-sm text-gray-600">{t('footer.copyright')}</p>
          <p className="text-xs text-gray-500">{t('footer.disclaimer')}</p>
        </div>
      </div>
    </footer>
  );
}
