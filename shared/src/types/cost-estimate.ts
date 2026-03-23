// 비용 산정 타입: BaseTier, CostBreakdownItem, CostEstimate.

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
}
