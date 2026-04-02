import type { Page } from '@playwright/test';

type TestRole = 'CLIENT' | 'DEVELOPER' | 'ADMIN';
type ActiveMode = 'customer' | 'expert';
const E2E_API_BASE_URL = 'http://127.0.0.1:3101';

interface TestSessionUser {
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

interface TestSessionResponse {
  token: string;
  user: TestSessionUser;
}

export async function createTestSession(input: {
  email: string;
  role?: TestRole;
  createCustomerProfile?: boolean;
  createDeveloperProfile?: boolean;
  developerActive?: boolean;
}): Promise<TestSessionResponse> {
  const response = await fetch(`${E2E_API_BASE_URL}/auth/test/session`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error(`Failed to create test session: ${response.status}`);
  }

  return (await response.json()) as TestSessionResponse;
}

export async function applyAuthStorage(
  page: Page,
  session: TestSessionResponse,
  activeMode: ActiveMode,
) {
  await page.addInitScript(
    ({ persisted }) => {
      window.localStorage.setItem('auth-store', JSON.stringify(persisted));
    },
    {
      persisted: {
        state: {
          token: session.token,
          user: session.user,
          activeMode,
        },
        version: 0,
      },
    },
  );
}
