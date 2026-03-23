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
  brochure: '브로셔 사이트',
  ecommerce: '전자상거래 사이트',
  webapp: '웹 애플리케이션',
  blog: '블로그',
};

const CONTENT_LABELS: Record<string, string> = {
  clientProvides: '클라이언트 제공',
  needCopywriting: '카피라이팅 필요',
  needMediaProduction: '미디어 제작 필요',
};

export function calculateCostFromRules(
  normalizedSpec: NormalizedSpec,
  rules: PricingRuleSet,
): CostEstimate {
  // Use NormalizedSpec shape produced by normalizer.ts
  const siteType = normalizedSpec.projectType || 'landing';
  
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
  const features = [
    ...(normalizedSpec.scope?.featureSet || []),
    ...((siteType === 'ecommerce'
      ? normalizedSpec.scope?.ecommerceFeatureSet || []
      : []) as string[]),
  ];
  const featureAdditions: CostBreakdownItem[] = [];

  const defaultPageCount = baseTierRule.defaultPageCount;
  const requestedPageCount = normalizedSpec.scope?.pageCount || defaultPageCount;

  if (requestedPageCount > defaultPageCount) {
    const extraPages = requestedPageCount - defaultPageCount;
    const pageMinAmount = extraPages * rules.perPageCost.min;
    const pageMaxAmount = extraPages * rules.perPageCost.max;

    totalMinCost += pageMinAmount;
    totalMaxCost += pageMaxAmount;
    breakdown.push({
      category: 'page',
      label: `추가 페이지 (${extraPages}개)`,
      minAmount: pageMinAmount,
      maxAmount: pageMaxAmount,
    });
  }

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

  const contentProvision = normalizedSpec.scope?.contentProvision;
  if (contentProvision && rules.contentCosts[contentProvision]) {
    const contentCost = rules.contentCosts[contentProvision];
    totalMinCost += contentCost.min;
    totalMaxCost += contentCost.max;
    breakdown.push({
      category: 'content',
      label: CONTENT_LABELS[contentProvision] || contentProvision,
      minAmount: contentCost.min,
      maxAmount: contentCost.max,
    });
  }

  // 3. Design multiplier
  const designTier = normalizedSpec.scope?.designTier || 'template';
  const designMultiplier = rules.designMultipliers[designTier] || 1.0;

  // 4. Timeline multiplier
  const timeline = normalizedSpec.delivery?.urgency || 'standard';
  const timelineMultiplier = rules.timelineMultipliers[timeline] || 1.0;

  // 5. Content & integrations
  const integrations = normalizedSpec.scope?.integrations || [];
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
  totalMinCost =
    Math.floor((totalMinCost * designMultiplier * timelineMultiplier) / 100000) *
    100000;
  totalMaxCost =
    Math.ceil((totalMaxCost * designMultiplier * timelineMultiplier) / 100000) *
    100000;

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
