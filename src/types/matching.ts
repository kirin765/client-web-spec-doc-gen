import type { DeveloperProfile as SharedDeveloperProfile } from '@shared/types/developer';
import type { MatchReason as SharedMatchReason } from '@shared/types/matching';

export type DeveloperProfile = SharedDeveloperProfile;

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

export type DeveloperMatchReason = SharedMatchReason;

/** 최종 매칭 결과 */
export interface DeveloperMatchResult {
  developer: DeveloperProfile;
  score: number;
  matchedFeatureCount: number;
  reasons: DeveloperMatchReason[];
  summary: string;
}
