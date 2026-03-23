// 서버 타입: DeveloperType, AvailabilityStatus, DeveloperProfile.

/** 개발자 유형 */
export type DeveloperType = 'freelancer' | 'agency';

/** 가용 상태 */
export type AvailabilityStatus = 'available' | 'busy' | 'limited';

/** 개발자 프로필 엔티티 */
export interface DeveloperProfile {
  id: string;
  type: DeveloperType;
  displayName: string;
  headline: string;
  introduction?: string;

  // 역량/전문 분야 (JSONB)
  skills: string[];
  specialties: string[];
  supportedProjectTypes: string[];    // siteType 값 매핑
  supportedCoreFeatures: string[];
  supportedEcommerceFeatures: string[];
  supportedDesignStyles: string[];
  supportedDesignComplexities: string[];
  supportedTimelines: string[];

  // 예산 범위
  budgetMin: number;
  budgetMax: number;

  // 가용성
  availabilityStatus: AvailabilityStatus;
  avgResponseHours: number;

  // 포트폴리오/부가 정보 (JSONB)
  portfolioLinks: string[];
  regions: string[];
  languages: string[];

  // 상태
  active: boolean;
  createdAt: string;
  updatedAt: string;
}
