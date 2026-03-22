// =============================================================================
// 비용 계산기 — 순수 함수: answers → CostEstimate
// =============================================================================
//
// TODO 구현 사항:
// 이 파일의 핵심은 calculateCost() 순수 함수.
// 입력: Answers (사용자 답변 맵)
// 출력: CostEstimate (비용 범위 + 항목별 분해)
//
// 계산 흐름:
// 1. answers.siteType으로 baseTiers에서 기본 단가 선택
//    → breakdown에 "기본" 카테고리로 추가
//
// 2. answers.pageCount에서 해당 tier 기본 페이지 수 초과분 계산
//    → 초과 페이지 × perPageCost를 breakdown "규모"에 추가
//
// 3. answers.features (string[])를 순회하며 featureCosts 합산
//    → 각 기능을 breakdown "기능"에 추가
//
// 4. answers.ecommerceFeatures (조건부, string[]) 동일 처리
//
// 5. answers.contentProvision에서 contentCosts 추가
//    → breakdown "콘텐츠"에 추가
//
// 6. answers.integrations (string[])를 순회하며 integrationCosts 합산
//    → breakdown "연동"에 추가
//
// 7. answers.designComplexity로 designMultipliers에서 승수 결정
//
// 8. answers.timeline으로 timelineMultipliers에서 승수 결정
//
// 9. 최종 계산:
//    subtotalMin = baseTier.minCost + sum(모든 add의 min)
//    subtotalMax = baseTier.maxCost + sum(모든 add의 max)
//    totalMin = floor(subtotalMin × designMultiplier × timelineMultiplier / 100_000) × 100_000
//    totalMax = ceil(subtotalMax × designMultiplier × timelineMultiplier / 100_000) × 100_000
//
// 10. CostEstimate 객체 조립하여 반환
// =============================================================================

import type { Answers, CostEstimate, CostBreakdownItem } from '@/types';
import {
  baseTiers,
  featureCosts,
  designMultipliers,
  timelineMultipliers,
  perPageCost,
  contentCosts,
  integrationCosts,
} from '@/data/pricing';

export function calculateCost(answers: Answers): CostEstimate {
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
          label: `questions.coreFeatures.options.${featureId}`,
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
          label: `questions.ecommerceFeatures.options.${featureId}`,
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
        label: `questions.contentDelivery.options.${contentDelivery}`,
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
          label: `questions.externalIntegrations.options.${integrationId}`,
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
