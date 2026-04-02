import type {
  AuthResponse,
  AdminDeveloperListResponse,
  AdminProjectRequestListResponse,
  CreateReviewPayload,
  CustomerProfileApi,
  ChatMessagesResponse,
  ChatMessageItem,
  ChatRoomSummary,
  DeveloperProfileApi,
  DeveloperReviewsResponse,
  ExpertFaqItem,
  ExpertPortfolioItem,
  ListDevelopersFilters,
  ProjectRequestListResponse,
  ProjectRequestDetail,
  QuoteShareItem,
  RegionSummary,
  ReviewItem,
  SessionUser,
  UploadImagesResponse,
  UpsertCustomerProfilePayload,
  UpsertDeveloperProfilePayload,
  UpsertExpertFaqPayload,
  UpsertExpertPortfolioPayload,
} from '@/types/api';

const API_BASE_URL = import.meta.env.VITE_API_URL?.trim() || 'http://localhost:3001';

interface ApiRequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  token?: string | null;
  body?: unknown;
  headers?: Record<string, string>;
}

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

async function request<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = {
    ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
    ...options.headers,
  };

  if (options.token) {
    headers.Authorization = `Bearer ${options.token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method ?? 'GET',
    headers,
    body:
      options.body instanceof FormData
        ? options.body
        : options.body !== undefined
          ? JSON.stringify(options.body)
          : undefined,
  });

  const json = await response.json().catch(() => null);
  if (!response.ok) {
    const message =
      (json && typeof json === 'object' && 'message' in json && String((json as any).message)) ||
      `Request failed: ${response.status}`;
    throw new ApiError(message, response.status);
  }

  return json as T;
}

export function loginWithGoogle(idToken: string) {
  return request<AuthResponse>('/auth/google', {
    method: 'POST',
    body: { idToken },
  });
}

export function getCurrentUser(token: string) {
  return request<SessionUser>('/auth/me', {
    token,
  });
}

export function listDevelopers(filters: ListDevelopersFilters = {}) {
  const query = new URLSearchParams();

  if (filters.skills?.length) {
    query.set('skills', filters.skills.join(','));
  }

  if (filters.projectTypes?.length) {
    query.set('projectTypes', filters.projectTypes.join(','));
  }

  if (typeof filters.minBudget === 'number') {
    query.set('minBudget', String(filters.minBudget));
  }

  if (typeof filters.maxBudget === 'number') {
    query.set('maxBudget', String(filters.maxBudget));
  }

  if (filters.availabilityStatus) {
    query.set('availabilityStatus', filters.availabilityStatus);
  }

  if (filters.careerLevels?.length) {
    query.set('careerLevels', filters.careerLevels.join(','));
  }

  if (typeof filters.minCareerYears === 'number') {
    query.set('minCareerYears', String(filters.minCareerYears));
  }

  if (typeof filters.maxCareerYears === 'number') {
    query.set('maxCareerYears', String(filters.maxCareerYears));
  }

  const queryString = query.toString();
  return request<DeveloperProfileApi[]>(`/developers${queryString ? `?${queryString}` : ''}`);
}

export function getDeveloperById(developerId: string) {
  return request<DeveloperProfileApi>(`/developers/${developerId}`);
}

export function getMyDeveloperProfile(token: string) {
  return request<DeveloperProfileApi>('/developers/me/profile', {
    token,
  });
}

export function upsertMyDeveloperProfile(
  token: string,
  payload: UpsertDeveloperProfilePayload,
) {
  return request<DeveloperProfileApi>('/developers/me/profile', {
    method: 'POST',
    token,
    body: payload,
  });
}

export function patchMyDeveloperProfile(
  token: string,
  payload: Partial<UpsertDeveloperProfilePayload>,
) {
  return request<DeveloperProfileApi>('/developers/me/profile', {
    method: 'PATCH',
    token,
    body: payload,
  });
}

export function getMyCustomerProfile(token: string) {
  return request<CustomerProfileApi>('/customers/me/profile', {
    token,
  });
}

export function upsertMyCustomerProfile(
  token: string,
  payload: UpsertCustomerProfilePayload,
) {
  return request<CustomerProfileApi>('/customers/me/profile', {
    method: 'POST',
    token,
    body: payload,
  });
}

export function patchMyCustomerProfile(
  token: string,
  payload: Partial<UpsertCustomerProfilePayload>,
) {
  return request<CustomerProfileApi>('/customers/me/profile', {
    method: 'PATCH',
    token,
    body: payload,
  });
}

export function listRegions() {
  return request<RegionSummary[]>('/regions');
}

export function listRegionChildren(code: string) {
  return request<RegionSummary[]>(`/regions/${code}/children`);
}

export function listDeveloperFaqs(developerId: string) {
  return request<ExpertFaqItem[]>(`/developers/${developerId}/faqs`);
}

export function listMyFaqs(token: string) {
  return request<ExpertFaqItem[]>('/developers/me/faqs', { token });
}

export function createMyFaq(token: string, payload: UpsertExpertFaqPayload) {
  return request<ExpertFaqItem>('/developers/me/faqs', {
    method: 'POST',
    token,
    body: payload,
  });
}

export function updateMyFaq(
  token: string,
  faqId: string,
  payload: Partial<UpsertExpertFaqPayload>,
) {
  return request<ExpertFaqItem>(`/developers/me/faqs/${faqId}`, {
    method: 'PATCH',
    token,
    body: payload,
  });
}

export function deleteMyFaq(token: string, faqId: string) {
  return request<{ success: true }>(`/developers/me/faqs/${faqId}`, {
    method: 'DELETE',
    token,
  });
}

export function listDeveloperPortfolios(developerId: string) {
  return request<ExpertPortfolioItem[]>(`/developers/${developerId}/portfolios`);
}

export function listMyPortfolios(token: string) {
  return request<ExpertPortfolioItem[]>('/developers/me/portfolios', { token });
}

export function createMyPortfolio(token: string, payload: UpsertExpertPortfolioPayload) {
  return request<ExpertPortfolioItem>('/developers/me/portfolios', {
    method: 'POST',
    token,
    body: payload,
  });
}

export function updateMyPortfolio(
  token: string,
  portfolioId: string,
  payload: Partial<UpsertExpertPortfolioPayload>,
) {
  return request<ExpertPortfolioItem>(`/developers/me/portfolios/${portfolioId}`, {
    method: 'PATCH',
    token,
    body: payload,
  });
}

export function deleteMyPortfolio(token: string, portfolioId: string) {
  return request<{ success: true }>(`/developers/me/portfolios/${portfolioId}`, {
    method: 'DELETE',
    token,
  });
}

export function listDeveloperReviews(developerId: string) {
  return request<DeveloperReviewsResponse>(`/developers/${developerId}/reviews`);
}

export function listReceivedReviews(token: string) {
  return request<ReviewItem[]>('/reviews/me/received', { token });
}

export function createReview(token: string, payload: CreateReviewPayload) {
  return request<ReviewItem>('/reviews', {
    method: 'POST',
    token,
    body: payload,
  });
}

export function uploadImages(token: string, files: File[]) {
  const formData = new FormData();
  files.forEach((file) => formData.append('files', file));

  return request<UploadImagesResponse>('/uploads/images', {
    method: 'POST',
    token,
    body: formData,
  });
}

export function createDraftProjectRequest(
  token: string,
  payload: { projectName: string; siteType: string; description?: string },
) {
  return request<{ id: string }>('/project-requests/draft', {
    method: 'POST',
    token,
    body: payload,
  });
}

export function submitProjectRequest(
  token: string,
  projectRequestId: string,
  rawAnswers: Record<string, unknown>,
) {
  return request(`/project-requests/${projectRequestId}/submit`, {
    method: 'POST',
    token,
    body: { rawAnswers },
  });
}

export function listMyProjectRequests(token: string) {
  return request<ProjectRequestListResponse>('/project-requests?pageSize=100&page=1', {
    token,
  });
}

export function listAdminDevelopers(
  token: string,
  options: { status?: 'pending' | 'active'; page?: number; limit?: number } = {},
) {
  const params = new URLSearchParams();
  if (options.status) params.set('status', options.status);
  if (options.page) params.set('page', String(options.page));
  if (options.limit) params.set('limit', String(options.limit));

  const query = params.toString();
  return request<AdminDeveloperListResponse>(`/admin/developers${query ? `?${query}` : ''}`, {
    token,
  });
}

export function listAdminProjects(
  token: string,
  options: {
    page?: number;
    limit?: number;
    status?: string;
    siteType?: string;
    submittedFrom?: string;
    submittedTo?: string;
  } = {},
) {
  const params = new URLSearchParams();
  if (options.page) params.set('page', String(options.page));
  if (options.limit) params.set('limit', String(options.limit));
  if (options.status) params.set('status', options.status);
  if (options.siteType) params.set('siteType', options.siteType);
  if (options.submittedFrom) params.set('submittedFrom', options.submittedFrom);
  if (options.submittedTo) params.set('submittedTo', options.submittedTo);

  const query = params.toString();
  return request<AdminProjectRequestListResponse>(`/admin/projects${query ? `?${query}` : ''}`, {
    token,
  });
}

export function approveAdminDeveloper(token: string, developerId: string) {
  return request(`/admin/developers/${developerId}/approve`, {
    method: 'PATCH',
    token,
  });
}

export function getMyProjectRequestDetail(token: string, projectRequestId: string) {
  return request<ProjectRequestDetail>(`/project-requests/${projectRequestId}`, {
    token,
  });
}

export function listSentQuoteShares(token: string) {
  return request<QuoteShareItem[]>('/quote-shares/sent', { token });
}

export function listInboxQuoteShares(token: string) {
  return request<QuoteShareItem[]>('/quote-shares/inbox', { token });
}

export function getQuoteShareDetail(token: string, quoteShareId: string) {
  return request<QuoteShareItem>(`/quote-shares/${quoteShareId}`, { token });
}

export function createQuoteShare(
  token: string,
  payload: { projectRequestId: string; developerId: string },
) {
  return request<QuoteShareItem>('/quote-shares', {
    method: 'POST',
    token,
    body: payload,
  });
}

export function cancelQuoteShareByUser(token: string, quoteShareId: string) {
  return request<QuoteShareItem>(`/quote-shares/${quoteShareId}/cancel`, {
    method: 'PATCH',
    token,
  });
}

export function approveQuoteShareByDeveloper(token: string, quoteShareId: string) {
  return request<QuoteShareItem>(`/quote-shares/${quoteShareId}/approve`, {
    method: 'PATCH',
    token,
  });
}

export function completeQuoteShareByDeveloper(token: string, quoteShareId: string) {
  return request<QuoteShareItem>(`/quote-shares/${quoteShareId}/complete`, {
    method: 'PATCH',
    token,
  });
}

export function cancelQuoteShareByDeveloper(token: string, quoteShareId: string) {
  return request<QuoteShareItem>(`/quote-shares/${quoteShareId}/cancel-by-developer`, {
    method: 'PATCH',
    token,
  });
}

export function listChatRooms(token: string) {
  return request<ChatRoomSummary[]>('/chat/rooms', { token });
}

export function getChatRoom(token: string, roomId: string) {
  return request<ChatRoomSummary>(`/chat/rooms/${roomId}`, { token });
}

export function listChatMessages(token: string, roomId: string, cursor?: string) {
  const params = new URLSearchParams();
  if (cursor) {
    params.set('cursor', cursor);
  }

  const query = params.toString();
  return request<ChatMessagesResponse>(`/chat/rooms/${roomId}/messages${query ? `?${query}` : ''}`, {
    token,
  });
}

export function sendChatMessage(token: string, roomId: string, body: string) {
  return request<ChatMessageItem>(`/chat/rooms/${roomId}/messages`, {
    method: 'POST',
    token,
    body: { body },
  });
}

export function markChatRoomRead(token: string, roomId: string, lastReadMessageId?: string) {
  return request<{ success: true }>(`/chat/rooms/${roomId}/read`, {
    method: 'PATCH',
    token,
    body: lastReadMessageId ? { lastReadMessageId } : {},
  });
}
