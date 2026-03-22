// =============================================================================
// Footer 컴포넌트 — 페이지 하단 푸터
// =============================================================================
//
// TODO 구현 사항:
// 1. 저작권 표시 ("© 2026 웹사이트 견적 생성기")
// 2. 면책 조항: "본 견적은 자동 생성된 예상 금액이며, 실제 비용은 상담 후 확정됩니다."
// 3. 간결한 디자인, border-top으로 구분
// =============================================================================

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
