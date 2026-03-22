// =============================================================================
// 가격 테이블 — 비용 산정에 사용되는 모든 상수
// =============================================================================
//
// TODO 구현 사항:
// 1. baseTiers: 사이트 유형별 기본 단가 (min/max KRW)
// 2. featureCosts: 기능별 추가 비용 맵
// 3. designMultipliers: 디자인 복잡도별 승수
// 4. timelineMultipliers: 일정별 승수
// 5. perPageCost: 추가 페이지당 비용
// 6. contentCosts: 콘텐츠 제공 방식별 비용
// 7. integrationCosts: 외부 연동 서비스별 비용
// =============================================================================

import type { BaseTier } from '@/types';

// -----------------------------------------------------------------------------
// 사이트 유형별 기본 단가
// -----------------------------------------------------------------------------
export const baseTiers: BaseTier[] = [
  { id: 'landing',   labelKey: 'pricing.tiers.landing',   minCost: 1_500_000, maxCost: 3_000_000  },
  { id: 'brochure',  labelKey: 'pricing.tiers.brochure',  minCost: 3_000_000, maxCost: 8_000_000  },
  { id: 'ecommerce', labelKey: 'pricing.tiers.ecommerce', minCost: 8_000_000, maxCost: 20_000_000 },
  { id: 'webapp',    labelKey: 'pricing.tiers.webapp',    minCost: 10_000_000, maxCost: 30_000_000 },
  { id: 'blog',      labelKey: 'pricing.tiers.blog',      minCost: 2_000_000, maxCost: 5_000_000  },
];

// -----------------------------------------------------------------------------
// 기능별 추가 비용: featureId → { min, max }
// -----------------------------------------------------------------------------
export const featureCosts: Record<string, { min: number; max: number }> = {
  contactForm: { min: 0, max: 0 },
  search: { min: 500_000, max: 1_000_000 },
  auth: { min: 1_000_000, max: 2_000_000 },
  payment: { min: 2_000_000, max: 4_000_000 },
  adminPanel: { min: 2_000_000, max: 5_000_000 },
  fileUpload: { min: 500_000, max: 1_000_000 },
  chat: { min: 1_500_000, max: 3_000_000 },
  socialIntegration: { min: 300_000, max: 500_000 },
  multiLanguage: { min: 1_000_000, max: 2_000_000 },
  analyticsDashboard: { min: 1_000_000, max: 2_000_000 },
  booking: { min: 2_000_000, max: 4_000_000 },
  mapIntegration: { min: 300_000, max: 500_000 },
  productManagement: { min: 1_000_000, max: 2_000_000 },
  inventory: { min: 1_000_000, max: 2_000_000 },
  orderTracking: { min: 1_000_000, max: 2_000_000 },
  couponSystem: { min: 500_000, max: 1_000_000 },
  reviewSystem: { min: 500_000, max: 1_000_000 },
};

// -----------------------------------------------------------------------------
// 디자인 복잡도 승수
// -----------------------------------------------------------------------------
export const designMultipliers: Record<string, number> = {
  template: 1.0,
  custom: 1.3,
  premium: 1.6,
};

// -----------------------------------------------------------------------------
// 일정 승수
// -----------------------------------------------------------------------------
export const timelineMultipliers: Record<string, number> = {
  flexible: 1.0,
  standard: 1.0,
  urgent: 1.3,
  rush: 1.6,
};

// -----------------------------------------------------------------------------
// 추가 페이지당 비용
// -----------------------------------------------------------------------------
export const perPageCost = {
  min: 200_000,
  max: 500_000,
  defaultPages: { landing: 3, brochure: 7, ecommerce: 15, webapp: 10, blog: 5 },
};

// -----------------------------------------------------------------------------
// 콘텐츠 제공 방식별 추가 비용
// -----------------------------------------------------------------------------
export const contentCosts: Record<string, { min: number; max: number }> = {
  clientProvides: { min: 0, max: 0 },
  needCopywriting: { min: 1_000_000, max: 3_000_000 },
  needMediaProduction: { min: 2_000_000, max: 5_000_000 },
};

// -----------------------------------------------------------------------------
// 외부 연동 서비스별 비용
// -----------------------------------------------------------------------------
export const integrationCosts: Record<string, { min: number; max: number }> = {
  googleAnalytics: { min: 300_000, max: 500_000 },
  metaPixel: { min: 300_000, max: 500_000 },
  kakaoPay: { min: 300_000, max: 500_000 },
  tossPay: { min: 300_000, max: 500_000 },
  naverPay: { min: 300_000, max: 500_000 },
  crmIntegration: { min: 300_000, max: 500_000 },
  externalApi: { min: 300_000, max: 500_000 },
};
