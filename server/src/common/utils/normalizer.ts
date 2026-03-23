import type { NormalizedSpec } from '@shared/types/answers';

const TIMELINE_DEFAULTS: Record<string, { min: number; max: number }> = {
  flexible: { min: 8, max: 16 },
  standard: { min: 4, max: 8 },
  urgent: { min: 2, max: 4 },
  rush: { min: 1, max: 2 },
};

function toStringArray(value: unknown): string[] {
  if (!value) return [];
  if (Array.isArray(value)) return value.map(String).filter(Boolean);
  if (typeof value === 'string') return value.split(/[;,\n]/).map(s => s.trim()).filter(Boolean);
  return [String(value)];
}

function toNumber(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const numericValue = Number(value);
    return Number.isFinite(numericValue) ? numericValue : undefined;
  }
  return undefined;
}

function toBudgetRecord(
  value: unknown,
): { min?: number; max?: number } {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return {};
  }

  const budget = value as { min?: unknown; max?: unknown };

  return {
    min: toNumber(budget.min),
    max: toNumber(budget.max),
  };
}

export function normalizeAnswers(rawAnswers: Record<string, unknown>): NormalizedSpec {
  const projectType = String(
    rawAnswers.projectType ?? rawAnswers.siteType ?? rawAnswers.type ?? 'landing',
  );
  const projectName = rawAnswers.projectName ? String(rawAnswers.projectName) : undefined;
  const targetAudience = rawAnswers.targetAudience ? String(rawAnswers.targetAudience) : undefined;

  const pageCount =
    toNumber(rawAnswers.pageCount ?? rawAnswers.expectedPages ?? rawAnswers.pages) || 1;
  const featureSet = toStringArray(
    rawAnswers.features ?? rawAnswers.featureSet ?? rawAnswers.coreFeatures,
  );
  const ecommerceFeatureSet = toStringArray(rawAnswers.ecommerceFeatures ?? rawAnswers.ecommerceFeatureSet);
  const designTier = String(rawAnswers.designTier ?? rawAnswers.designComplexity ?? 'template');
  const designStyle = rawAnswers.designStyle ? String(rawAnswers.designStyle) : undefined;
  const integrations = toStringArray(rawAnswers.integrations ?? rawAnswers.externalIntegrations);
  const contentProvision = rawAnswers.contentProvision
    ? String(rawAnswers.contentProvision)
    : rawAnswers.contentDelivery
      ? String(rawAnswers.contentDelivery)
      : undefined;

  const urgency = String(rawAnswers.urgency ?? rawAnswers.desiredTimeline ?? 'standard');
  const fallbackTimeline = TIMELINE_DEFAULTS[urgency] || TIMELINE_DEFAULTS.standard;
  const timelineMin = toNumber(rawAnswers.timelineMin ?? rawAnswers.timelineWeeksMin);
  const timelineMax = toNumber(rawAnswers.timelineMax ?? rawAnswers.timelineWeeksMax);
  const timelineWeeks =
    timelineMin != null && timelineMax != null
      ? {
          min: Math.min(timelineMin, timelineMax),
          max: Math.max(timelineMin, timelineMax),
        }
      : {
          min: timelineMin ?? toNumber(rawAnswers.timelineWeeks) ?? fallbackTimeline.min,
          max: timelineMax ?? toNumber(rawAnswers.timelineWeeks) ?? fallbackTimeline.max,
        };

  const nestedBudget = toBudgetRecord(rawAnswers.budget);
  const budgetMin = toNumber(rawAnswers.budgetMin) ?? nestedBudget.min;
  const budgetMax = toNumber(rawAnswers.budgetMax) ?? nestedBudget.max;
  const budget = (budgetMin || budgetMax) ? { min: budgetMin ?? 0, max: budgetMax ?? (budgetMin ?? 0) } : undefined;

  return {
    projectType,
    projectName,
    targetAudience,
    scope: {
      pageCount: Math.max(1, Math.floor(pageCount)),
      featureSet,
      ecommerceFeatureSet,
      designTier,
      designStyle,
      integrations,
      contentProvision,
    },
    delivery: {
      timelineWeeks,
      urgency,
    },
    budget,
  };
}

export function validateNormalizedSpec(spec: NormalizedSpec): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  if (!spec.projectType) errors.push('projectType is required');
  if (!spec.scope) errors.push('scope is required');
  else {
    if (!Number.isFinite(spec.scope.pageCount) || spec.scope.pageCount < 1) errors.push('scope.pageCount must be >= 1');
    if (!Array.isArray(spec.scope.featureSet)) errors.push('scope.featureSet must be an array');
  }
  if (!spec.delivery || !spec.delivery.timelineWeeks) errors.push('delivery.timelineWeeks is required');
  if (spec.budget) {
    if (spec.budget.min != null && spec.budget.max != null && spec.budget.min > spec.budget.max) errors.push('budget.min cannot be greater than budget.max');
  }
  return { valid: errors.length === 0, errors };
}
