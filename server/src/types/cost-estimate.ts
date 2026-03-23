// 서버 타입: BaseTier, CostBreakdownItem, CostEstimate.

/** 사이트 유형별 기본 단가 */
export interface BaseTier {
  id: string;
  labelKey: string;
  minCost: number;
  maxCost: number;
}

/** 비용 분해 항목 */
export interface CostBreakdownItem {
  category: string;
  label: string;
  minAmount: number;
  maxAmount: number;
}

/** 최종 비용 견적 결과 */
export interface CostEstimate {
  baseTier: BaseTier;
  featureAdditions: CostBreakdownItem[];
  designMultiplier: number;
  timelineMultiplier: number;
  totalMin: number;
  totalMax: number;
  breakdown: CostBreakdownItem[];
  // pricingVersion?: string;   // 적용된 가격 규칙 버전
  // assumptions?: string[];    // 계산 가정 사항 (예: "기본 페이지 수 5개 기준")
  // calculatedAt?: string;     // 계산 시점 ISO 날짜
}
