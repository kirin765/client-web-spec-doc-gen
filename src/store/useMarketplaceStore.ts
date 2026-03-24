import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { developerProfiles } from '@/data/developerProfiles';
import type { Answers, CostEstimate, RequirementsDocument } from '@/types';
import type { DeveloperMatchResult, DeveloperProfile } from '@/types/matching';
import type {
  DeveloperDraftInput,
  MarketplaceProject,
  MarketplaceProposal,
  MarketplaceProposalStatus,
} from '@/types/marketplace';

interface CreateProjectInput {
  quoteSignature: string;
  answers: Answers;
  costEstimate: CostEstimate;
  requirementDocument: RequirementsDocument;
  matchResults: DeveloperMatchResult[];
}

interface SubmitProposalInput {
  projectId: string;
  developerId: string;
  priceMin: number;
  priceMax: number;
  durationText: string;
  message: string;
  portfolioLinks: string[];
}

interface MarketplaceStore {
  projects: MarketplaceProject[];
  developers: DeveloperProfile[];
  proposals: MarketplaceProposal[];
  selectedDeveloperId: string | null;
  createProjectFromQuote: (input: CreateProjectInput) => string;
  upsertDeveloper: (input: DeveloperDraftInput) => string;
  selectDeveloper: (developerId: string | null) => void;
  approveDeveloper: (developerId: string) => void;
  submitProposal: (input: SubmitProposalInput) => void;
  markProposalViewed: (proposalId: string) => void;
  updateProposalDecision: (
    proposalId: string,
    status: Extract<MarketplaceProposalStatus, 'accepted' | 'rejected'>,
  ) => void;
}

const STORAGE_KEY = 'marketplace-store';

function getNow() {
  return new Date().toISOString();
}

function createId(prefix: string) {
  return `${prefix}-${crypto.randomUUID()}`;
}

function normalizeList(value: string[]) {
  return value.map((item) => item.trim()).filter(Boolean);
}

export const useMarketplaceStore = create<MarketplaceStore>()(
  persist(
    (set, get) => ({
      projects: [],
      developers: developerProfiles,
      proposals: [],
      selectedDeveloperId: developerProfiles[0]?.id ?? null,

      createProjectFromQuote: ({
        quoteSignature,
        answers,
        costEstimate,
        requirementDocument,
        matchResults,
      }) => {
        const existing = get().projects.find((project) => project.quoteSignature === quoteSignature);
        if (existing) {
          return existing.id;
        }

        const now = getNow();
        const projectId = createId('project');
        const featureNames = requirementDocument.scopeOfWork.features.map((feature) => feature.name);

        set((state) => ({
          projects: [
            {
              id: projectId,
              quoteSignature,
              projectName: requirementDocument.clientInfo.projectName || '이름 없는 프로젝트',
              siteType: String(answers.siteType ?? ''),
              summary: requirementDocument.projectOverview.description,
              featureNames,
              answers,
              costEstimate,
              requirementDocument,
              matchResults,
              status: matchResults.length > 0 ? 'matched' : 'submitted',
              createdAt: now,
              updatedAt: now,
            },
            ...state.projects,
          ],
        }));

        return projectId;
      },

      upsertDeveloper: (input) => {
        const now = getNow();
        const developerId = input.id ?? createId('developer');

        set((state) => {
          const previous = state.developers.find((developer) => developer.id === developerId);
          const nextDeveloper: DeveloperProfile = {
            id: developerId,
            displayName: input.displayName,
            headline: input.headline,
            introduction: input.introduction,
            type: input.type,
            skills: normalizeList(input.skills),
            specialties: normalizeList(input.specialties),
            supportedProjectTypes: normalizeList(input.supportedProjectTypes),
            supportedCoreFeatures: normalizeList(input.supportedCoreFeatures),
            supportedEcommerceFeatures: normalizeList(input.supportedEcommerceFeatures),
            supportedDesignStyles: normalizeList(input.supportedDesignStyles),
            supportedDesignComplexities: normalizeList(input.supportedDesignComplexities),
            supportedTimelines: normalizeList(input.supportedTimelines),
            budgetMin: input.budgetMin,
            budgetMax: input.budgetMax,
            avgResponseHours: input.avgResponseHours,
            availabilityStatus: input.availabilityStatus,
            portfolioLinks: normalizeList(input.portfolioLinks),
            regions: normalizeList(input.regions),
            languages: normalizeList(input.languages),
            active: previous?.active ?? false,
            createdAt: previous?.createdAt ?? now,
            updatedAt: now,
          };

          const remaining = state.developers.filter((developer) => developer.id !== developerId);

          return {
            developers: [nextDeveloper, ...remaining],
            selectedDeveloperId: developerId,
          };
        });

        return developerId;
      },

      selectDeveloper: (selectedDeveloperId) => set({ selectedDeveloperId }),

      approveDeveloper: (developerId) =>
        set((state) => ({
          developers: state.developers.map((developer) =>
            developer.id === developerId
              ? {
                  ...developer,
                  active: true,
                  updatedAt: getNow(),
                }
              : developer
          ),
        })),

      submitProposal: ({
        projectId,
        developerId,
        priceMin,
        priceMax,
        durationText,
        message,
        portfolioLinks,
      }) =>
        set((state) => {
          const now = getNow();
          const existing = state.proposals.find(
            (proposal) =>
              proposal.projectId === projectId && proposal.developerId === developerId,
          );

          const nextProposal: MarketplaceProposal = {
            id: existing?.id ?? createId('proposal'),
            projectId,
            developerId,
            priceMin,
            priceMax,
            durationText,
            message,
            portfolioLinks: normalizeList(portfolioLinks),
            status: 'submitted',
            createdAt: existing?.createdAt ?? now,
            updatedAt: now,
            viewedAt: null,
            decidedAt: null,
          };

          return {
            proposals: [
              nextProposal,
              ...state.proposals.filter((proposal) => proposal.id !== nextProposal.id),
            ],
          };
        }),

      markProposalViewed: (proposalId) =>
        set((state) => ({
          proposals: state.proposals.map((proposal) =>
            proposal.id === proposalId && proposal.status === 'submitted'
              ? {
                  ...proposal,
                  status: 'viewed',
                  viewedAt: proposal.viewedAt ?? getNow(),
                  updatedAt: getNow(),
                }
              : proposal
          ),
        })),

      updateProposalDecision: (proposalId, status) =>
        set((state) => {
          const target = state.proposals.find((proposal) => proposal.id === proposalId);
          if (!target) {
            return state;
          }

          const now = getNow();

          return {
            proposals: state.proposals.map((proposal) => {
              if (proposal.id === proposalId) {
                return {
                  ...proposal,
                  status,
                  decidedAt: now,
                  viewedAt: proposal.viewedAt ?? now,
                  updatedAt: now,
                };
              }

              if (
                status === 'accepted' &&
                proposal.projectId === target.projectId &&
                proposal.id !== proposalId &&
                (proposal.status === 'submitted' || proposal.status === 'viewed')
              ) {
                return {
                  ...proposal,
                  status: 'rejected',
                  decidedAt: now,
                  updatedAt: now,
                };
              }

              return proposal;
            }),
            projects: state.projects.map((project) =>
              project.id === target.projectId
                ? {
                    ...project,
                    status: status === 'accepted' ? 'closed' : project.status,
                    updatedAt: now,
                  }
                : project
            ),
          };
        }),
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
