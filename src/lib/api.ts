import type {
  AuthResponse,
  DeveloperProfileApi,
  ProjectRequestListResponse,
  QuoteShareItem,
  SessionUser,
  UpsertDeveloperProfilePayload,
} from '@/types/api';

const API_BASE_URL = import.meta.env.VITE_API_URL?.trim() || 'http://localhost:3001';

interface ApiRequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  token?: string | null;
  body?: unknown;
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
    'Content-Type': 'application/json',
  };

  if (options.token) {
    headers.Authorization = `Bearer ${options.token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method ?? 'GET',
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
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

export function listDevelopers() {
  return request<DeveloperProfileApi[]>('/developers');
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

export function cancelQuoteShareByDeveloper(token: string, quoteShareId: string) {
  return request<QuoteShareItem>(`/quote-shares/${quoteShareId}/cancel-by-developer`, {
    method: 'PATCH',
    token,
  });
}
