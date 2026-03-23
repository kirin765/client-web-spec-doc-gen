// [수정 필요 - M6] NormalizedSpec 인터페이스가 이 파일과 shared/src/types/answers.ts에 중복 정의됨
// - 이 파일의 NormalizedSpec 인터페이스를 삭제하고 shared 패키지에서 import하여 사용해야 함
// - import type { NormalizedSpec } from '@shared/types/answers' 형태로 변경
// - 두 곳에서 별도로 관리하면 필드 불일치가 발생할 수 있어 단일 소스로 통합 필요

export interface NormalizedSpec {
  projectType: string;
  projectName?: string;
  targetAudience?: string;
  scope: {
    pageCount: number;
    featureSet: string[];
    ecommerceFeatureSet: string[];
    designTier: string;
    designStyle?: string;
    integrations: string[];
    contentProvision?: string;
  };
  delivery: {
    timelineWeeks: { min: number; max: number };
    urgency: string;
  };
  budget?: {
    min: number;
    max: number;
  };
}

function toStringArray(value: unknown): string[] {
  if (!value) return [];
  if (Array.isArray(value)) return value.map(String).filter(Boolean);
  if (typeof value === 'string') return value.split(/[;,\n]/).map(s => s.trim()).filter(Boolean);
  return [String(value)];
}

export function normalizeAnswers(rawAnswers: Record<string, unknown>): NormalizedSpec {
  const projectType = String(rawAnswers.projectType ?? rawAnswers.type ?? 'web');
  const projectName = rawAnswers.projectName ? String(rawAnswers.projectName) : undefined;
  const targetAudience = rawAnswers.targetAudience ? String(rawAnswers.targetAudience) : undefined;

  const pageCount = Number(rawAnswers.pageCount ?? rawAnswers.pages ?? 1) || 1;
  const featureSet = toStringArray(rawAnswers.features ?? rawAnswers.featureSet);
  const ecommerceFeatureSet = toStringArray(rawAnswers.ecommerceFeatures ?? rawAnswers.ecommerceFeatureSet);
  const designTier = String(rawAnswers.designTier ?? 'standard');
  const designStyle = rawAnswers.designStyle ? String(rawAnswers.designStyle) : undefined;
  const integrations = toStringArray(rawAnswers.integrations);
  const contentProvision = rawAnswers.contentProvision ? String(rawAnswers.contentProvision) : undefined;

  const timelineMin = Number(rawAnswers.timelineMin ?? rawAnswers.timelineWeeksMin) || undefined;
  const timelineMax = Number(rawAnswers.timelineMax ?? rawAnswers.timelineWeeksMax) || undefined;
  const timelineWeeks = timelineMin && timelineMax
    ? { min: Math.min(timelineMin, timelineMax), max: Math.max(timelineMin, timelineMax) }
    : { min: timelineMin ?? (Number(rawAnswers.timelineWeeks) || 4), max: timelineMax ?? (Number(rawAnswers.timelineWeeks) || 8) };

  const urgency = String(rawAnswers.urgency ?? 'normal');

  const budgetMin = rawAnswers.budgetMin ? Number(rawAnswers.budgetMin) : rawAnswers.budget ? Number((rawAnswers.budget as any).min) : undefined;
  const budgetMax = rawAnswers.budgetMax ? Number(rawAnswers.budgetMax) : rawAnswers.budget ? Number((rawAnswers.budget as any).max) : undefined;
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
