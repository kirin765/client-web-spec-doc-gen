// LandingPage — 히어로, 특징, 프로세스, CTA 섹션으로 구성된 메인 페이지.

import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuoteStore } from '@/store/useQuoteStore';
import {
  Zap,
  FileText,
  DollarSign,
  CheckCircle,
  ArrowRight,
  Users,
  Shield,
  Clock,
} from 'lucide-react';
import { Seo } from '@/components/seo/Seo';
import { getSiteOrigin } from '@/lib/site';
import { useAuthStore } from '@/store/useAuthStore';
import { ModeToggle } from '@/components/mode/ModeToggle';

const FEATURES = [
  {
    icon: Zap,
    titleKey: 'landing.feature1Title',
    descKey: 'landing.feature1Desc',
  },
  {
    icon: FileText,
    titleKey: 'landing.feature2Title',
    descKey: 'landing.feature2Desc',
  },
  {
    icon: DollarSign,
    titleKey: 'landing.feature3Title',
    descKey: 'landing.feature3Desc',
  },
] as const;

const TRUST_POINTS = [
  {
    icon: Shield,
    title: '검증된 전문가',
    desc: '포트폴리오와 이력이 검증된 전문가들과 연결됩니다. 검증되지 않은 업체에 대한 걱정 없이 진행하세요.',
  },
  {
    icon: FileText,
    title: 'AI 생성 명세서',
    desc: '입력한 요구사항을 바탕으로 전문적인 프로젝트 명세서를 자동으로 작성해 드립니다.',
  },
  {
    icon: Users,
    title: '투명한 비용 공개',
    desc: '항목별 비용이 투명하게 공개됩니다. 숨겨진 비용 없이 예산을 계획할 수 있습니다.',
  },
] as const;

const STATS = [
  { value: '1,200+', label: '생성된 견적서' },
  { value: '500+', label: '검증된 전문가' },
  { value: '4.8점', label: '평균 만족도' },
] as const;

