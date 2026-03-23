// 답변 정규화 — rawAnswers → NormalizedSpec 변환 (미구현)
// NormalizedSpec 인터페이스만 정의됨. normalizeAnswers(), validateNormalizedSpec()은 미구현 스텁.

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

// 미구현 스텁
export function normalizeAnswers(rawAnswers: Record<string, unknown>): NormalizedSpec {
  throw new Error('Not implemented');
}

// 미구현 스텁
export function validateNormalizedSpec(spec: NormalizedSpec): { valid: boolean; errors: string[] } {
  throw new Error('Not implemented');
}
