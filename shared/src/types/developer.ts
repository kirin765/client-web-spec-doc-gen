// 개발자 프로필 타입: DeveloperType, AvailabilityStatus, DeveloperProfile. Prisma Developer 모델과 1:1 매핑.

/** 개발자 유형 */
export type DeveloperType = 'freelancer' | 'agency';

/** 가용 상태 */
export type AvailabilityStatus = 'available' | 'busy' | 'limited';

/** 개발자 프로필 엔티티 — Prisma Developer 모델과 1:1 매핑 */
export interface DeveloperProfile {
  id: string;
  type: DeveloperType;
  displayName: string;
  headline: string;
  introduction?: string;

  // 역량/전문 분야 (JSONB)
  skills: string[];
  specialties: string[];
  supportedProjectTypes: string[];
  supportedCoreFeatures: string[];
  supportedEcommerceFeatures: string[];
  supportedDesignStyles: string[];
  supportedDesignComplexities: string[];
  supportedTimelines: string[];

  // 예산 범위 (별도 컬럼)
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
