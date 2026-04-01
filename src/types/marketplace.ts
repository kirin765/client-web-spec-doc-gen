import type { Answers, CostEstimate, RequirementsDocument } from '@/types';
import type { DeveloperMatchResult, DeveloperProfile } from '@/types/matching';

export type MarketplaceProjectStatus = 'submitted' | 'matched' | 'closed';
export type MarketplaceProposalStatus = 'submitted' | 'viewed' | 'accepted' | 'rejected';

export interface MarketplaceProject {
  id: string;
  quoteSignature: string;
  projectName: string;
  siteType: string;
  summary: string;
  featureNames: string[];
  answers: Answers;
  costEstimate: CostEstimate;
  requirementDocument: RequirementsDocument;
  matchResults: DeveloperMatchResult[];
  status: MarketplaceProjectStatus;
  createdAt: string;
  updatedAt: string;
}

export interface MarketplaceProposal {
  id: string;
  projectId: string;
  developerId: string;
  priceMin: number;
  priceMax: number;
  durationText: string;
  message: string;
  portfolioLinks: string[];
  status: MarketplaceProposalStatus;
  createdAt: string;
  updatedAt: string;
  viewedAt?: string | null;
  decidedAt?: string | null;
}

export interface DeveloperDraftInput {
  id?: string;
  displayName: string;
  headline: string;
  introduction?: string;
  type: DeveloperProfile['type'];
  skills: string[];
  specialties: string[];
  supportedProjectTypes: string[];
  supportedCoreFeatures: string[];
  supportedEcommerceFeatures: string[];
  supportedDesignStyles: string[];
  supportedDesignComplexities: string[];
  supportedTimelines: string[];
  budgetMin: number;
  budgetMax: number;
  totalCareerYears: number | null;
  avgResponseHours: number;
  availabilityStatus: DeveloperProfile['availabilityStatus'];
  portfolioLinks: string[];
  regions: string[];
  languages: string[];
}
