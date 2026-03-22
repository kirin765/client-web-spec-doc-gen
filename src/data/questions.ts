// =============================================================================
// 질문 플로우 정의 — 6단계 위저드의 전체 질문/옵션/가격영향도
// =============================================================================
//
// TODO 구현 사항:
// 1. QuestionCategory[] 배열을 export — 위저드 각 스텝에 1:1 매핑
// 2. 각 Question에 pricingImpact를 정확히 연결 (pricing.ts 상수 참조)
// 3. conditionalOn 필드로 조건부 질문 처리 (예: 쇼핑몰 선택 시 이커머스 기능 표시)
//
// 카테고리 구성:
// - basics      : 프로젝트 기본 정보 (사이트 유형, 프로젝트명, 타겟 고객)
// - scale       : 규모 및 페이지 (예상 페이지 수, 필요 페이지 목록)
// - features    : 기능 요구사항 (핵심 기능 다중선택, 이커머스 조건부 기능)
// - design      : 디자인 (복잡도, 반응형 대상, 스타일 방향)
// - integration : 콘텐츠 및 연동 (콘텐츠 제공 방식, 외부 서비스, 호스팅)
// - timeline    : 일정 및 예산 (희망 일정, 예산 인지 범위, 추가 메모)
// =============================================================================

import type { QuestionCategory } from '@/types';

export const questionCategories: QuestionCategory[] = [
  // ---------------------------------------------------------------------------
  // Step 1: 프로젝트 기본 정보
  // ---------------------------------------------------------------------------
  {
    id: 'basics',
    labelKey: 'steps.basics',
    icon: 'FileText',
    questions: [
      // TODO: 사이트 유형 single-select
      //   옵션: landing, brochure, ecommerce, webapp, blog
      //   각 옵션의 pricingImpact.type = 'base' → baseTiers에서 해당 tier 선택
      // TODO: 프로젝트명 text-input (required)
      // TODO: 타겟 고객 text-input (optional)
    ],
  },

  // ---------------------------------------------------------------------------
  // Step 2: 규모 및 페이지
  // ---------------------------------------------------------------------------
  {
    id: 'scale',
    labelKey: 'steps.scale',
    icon: 'Layers',
    questions: [
      // TODO: 예상 페이지 수 range-slider (min: 1, max: 50)
      //   pricingImpact: 기본 tier 페이지 수 초과분 × 페이지당 추가 비용
      // TODO: 필요 페이지 multi-select
      //   옵션: home, about, services, portfolio, contact, blog,
      //         productList, productDetail, cart, checkout,
      //         dashboard, faq, login
      //   pricingImpact: 각 페이지 유형별 add 비용 없음 (페이지 수로 이미 반영)
    ],
  },

  // ---------------------------------------------------------------------------
  // Step 3: 기능 요구사항
  // ---------------------------------------------------------------------------
  {
    id: 'features',
    labelKey: 'steps.features',
    icon: 'Puzzle',
    questions: [
      // TODO: 핵심 기능 multi-select
      //   옵션 + 각각의 add 비용:
      //   - contactForm: 0원 (기본 포함)
      //   - search: 500,000 ~ 1,000,000
      //   - auth: 1,000,000 ~ 2,000,000
      //   - payment: 2,000,000 ~ 4,000,000
      //   - adminPanel: 2,000,000 ~ 5,000,000
      //   - fileUpload: 500,000 ~ 1,000,000
      //   - chat: 1,500,000 ~ 3,000,000
      //   - socialIntegration: 300,000 ~ 500,000
      //   - multiLanguage: 1,000,000 ~ 2,000,000
      //   - analyticsDashboard: 1,000,000 ~ 2,000,000
      //   - booking: 2,000,000 ~ 4,000,000
      //   - mapIntegration: 300,000 ~ 500,000

      // TODO: 이커머스 전용 기능 multi-select (conditionalOn: siteType === 'ecommerce')
      //   옵션:
      //   - productManagement: 1,000,000 ~ 2,000,000
      //   - inventory: 1,000,000 ~ 2,000,000
      //   - orderTracking: 1,000,000 ~ 2,000,000
      //   - couponSystem: 500,000 ~ 1,000,000
      //   - reviewSystem: 500,000 ~ 1,000,000
    ],
  },

  // ---------------------------------------------------------------------------
  // Step 4: 디자인
  // ---------------------------------------------------------------------------
  {
    id: 'design',
    labelKey: 'steps.design',
    icon: 'Palette',
    questions: [
      // TODO: 디자인 복잡도 single-select
      //   옵션 + pricingImpact.type = 'multiply':
      //   - template: 1.0
      //   - custom: 1.3
      //   - premium: 1.6

      // TODO: 반응형 대상 multi-select
      //   옵션: mobile, tablet, desktop (비용 영향 없음, 명세서용)

      // TODO: 디자인 스타일 single-select
      //   옵션: minimal, corporate, creative, luxury (비용 영향 없음, 명세서용)
    ],
  },

  // ---------------------------------------------------------------------------
  // Step 5: 콘텐츠 및 연동
  // ---------------------------------------------------------------------------
  {
    id: 'integration',
    labelKey: 'steps.integration',
    icon: 'Link',
    questions: [
      // TODO: 콘텐츠 제공 방식 single-select
      //   옵션:
      //   - clientProvides: 0
      //   - needCopywriting: 1,000,000 ~ 3,000,000 (add)
      //   - needMediaProduction: 2,000,000 ~ 5,000,000 (add)

      // TODO: 외부 서비스 연동 multi-select
      //   옵션: googleAnalytics, metaPixel, kakaoPay, tossPay,
      //         naverPay, crmIntegration, externalApi
      //   각 300,000 ~ 500,000 (add)

      // TODO: 호스팅 single-select
      //   옵션: agencyManaged, selfHosted, cloud (비용 영향 없음, 명세서용)
    ],
  },

  // ---------------------------------------------------------------------------
  // Step 6: 일정 및 예산
  // ---------------------------------------------------------------------------
  {
    id: 'timeline',
    labelKey: 'steps.timeline',
    icon: 'Clock',
    questions: [
      // TODO: 희망 일정 single-select
      //   옵션 + pricingImpact.type = 'multiply':
      //   - flexible: 1.0  (8주+)
      //   - standard: 1.0  (4-8주)
      //   - urgent: 1.3    (2-4주)
      //   - rush: 1.6      (<2주)

      // TODO: 예산 인지 범위 single-select (비용 영향 없음, 참고용)
      //   옵션: under500, range500to1000, range1000to3000, over3000, notSure

      // TODO: 추가 메모 text-input (optional)
    ],
  },
];
