// LandingPage — 히어로, 특징, 프로세스, CTA 섹션으로 구성된 메인 페이지.

import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuoteStore } from '@/store/useQuoteStore';
import { Zap, FileText, DollarSign, CheckCircle } from 'lucide-react';
import { Seo } from '@/components/seo/Seo';
import { getSiteOrigin } from '@/lib/site';

export function LandingPage() {
  const { t } = useTranslation('common');
  const navigate = useNavigate();
  const { resetQuote } = useQuoteStore();
  const siteOrigin = getSiteOrigin();

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: '웹사이트 견적 자동 생성기',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    description:
      '프로젝트 의뢰를 생성하고 요구사항 문서와 예상 비용을 확인한 뒤, 전문가 매칭과 제안 비교까지 빠르게 진행할 수 있는 웹 애플리케이션입니다.',
    url: `${siteOrigin}/`,
    image: `${siteOrigin}/og-image.svg`,
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'KRW',
    },
  };

  const handleStartQuote = () => {
    resetQuote();
    navigate('/wizard');
  };

  return (
    <div className="min-h-screen bg-white">
      <Seo
        title="웹사이트 견적 자동 생성기 | 프로젝트 의뢰·비용 계산·전문가 매칭"
        description="프로젝트 의뢰를 생성하고 요구사항 문서와 예상 비용을 확인한 뒤, 전문가 매칭과 제안 비교까지 빠르게 진행하세요."
      />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      {/* 히어로 섹션 */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-blue-50 px-6 py-20 sm:py-32">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-5xl font-bold tracking-tight text-gray-900 sm:text-6xl">
            {t('landing.heroTitle')}
          </h1>
          <p className="mt-6 text-xl text-gray-600">{t('landing.heroSubtitle')}</p>
          <button
            onClick={handleStartQuote}
            className="mt-8 inline-block rounded-lg bg-blue-600 px-8 py-4 font-semibold text-white transition-colors hover:bg-blue-700"
          >
            {t('landing.cta')}
          </button>
        </div>
      </section>

      {/* 특징 섹션 */}
      <section className="px-6 py-16 sm:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-8 md:grid-cols-3">
            {/* 특징 1 */}
            <div className="rounded-lg border border-gray-200 p-6">
              <Zap className="h-10 w-10 text-blue-600" />
              <h3 className="mt-4 text-lg font-bold text-gray-900">{t('landing.feature1Title')}</h3>
              <p className="mt-2 text-gray-600">{t('landing.feature1Desc')}</p>
            </div>

            {/* 특징 2 */}
            <div className="rounded-lg border border-gray-200 p-6">
              <FileText className="h-10 w-10 text-blue-600" />
              <h3 className="mt-4 text-lg font-bold text-gray-900">{t('landing.feature2Title')}</h3>
              <p className="mt-2 text-gray-600">{t('landing.feature2Desc')}</p>
            </div>

            {/* 특징 3 */}
            <div className="rounded-lg border border-gray-200 p-6">
              <DollarSign className="h-10 w-10 text-blue-600" />
              <h3 className="mt-4 text-lg font-bold text-gray-900">{t('landing.feature3Title')}</h3>
              <p className="mt-2 text-gray-600">{t('landing.feature3Desc')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* 프로세스 섹션 */}
      <section className="bg-gray-50 px-6 py-16 sm:py-24">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-center text-3xl font-bold text-gray-900">이렇게 진행됩니다</h2>

          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {/* Step 1 */}
            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-white font-bold">
                1
              </div>
              <h3 className="mt-4 text-lg font-bold text-gray-900">질문에 답하기</h3>
              <p className="mt-2 text-gray-600">6단계 위저드에서 프로젝트 정보를 입력합니다</p>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-white font-bold">
                2
              </div>
              <h3 className="mt-4 text-lg font-bold text-gray-900">명세서 확인</h3>
              <p className="mt-2 text-gray-600">자동 생성된 요구사항 명세서를 검토합니다</p>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-white font-bold">
                3
              </div>
              <h3 className="mt-4 text-lg font-bold text-gray-900">견적서 다운로드</h3>
              <p className="mt-2 text-gray-600">PDF로 저장하여 언제든 확인하고 공유합니다</p>
            </div>
          </div>
        </div>
      </section>

      {/* 하단 CTA */}
      <section className="px-6 py-16 sm:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold text-gray-900">지금 바로 시작하세요</h2>
          <p className="mt-4 text-lg text-gray-600">
            5분이면 맞춤형 웹사이트 견적을 받을 수 있습니다
          </p>
          <button
            onClick={handleStartQuote}
            className="mt-8 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-8 py-4 font-semibold text-white transition-colors hover:bg-blue-700"
          >
            <CheckCircle className="h-5 w-5" />
            {t('landing.cta')}
          </button>
        </div>
      </section>
    </div>
  );
}
