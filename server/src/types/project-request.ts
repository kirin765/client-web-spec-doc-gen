// 서버 타입: ProjectRequestStatus, ProjectRequest, ProjectRequestDetail.

import type { Answers, NormalizedSpec } from './answers';
import type { CostEstimate } from './cost-estimate';

/** 프로젝트 요청 상태 */
export type ProjectRequestStatus = 'draft' | 'submitted' | 'calculating' | 'generating_document' | 'matching' | 'completed' | 'archived';

/** 프로젝트 요청 엔티티 */
export interface ProjectRequest {
  id: string;
  userId?: string | null;
  status: ProjectRequestStatus;
  projectName?: string;
  siteType?: string;
  rawAnswers: Answers;
  normalizedSpec?: NormalizedSpec | null;
  costEstimate?: CostEstimate | null;
  pricingVersion?: string | null;
  createdAt: string;      // ISO datetime
  updatedAt: string;      // ISO datetime
  submittedAt?: string | null;
}

/** API 응답용 프로젝트 요청 (문서, 매칭 결과 포함) */
export interface ProjectRequestDetail extends ProjectRequest {
  documents?: Array<{
    id: string;
    version: number;
    format: 'json' | 'pdf' | 'html';
    storageUrl?: string;
    generatedAt: string;
  }>;
  matches?: Array<{
    id: string;
    developerId: string;
    developerName: string;
    score: number;
    status: 'suggested' | 'contacted' | 'accepted' | 'rejected';
  }>;
}
