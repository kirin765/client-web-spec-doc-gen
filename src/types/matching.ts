// 개발자 매칭 타입: DeveloperProfile, DeveloperMatchingInput, DeveloperMatchReason, DeveloperMatchResult.

/** 개발자/팀 프로필 */
export interface DeveloperProfile {
  id: string;
  name: string;
  headline: string;
  introduction: string;
  primarySiteTypes: string[];
  specialties: string[];
  supportedCoreFeatures: string[];
  supportedEcommerceFeatures: string[];
  supportedDesignStyles: string[];
  supportedDesignComplexities: string[];
  supportedTimelines: string[];
  budgetRange: { min: number; max: number };
  responseTimeHours: number;
  availabilityStatus: 'available' | 'busy' | 'limited';
}

/** 매칭 계산용 정규화된 입력 */
export interface DeveloperMatchingInput {
  siteType: string;
  coreFeatures: string[];
  ecommerceFeatures: string[];
  designComplexity: string;
  designStyle: string;
  desiredTimeline: string;
  budgetRange: { min: number; max: number };
}

/** 매칭 점수 산정 근거 */
export interface DeveloperMatchReason {
  type: 'siteType' | 'coreFeature' | 'ecommerceFeature' | 'timeline' | 'budget' | 'design';
  label: string;
  scoreContribution: number;
  description: string;
}

/** 최종 매칭 결과 */
export interface DeveloperMatchResult {
  developer: DeveloperProfile;
  score: number;
  matchedFeatureCount: number;
  reasons: DeveloperMatchReason[];
  summary: string;
}
