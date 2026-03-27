import type { CostEstimate } from '@/types';

export type UserMode = 'customer' | 'expert';

export interface RegionSummary {
  code: string;
  name: string;
  depth: number;
  parentCode: string | null;
  sortOrder?: number;
}

export interface SessionUser {
  id: string;
  email: string;
  role: 'client' | 'admin';
  hasCustomerProfile: boolean;
  customerProfileId: string | null;
  hasExpertProfile: boolean;
  expertProfileId: string | null;
  hasDeveloperProfile: boolean;
  developerProfileId: string | null;
}

export interface AuthResponse {
  token: string;
  user: SessionUser;
}

export interface SignedImage {
  storageUrl: string;
  url: string;
}

export interface PortfolioPreviewItem {
  id: string;
  description: string;
  imageCount: number;
  previewImage: SignedImage | null;
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
  regionCode: string | null;
  region: RegionSummary | null;
  regions: string[];
  languages: string[];
  active: boolean;
  faqCount: number;
  reviewCount: number;
  reviewAverage: number;
  portfolioPreview: PortfolioPreviewItem[];
  createdAt: string;
  updatedAt: string;
  contactEmail?: string | null;
}

export interface CustomerProfileApi {
  id: string;
  userId: string;
  displayName: string;
  introduction: string | null;
  regionCode: string | null;
  region: RegionSummary | null;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectRequestSummary {
  id: string;
  projectName?: string | null;
  siteType?: string | null;
  contactMethod: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
  submittedAt?: string | null;
}

export interface ProjectRequestDocumentSummary {
  id: string;
  version: number;
  format: string;
  storageUrl: string | null;
  generatedAt: string;
}

export interface ProjectRequestMatchSummary {
  id: string;
  score: number;
  status: string;
  developer: {
    id: string;
    displayName: string;
    headline: string;
    type: 'freelancer' | 'agency';
    availabilityStatus: 'available' | 'busy' | 'limited';
  } | null;
}

export interface ProjectRequestDetail extends ProjectRequestSummary {
  rawAnswers: Record<string, unknown>;
  normalizedSpec: Record<string, unknown> | null;
  costEstimate: CostEstimate | null;
  pricingVersion: string | null;
  documents: ProjectRequestDocumentSummary[];
  matches: ProjectRequestMatchSummary[];
  quoteSharesSummary: {
    sent: number;
    inProgress: number;
    completed: number;
    canceled: number;
  };
}

export interface ProjectRequestListResponse {
  data: ProjectRequestSummary[];
  total: number;
  pageSize: number;
  page: number;
}

export interface ExpertFaqItem {
  id: string;
  developerId: string;
  question: string;
  answer: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface ExpertPortfolioItem {
  id: string;
  developerId: string;
  description: string;
  imageUrls: SignedImage[];
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewItem {
  id: string;
  quoteShareId: string;
  developerId: string;
  customerUserId: string;
  rating: number;
  content: string;
  createdAt: string;
  updatedAt: string;
  customer: {
    id: string;
    email: string;
    name: string | null;
  } | null;
}

export interface DeveloperReviewsResponse {
  averageRating: number;
  total: number;
  items: ReviewItem[];
}

export interface QuoteShareItem {
  id: string;
  projectRequestId: string;
  developerId: string;
  status:
    | 'sent'
    | 'in_progress'
    | 'completed'
    | 'canceled_by_user'
    | 'canceled_by_developer';
  startedAt: string | null;
  completedAt: string | null;
  canceledAt: string | null;
  canceledBy: 'user' | 'developer' | null;
  createdAt: string;
  updatedAt: string;
  canOpenContact: boolean;
  canComplete: boolean;
  canReview: boolean;
  reviewId: string | null;
  contactMethod: string | null;
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
  regionCode?: string;
  languages?: string[];
  introduction?: string;
}

export interface UpsertCustomerProfilePayload {
  displayName: string;
  introduction?: string;
  regionCode?: string;
}

export interface UpsertExpertFaqPayload {
  question: string;
  answer: string;
  sortOrder?: number;
}

export interface UpsertExpertPortfolioPayload {
  description: string;
  imageUrls: string[];
  sortOrder?: number;
}

export interface CreateReviewPayload {
  quoteShareId: string;
  rating: number;
  content: string;
}

export interface UploadImageFile {
  storageUrl: string;
  url: string;
  contentType: string;
  originalName: string;
}

export interface UploadImagesResponse {
  files: UploadImageFile[];
}
