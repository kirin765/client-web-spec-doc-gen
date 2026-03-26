export interface SessionUser {
  id: string;
  email: string;
  role: 'client' | 'admin';
  hasDeveloperProfile: boolean;
  developerProfileId: string | null;
}

export interface AuthResponse {
  token: string;
  user: SessionUser;
}

export interface DeveloperProfileApi {
  id: string;
  type: 'freelancer' | 'agency';
  displayName: string;
  headline: string;
  introduction?: string | null;
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
  availabilityStatus: 'available' | 'busy' | 'limited';
  avgResponseHours: number;
  portfolioLinks: string[];
  regions: string[];
  languages: string[];
  active: boolean;
  createdAt: string;
  updatedAt: string;
  contactEmail?: string | null;
}

export interface ProjectRequestSummary {
  id: string;
  projectName?: string | null;
  siteType?: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
  submittedAt?: string | null;
}

export interface ProjectRequestListResponse {
  data: ProjectRequestSummary[];
  total: number;
  pageSize: number;
  page: number;
}

export interface QuoteShareItem {
  id: string;
  projectRequestId: string;
  developerId: string;
  status: 'sent' | 'approved' | 'canceled_by_user' | 'canceled_by_developer';
  approvedAt: string | null;
  canceledAt: string | null;
  canceledBy: 'user' | 'developer' | null;
  createdAt: string;
  updatedAt: string;
  canOpenContact: boolean;
  counterpartyEmail: string | null;
  projectRequest: {
    id: string;
    projectName?: string | null;
    siteType?: string | null;
    status: string;
  } | null;
  developer: {
    id: string;
    displayName: string;
    headline: string;
    type: 'freelancer' | 'agency';
    availabilityStatus: 'available' | 'busy' | 'limited';
  } | null;
}

export interface UpsertDeveloperProfilePayload {
  displayName: string;
  type: 'freelancer' | 'agency';
  headline: string;
  skills: string[];
  specialties?: string[];
  supportedProjectTypes: string[];
  supportedCoreFeatures?: string[];
  supportedEcommerceFeatures?: string[];
  supportedDesignStyles?: string[];
  supportedDesignComplexities?: string[];
  supportedTimelines?: string[];
  budgetMin: number;
  budgetMax: number;
  availabilityStatus?: 'available' | 'busy' | 'limited';
  avgResponseHours?: number;
  portfolioLinks?: string[];
  regions?: string[];
  languages?: string[];
  introduction?: string;
}
