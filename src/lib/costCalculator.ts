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

import type { Answers, CostEstimate } from '@/types';

export function calculateCost(_answers: Answers): CostEstimate {
  // TODO: 위 흐름대로 구현
  // 참조할 데이터: baseTiers, featureCosts, designMultipliers,
  //              timelineMultipliers, perPageCost, contentCosts, integrationCosts
  //              (모두 @/data/pricing에서 import)

  return {
    baseTier: { id: '', labelKey: '', minCost: 0, maxCost: 0 },
    featureAdditions: [],
    designMultiplier: 1,
    timelineMultiplier: 1,
    totalMin: 0,
    totalMax: 0,
    breakdown: [],
  };
}