export function LandingPage() {
  const { t } = useTranslation('common');
  const navigate = useNavigate();
  const { resetQuote } = useQuoteStore();
  const user = useAuthStore((state) => state.user);
  const activeMode = useAuthStore((state) => state.activeMode);
  const setActiveMode = useAuthStore((state) => state.setActiveMode);
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
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'KRW' },
  };

  const handleStartQuote = () => {
    if (activeMode === 'expert') {
      navigate('/mypage');
      return;
    }
    resetQuote();
    navigate('/wizard');
  };

  const isExpert = activeMode === 'expert';

  const heroTitle = isExpert
    ? '전문가 모드에서 프로필과 포트폴리오를 관리하세요'
    : t('landing.heroTitle');
  const heroSubtitle = isExpert
    ? '받은 견적을 진행하고 완료 처리한 뒤, 고객 리뷰까지 한 흐름으로 관리할 수 있습니다.'
    : t('landing.heroSubtitle');
  const ctaLabel = isExpert
    ? user?.hasExpertProfile
      ? '전문가 마이페이지 열기'
      : '전문가 프로필 작성'
    : t('landing.cta');

  return (
    <div className="min-h-screen bg-white">
      <Seo
        title="웹사이트 견적 자동 생성기 | 프로젝트 의뢰·비용 계산·전문가 매칭"
        description="프로젝트 의뢰를 생성하고 요구사항 문서와 예상 비용을 확인한 뒤, 전문가 매칭과 제안 비교까지 빠르게 진행하세요."
      />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />

      {/* ── 히어로 섹션 ── */}
      <section className="relative overflow-hidden bg-navy-950 px-6 py-24 sm:py-36">
        {/* 배경 그라디언트 오버레이 */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(59,130,246,0.15),transparent)]" />

        <div className="relative mx-auto max-w-4xl text-center">
          <div className="mb-8 flex justify-center">
            <ModeToggle value={activeMode} onChange={setActiveMode} />
          </div>

          <h1 className="text-5xl font-bold tracking-tight text-white sm:text-6xl lg:text-7xl">
            {isExpert ? (
              heroTitle
            ) : (
              <>
                웹 프로젝트 견적,{' '}
                <span className="text-primary-400">5분</span>이면
                <br className="hidden sm:block" /> 충분합니다
              </>
            )}
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg text-secondary-400 sm:text-xl">
            {heroSubtitle}
          </p>

          {/* 신뢰 배지 */}
          {!isExpert && (
            <div className="mt-8 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-secondary-500">
              {(['무료 이용', '5분 완성', 'PDF 즉시 다운로드', '전문가 매칭'] as const).map((badge) => (
                <span key={badge} className="flex items-center gap-1.5">
                  <CheckCircle className="h-3.5 w-3.5 text-primary-400" />
                  {badge}
                </span>
              ))}
            </div>
          )}

          {/* CTA 버튼 */}
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <button
              onClick={handleStartQuote}
              className="w-full rounded-xl bg-primary-500 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-primary-500/20 transition-all hover:bg-primary-400 hover:shadow-primary-400/30 sm:w-auto"
            >
              {ctaLabel}
            </button>
            {!isExpert && (
              <button
                onClick={() => setActiveMode('expert')}
                className="w-full rounded-xl border border-white/15 px-8 py-4 text-base font-semibold text-white/70 transition-all hover:border-white/25 hover:bg-white/8 hover:text-white sm:w-auto"
              >
                전문가로 참여하기 →
              </button>
            )}
          </div>

          {user && (
            <p className="mt-6 text-sm text-secondary-600">
              현재 모드: {isExpert ? '전문가' : '고객'}
            </p>
          )}
        </div>
      </section>

      {/* ── 통계 섹션 ── */}
      <section className="border-b border-secondary-200 bg-white px-6 py-12">
        <div className="mx-auto max-w-3xl">
          <div className="grid grid-cols-1 divide-y divide-secondary-200 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
            {STATS.map(({ value, label }) => (
              <div key={label} className="px-8 py-6 text-center">
                <p className="text-4xl font-bold text-secondary-900">{value}</p>
                <p className="mt-1 text-secondary-500">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 특징 섹션 ── */}
      <section className="px-6 py-20 sm:py-28">
        <div className="mx-auto max-w-6xl">
          <div className="mb-14 text-center">
            <h2 className="text-heading-lg font-bold text-secondary-900 sm:text-heading-xl">
              이런 분들에게 필요합니다
            </h2>
            <p className="mt-4 text-body-md text-secondary-500">
              개발 경험 없이도 전문적인 프로젝트 문서를 만들 수 있습니다
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {FEATURES.map(({ icon: Icon, titleKey, descKey }) => (
              <div
                key={titleKey}
                className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-secondary-900/5 transition-shadow hover:shadow-md"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50">
                  <Icon className="h-6 w-6 text-primary-600" />
                </div>
                <h3 className="mt-5 text-body-md font-semibold text-secondary-900">{t(titleKey)}</h3>
                <p className="mt-2 leading-relaxed text-secondary-500">{t(descKey)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 프로세스 섹션 ── */}
      <section className="bg-secondary-50 px-6 py-20 sm:py-28">
        <div className="mx-auto max-w-5xl">
          <div className="mb-14 text-center">
            <h2 className="text-heading-lg font-bold text-secondary-900 sm:text-heading-xl">
              {t('landing.processTitle')}
            </h2>
          </div>

          <div className="grid items-start gap-8 md:grid-cols-[1fr,2.5rem,1fr,2.5rem,1fr]">
            {/* Step 1 */}
            <div className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary-900 text-lg font-bold text-white shadow-lg">
                1
              </div>
              <h3 className="mt-5 text-body-md font-semibold text-secondary-900">{t('landing.step1Title')}</h3>
              <p className="mt-2 text-secondary-500">{t('landing.step1Desc')}</p>
            </div>

            {/* 화살표 */}
            <div className="hidden items-center justify-center pt-4 md:flex">
              <ArrowRight className="h-6 w-6 text-secondary-300" />
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary-900 text-lg font-bold text-white shadow-lg">
                2
              </div>
              <h3 className="mt-5 text-body-md font-semibold text-secondary-900">{t('landing.step2Title')}</h3>
              <p className="mt-2 text-secondary-500">{t('landing.step2Desc')}</p>
            </div>

            {/* 화살표 */}
            <div className="hidden items-center justify-center pt-4 md:flex">
              <ArrowRight className="h-6 w-6 text-secondary-300" />
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary-900 text-lg font-bold text-white shadow-lg">
                3
              </div>
              <h3 className="mt-5 text-body-md font-semibold text-secondary-900">{t('landing.step3Title')}</h3>
              <p className="mt-2 text-secondary-500">{t('landing.step3Desc')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 신뢰 포인트 섹션 (Dark) ── */}
      <section className="bg-navy-950 px-6 py-20 sm:py-28">
        <div className="mx-auto max-w-6xl">
          <div className="mb-14 text-center">
            <h2 className="text-heading-lg font-bold text-white sm:text-heading-xl">왜 저희 서비스인가요?</h2>
            <p className="mt-4 text-body-md text-secondary-400">수백 명의 사업주가 선택한 이유</p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {TRUST_POINTS.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="rounded-2xl border border-white/8 bg-white/5 p-8 backdrop-blur-sm"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-500/20">
                  <Icon className="h-6 w-6 text-primary-400" />
                </div>
                <h3 className="mt-5 text-body-md font-semibold text-white">{title}</h3>
                <p className="mt-2 leading-relaxed text-secondary-400">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 하단 CTA ── */}
      <section className="bg-white px-6 py-20 sm:py-28">
        <div className="mx-auto max-w-3xl">
          <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-secondary-900 to-navy-950 p-12 text-center shadow-2xl">
            <div className="mb-4 flex justify-center">
              <Clock className="h-8 w-8 text-primary-400" />
            </div>
            <h2 className="text-heading-lg font-bold text-white sm:text-heading-xl">
              {t('landing.ctaTitle')}
            </h2>
            <p className="mt-4 text-body-md text-secondary-400">{t('landing.ctaSubtitle')}</p>
            <button
              onClick={handleStartQuote}
              className="mt-8 inline-flex items-center gap-2 rounded-xl bg-primary-500 px-8 py-4 font-semibold text-white shadow-lg shadow-primary-500/25 transition-all hover:bg-primary-400"
            >
              <CheckCircle className="h-5 w-5" />
              {ctaLabel}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

