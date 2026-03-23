// 서버 타입: MatchReasonType, MatchStatus, MatchReason, MatchResult, MatchResultWithDeveloper.

/** 매칭 사유 유형 */
export type MatchReasonType = 'siteType' | 'coreFeature' | 'ecommerceFeature' | 'timeline' | 'budget' | 'design';

/** 매칭 상태 */
export type MatchStatus = 'suggested' | 'contacted' | 'accepted' | 'rejected';

/** 매칭 점수 산정 근거 */
export interface MatchReason {
  type: MatchReasonType;
  label: string;
  scoreContribution: number;
  description: string;
}

/** 매칭 결과 엔티티 */
export interface MatchResult {
  id: string;
  projectRequestId: string;
  developerId: string;
  score: number;
  reasons: MatchReason[];
  status: MatchStatus;
  createdAt: string;
}

/** 프론트엔드 표시용 매칭 결과 (개발자 정보 포함) */
export interface MatchResultWithDeveloper extends MatchResult {
  developer: {
    id: string;
    displayName: string;
    headline: string;
    type: string;
    availabilityStatus: string;
    portfolioLinks: string[];
  };
  matchedFeatureCount: number;
  summary: string;
}
