// 견적 규칙 버전 관리 타입: BaseTierRule, FeatureCostRule, PricingRuleSet, PricingRuleVersion.

/** 기본 단가 규칙 */
export interface BaseTierRule {
  id: string;
  labelKey: string;
  minCost: number;
  maxCost: number;
  defaultPageCount: number;
}

/** 기능별 추가 비용 규칙 */
export interface FeatureCostRule {
  featureId: string;
  min: number;
  max: number;
}

/** 견적 규칙 세트 */
export interface PricingRuleSet {
  baseTiers: BaseTierRule[];
  featureCosts: Record<string, { min: number; max: number }>;
  designMultipliers: Record<string, number>;
  timelineMultipliers: Record<string, number>;
  perPageCost: { min: number; max: number };
  contentCosts: Record<string, { min: number; max: number }>;
  integrationCosts: Record<string, { min: number; max: number }>;
}

/** 견적 규칙 버전 엔티티 */
export interface PricingRuleVersion {
  id: string;
  version: string;        // 예: "v1.0.0"
  rules: PricingRuleSet;
  effectiveFrom: string;  // ISO datetime
  createdAt: string;
  createdBy?: string;     // admin userId
}
