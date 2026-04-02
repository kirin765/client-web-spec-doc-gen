import { test as base, expect, type APIRequestContext, type Page } from '@playwright/test';

type UserKey = 'customer' | 'developer' | 'admin';
type UserMode = 'customer' | 'expert';

type AuthResponse = {
  token: string;
  user: {
    id: string;
    email: string;
    role: 'client' | 'admin';
    hasCustomerProfile: boolean;
    customerProfileId: string | null;
    hasExpertProfile: boolean;
    expertProfileId: string | null;
    hasDeveloperProfile: boolean;
    developerProfileId: string | null;
  };
};

type ProjectSummary = {
  id: string;
  projectName?: string | null;
  siteType?: string | null;
};

type QuoteShare = {
  id: string;
  projectRequestId: string;
  developerId: string;
  status: string;
  chatRoomId: string | null;
  canReview: boolean;
};

type ChatRoom = {
  id: string;
  unreadCount: number;
};

type DeveloperSummary = {
  id: string;
  displayName: string;
  active: boolean;
};

const API_BASE_URL = process.env.E2E_API_URL?.trim() || 'http://127.0.0.1:3101';
const AUTH_STORAGE_KEY = 'auth-store';
const QUOTE_STORAGE_KEY = 'quote-store';

async function parseJson<T>(response: Response) {
  if (!response.ok()) {
    throw new Error(`Request failed: ${response.status()} ${response.statusText()}`);
  }

  return (await response.json()) as T;
}

async function loginThroughApi(
  request: APIRequestContext,
  userKey: UserKey,
): Promise<AuthResponse> {
  const response = await request.post(`${API_BASE_URL}/auth/test-login`, {
    data: { userKey },
  });

  return parseJson<AuthResponse>(response);
}

async function writePersistedState(page: Page, key: string, state: unknown) {
  const payload = {
    state,
    version: 0,
  };

  await page.addInitScript(
    ({ storageKey, storageValue }) => {
      window.localStorage.setItem(storageKey, JSON.stringify(storageValue));
    },
    {
      storageKey: key,
      storageValue: payload,
    },
  );

  await page.goto('/');
  await page.evaluate(
    ([storageKey, storageValue]) => {
      window.localStorage.setItem(storageKey, JSON.stringify(storageValue));
    },
    [key, payload] as const,
  );
}

async function writeAuthState(page: Page, auth: AuthResponse, activeMode: UserMode) {
  await writePersistedState(page, AUTH_STORAGE_KEY, {
    token: auth.token,
    user: auth.user,
    activeMode,
  });
}

async function writeQuoteAnswers(page: Page, answers: Record<string, unknown>) {
  await writePersistedState(page, QUOTE_STORAGE_KEY, {
    currentStep: 0,
    answers,
  });
}

async function getJson<T>(
  request: APIRequestContext,
  path: string,
  token?: string,
): Promise<T> {
  const response = await request.get(`${API_BASE_URL}${path}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  return parseJson<T>(response);
}

export const test = base.extend<{
  app: {
    loginAs: (page: Page, userKey: UserKey, activeMode?: UserMode) => Promise<AuthResponse>;
    createQuoteViaUI: (
      page: Page,
      options?: { projectName?: string; siteType?: string },
    ) => Promise<{ projectName: string; siteType: string }>;
    listMyProjects: (token: string) => Promise<ProjectSummary[]>;
    listSentShares: (token: string) => Promise<QuoteShare[]>;
    listInboxShares: (token: string) => Promise<QuoteShare[]>;
    listDevelopers: () => Promise<DeveloperSummary[]>;
    getChatRoom: (token: string, roomId: string) => Promise<ChatRoom>;
  };
}>({
  app: async ({ request }, use) => {
    const helper = {
      async loginAs(page: Page, userKey: UserKey, activeMode?: UserMode) {
        const auth = await loginThroughApi(request, userKey);
        const resolvedMode =
          activeMode ??
          (auth.user.hasExpertProfile && !auth.user.hasCustomerProfile ? 'expert' : 'customer');
        await writeAuthState(page, auth, resolvedMode);
        await page.goto('/mypage');
        return auth;
      },

      async createQuoteViaUI(
        page: Page,
        options?: { projectName?: string; siteType?: string },
      ) {
        const projectName = options?.projectName ?? `E2E Quote ${Date.now()}`;
        const siteType = options?.siteType ?? 'landing';

        await writeQuoteAnswers(page, {
          siteType,
          projectName,
          targetAudience: 'E2E audience',
          contactMethod: 'kakao',
          expectedPages: 5,
          requiredPages: ['home', 'contact'],
          coreFeatures: ['contactForm', 'chat'],
          urgency: 'standard',
        });

        await page.goto('/result');
        await expect(page.getByTestId('save-quote-button')).toBeVisible();
        await page.getByTestId('save-quote-button').click();
        await expect(
          page.getByText('내 견적서에 저장했습니다. 마이페이지에서 확인할 수 있습니다.'),
        ).toBeVisible();

        return { projectName, siteType };
      },

      async listMyProjects(token: string) {
        const response = await getJson<{ data: ProjectSummary[] }>(
          request,
          '/project-requests?pageSize=100&page=1',
          token,
        );
        return response.data;
      },

      async listSentShares(token: string) {
        return getJson<QuoteShare[]>(request, '/quote-shares/sent', token);
      },

      async listInboxShares(token: string) {
        return getJson<QuoteShare[]>(request, '/quote-shares/inbox', token);
      },

      async listDevelopers() {
        return getJson<DeveloperSummary[]>(request, '/developers');
      },

      async getChatRoom(token: string, roomId: string) {
        return getJson<ChatRoom>(request, `/chat/rooms/${roomId}`, token);
      },
    };

    await use(helper);
  },
});

export { expect };
