// [수정 필요 - C4] NormalizedSpec 필드 참조가 모두 잘못되어 데이터를 읽지 못함
// - normalizedSpec.siteType → normalizedSpec.projectType으로 변경
// - normalizedSpec.features → normalizedSpec.scope.featureSet으로 변경
// - normalizedSpec.design?.style → normalizedSpec.scope.designStyle으로 변경
// - normalizedSpec.timeline → normalizedSpec.delivery.urgency으로 변경
// - normalizedSpec.integrations → normalizedSpec.scope.integrations으로 변경
// - 파라미터 타입을 any에서 NormalizedSpec으로 변경하여 타입 안전성 확보

import type { CostEstimate, CostBreakdownItem, BaseTier } from '../../types/cost-estimate';
import type { PricingRuleSet } from '../../types/pricing-rule';
import type { NormalizedSpec } from '../../types/answers';

const SITE_TYPE_LABELS: Record<string, string> = {
  landing: '랜딩페이지',
  ecommerce: '이커머스',
  corporate: '기업 사이트',
  portal: '포탈/커뮤니티',
};

const COMPLEXITY_MULTIPLIERS: Record<string, number> = {
  simple: 1.0,
  moderate: 1.3,
  complex: 1.6,
};

export function calculateCostFromRules(
  normalizedSpec: any,
  rules: PricingRuleSet,
): CostEstimate {
  const siteType = normalizedSpec.siteType || 'landing';
  
  // 1. baseTier 선택
  const baseTierRule = rules.baseTiers.find((t) => t.id === siteType);
  if (!baseTierRule) {
    throw new Error(`Unknown site type: ${siteType}`);
  }

  const baseTier: BaseTier = {
    id: baseTierRule.id,
    labelKey: baseTierRule.labelKey,
    minCost: baseTierRule.minCost,
    maxCost: baseTierRule.maxCost,
  };

  const breakdown: CostBreakdownItem[] = [];
  let totalMinCost = baseTier.minCost;
  let totalMaxCost = baseTier.maxCost;

  // 추가 기본 정보 저장
  breakdown.push({
    category: 'base',
    label: `${SITE_TYPE_LABELS[siteType] || siteType} (기본)`,
    minAmount: baseTier.minCost,
    maxAmount: baseTier.maxCost,
  });

  // 2. 기능별 추가 비용
  const features = normalizedSpec.features || [];
  const featureAdditions: CostBreakdownItem[] = [];

  for (const feature of features) {
    const featureCost = rules.featureCosts[feature];
    if (featureCost) {
      totalMinCost += featureCost.min;
      totalMaxCost += featureCost.max;
      featureAdditions.push({
        category: 'feature',
        label: feature,
        minAmount: featureCost.min,
        maxAmount: featureCost.max,
      });
      breakdown.push({
        category: 'feature',
        label: feature,
        minAmount: featureCost.min,
        maxAmount: featureCost.max,
      });
    }
  }

  // 3. Design multiplier
  const designStyle = normalizedSpec.design?.style || 'standard';
  const designMultiplier = rules.designMultipliers[designStyle] || 1.0;

  // 4. Timeline multiplier
  const timeline = normalizedSpec.timeline || 'medium';
  const timelineMultiplier = rules.timelineMultipliers[timeline] || 1.0;

  // 5. Content & integrations
  const integrations = normalizedSpec.integrations || [];
  for (const integration of integrations) {
    const intCost = rules.integrationCosts[integration];
    if (intCost) {
      totalMinCost += intCost.min;
      totalMaxCost += intCost.max;
      breakdown.push({
        category: 'integration',
        label: integration,
        minAmount: intCost.min,
        maxAmount: intCost.max,
      });
    }
  }

  // 6. Apply multipliers
  totalMinCost = Math.round((totalMinCost * designMultiplier * timelineMultiplier) / 100000) * 100000;
  totalMaxCost = Math.round((totalMaxCost * designMultiplier * timelineMultiplier) / 100000) * 100000;

  return {
    baseTier,
    featureAdditions,
    designMultiplier,
    timelineMultiplier,
    totalMin: totalMinCost,
    totalMax: totalMaxCost,
    breakdown,
  };
}
