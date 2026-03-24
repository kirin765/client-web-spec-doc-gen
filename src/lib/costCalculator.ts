// costCalculator — 순수 함수: answers → CostEstimate.
// baseTier 선택, 추가 페이지, 기능/콘텐츠/연동 비용 합산, 디자인·일정 승수 적용.
// breakdown 라벨은 featureLabels/contentLabels/integrationLabels 맵으로 한글 직접 매핑.

import type { Answers, CostEstimate, CostBreakdownItem } from '@/types';
import {
  getPricingConfig,
} from '@/data/pricing';

const featureLabels: Record<string, string> = {
  contactForm: '문의 폼',
  search: '검색 기능',
  auth: '회원 인증',
  payment: '결제 기능',
  adminPanel: '관리자 패널',
  fileUpload: '파일 업로드',
  chat: '실시간 채팅',
  socialIntegration: '소셜 연동',
  multiLanguage: '다국어 지원',
  analyticsDashboard: '분석 대시보드',
  booking: '예약 기능',
  mapIntegration: '지도 연동',
  productManagement: '상품 관리',
  inventory: '재고 관리',
  orderTracking: '주문 추적',
  couponSystem: '쿠폰 시스템',
  reviewSystem: '리뷰 시스템',
};

const contentLabels: Record<string, string> = {
  clientProvides: '클라이언트 제공',
  needCopywriting: '카피라이팅 필요',
  needMediaProduction: '미디어 제작 필요',
};

const integrationLabels: Record<string, string> = {
  googleAnalytics: 'Google Analytics',
  metaPixel: 'Meta Pixel',
  kakaoPay: '카카오페이',
  tossPay: '토스페이',
  naverPay: '네이버페이',
  crmIntegration: 'CRM 연동',
  externalApi: '외부 API',
};

export function calculateCost(answers: Answers): CostEstimate {
  const {
    baseTiers,
    featureCosts,
    designMultipliers,
    timelineMultipliers,
    perPageCost,
    contentCosts,
    integrationCosts,
  } = getPricingConfig();

  // 1. 사이트 유형에서 기본 단가 선택
  const siteTypeId = answers.siteType as string;
  const baseTierIndex = baseTiers.findIndex((t) => t.id === siteTypeId);
  const baseTier = baseTierIndex >= 0 ? baseTiers[baseTierIndex] : baseTiers[0];

  let subtotalMin = baseTier.minCost;
  let subtotalMax = baseTier.maxCost;

  const breakdown: CostBreakdownItem[] = [
    {
      category: '기본',
      label: `${baseTier.labelKey}`,
      minAmount: baseTier.minCost,
      maxAmount: baseTier.maxCost,
    },
  ];

  // 2. 추가 페이지 비용 계산
  const expectedPages = answers.expectedPages as number | undefined;
  const defaultPageCount = (perPageCost.defaultPages as Record<string, number>)[siteTypeId] || 5;
  if (expectedPages && expectedPages > defaultPageCount) {
    const excessPages = expectedPages - defaultPageCount;
    const pageAddMin = excessPages * perPageCost.min;
    const pageAddMax = excessPages * perPageCost.max;
    subtotalMin += pageAddMin;
    subtotalMax += pageAddMax;
    breakdown.push({
      category: '규모',
      label: `추가 페이지 (${excessPages}개)`,
      minAmount: pageAddMin,
      maxAmount: pageAddMax,
    });
  }

  // 3. 기능 추가 비용
  const coreFeatures = answers.coreFeatures as string[] | undefined;
  if (coreFeatures) {
    for (const featureId of coreFeatures) {
      const cost = featureCosts[featureId];
      if (cost) {
        subtotalMin += cost.min;
        subtotalMax += cost.max;
        breakdown.push({
          category: '기능',
          label: featureLabels[featureId] || featureId,
          minAmount: cost.min,
          maxAmount: cost.max,
        });
      }
    }
  }

  // 4. 이커머스 전용 기능 (조건부)
  const ecommerceFeatures = answers.ecommerceFeatures as string[] | undefined;
  if (ecommerceFeatures && siteTypeId === 'ecommerce') {
    for (const featureId of ecommerceFeatures) {
      const cost = featureCosts[featureId];
      if (cost) {
        subtotalMin += cost.min;
        subtotalMax += cost.max;
        breakdown.push({
          category: '기능',
          label: featureLabels[featureId] || featureId,
          minAmount: cost.min,
          maxAmount: cost.max,
        });
      }
    }
  }

  // 5. 콘텐츠 제공 방식
  const contentDelivery = answers.contentDelivery as string | undefined;
  if (contentDelivery) {
    const cost = contentCosts[contentDelivery];
    if (cost) {
      subtotalMin += cost.min;
      subtotalMax += cost.max;
      breakdown.push({
        category: '콘텐츠',
        label: contentLabels[contentDelivery] || contentDelivery,
        minAmount: cost.min,
        maxAmount: cost.max,
      });
    }
  }

  // 6. 외부 서비스 연동
  const externalIntegrations = answers.externalIntegrations as string[] | undefined;
  if (externalIntegrations) {
    for (const integrationId of externalIntegrations) {
      const cost = integrationCosts[integrationId];
      if (cost) {
        subtotalMin += cost.min;
        subtotalMax += cost.max;
        breakdown.push({
          category: '연동',
          label: integrationLabels[integrationId] || integrationId,
          minAmount: cost.min,
          maxAmount: cost.max,
        });
      }
    }
  }

  // 7. 디자인 복잡도 승수
  const designComplexity = answers.designComplexity as string | undefined;
  const designMultiplier = designComplexity ? designMultipliers[designComplexity] ?? 1.0 : 1.0;

  // 8. 일정 승수
  const desiredTimeline = answers.desiredTimeline as string | undefined;
  const timelineMultiplier = desiredTimeline ? timelineMultipliers[desiredTimeline] ?? 1.0 : 1.0;

  // 9. 최종 계산: 승수 적용
  const totalMin = Math.floor((subtotalMin * designMultiplier * timelineMultiplier) / 100_000) * 100_000;
  const totalMax = Math.ceil((subtotalMax * designMultiplier * timelineMultiplier) / 100_000) * 100_000;

  return {
    baseTier,
    featureAdditions: breakdown.filter((b) => b.category === '기능'),
    designMultiplier,
    timelineMultiplier,
    totalMin,
    totalMax,
    breakdown,
  };
}
