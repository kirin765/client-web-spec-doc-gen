// 제안(견적) 타입: ProposalStatus, Proposal, ProjectProposalComparison.

export type ProposalStatus = 'submitted' | 'viewed' | 'accepted' | 'rejected';

export interface Proposal {
  id: string;
  projectRequestId: string;
  developerId: string;
  priceMin: number;
  priceMax: number;
  estimatedDurationText: string;
  message: string;
  portfolioLinks: string[];
  status: ProposalStatus;
  viewedAt?: string | null;
  decidedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ProposalWithDeveloper extends Proposal {
  developer: {
    id: string;
    displayName: string;
    headline: string;
    portfolioLinks: string[];
    availabilityStatus: string;
    active: boolean;
  };
}
