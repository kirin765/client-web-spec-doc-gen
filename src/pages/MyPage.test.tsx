// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mockUpdateUser = vi.fn();

type MockAuthState = {
  token: string | null;
  user: Record<string, unknown> | null;
  activeMode: 'customer' | 'expert';
  updateUser: typeof mockUpdateUser;
};

let mockAuthState: MockAuthState = {
  token: 'test-token',
  user: {
    id: 'user-1',
    email: 'user@test.local',
    role: 'customer',
    hasCustomerProfile: true,
    hasExpertProfile: false,
  },
  activeMode: 'customer',
  updateUser: mockUpdateUser,
};

vi.mock('@/store/useAuthStore', () => ({
  useAuthStore: (selector: (state: MockAuthState) => unknown) => selector(mockAuthState),
}));

vi.mock('@/components/seo/Seo', () => ({
  Seo: () => null,
}));

vi.mock('@/components/common/LoadingButton', () => ({
  LoadingButton: ({
    children,
    loading,
    loadingLabel,
    ...props
  }: {
    children: ReactNode;
    loading?: boolean;
    loadingLabel?: string;
  } & Record<string, unknown>) => (
    <button {...props}>{loading ? loadingLabel : children}</button>
  ),
}));

vi.mock('@/components/regions/RegionSelector', () => ({
  RegionSelector: ({ label }: { label: string }) => <div>{label}</div>,
}));

vi.mock('@/lib/api', () => {
  class ApiError extends Error {
    status: number;

    constructor(message: string, status: number) {
      super(message);
      this.status = status;
    }
  }

  return {
    ApiError,
    approveQuoteShareByDeveloper: vi.fn(),
    cancelQuoteShareByDeveloper: vi.fn(),
    cancelQuoteShareByUser: vi.fn(),
    completeQuoteShareByDeveloper: vi.fn(),
    createMyFaq: vi.fn(),
    createMyPortfolio: vi.fn(),
    createReview: vi.fn(),
    deleteMyFaq: vi.fn(),
    deleteMyPortfolio: vi.fn(),
    getMyCustomerProfile: vi.fn(),
    getMyDeveloperProfile: vi.fn(),
    getMyProjectRequestDetail: vi.fn(),
    getQuoteShareDetail: vi.fn(),
    listInboxQuoteShares: vi.fn(),
    listMyFaqs: vi.fn(),
    listMyPortfolios: vi.fn(),
    listMyProjectRequests: vi.fn(),
    listReceivedReviews: vi.fn(),
    listSentQuoteShares: vi.fn(),
    updateMyFaq: vi.fn(),
    updateMyPortfolio: vi.fn(),
    uploadImages: vi.fn(),
    upsertMyCustomerProfile: vi.fn(),
    upsertMyDeveloperProfile: vi.fn(),
  };
});

import { MyPage } from '@/pages/MyPage';
import {
  ApiError,
  approveQuoteShareByDeveloper,
  getMyCustomerProfile,
  getMyDeveloperProfile,
  listInboxQuoteShares,
  listMyFaqs,
  listMyPortfolios,
  listReceivedReviews,
} from '@/lib/api';

function renderMyPage() {
  return render(
    <MemoryRouter>
      <MyPage />
    </MemoryRouter>,
  );
}

function mockBaseLoad({
  customerProfile = {
    id: 'customer-1',
    displayName: '고객',
    introduction: '소개',
    regionCode: 'KR-11',
    region: { code: 'KR-11', name: '서울' },
  },
  developerProfile = null,
  inbox = [],
  receivedReviews = [],
  faqs = [],
  portfolios = [],
}: {
  customerProfile?: any;
  developerProfile?: any;
  inbox?: any[];
  receivedReviews?: any[];
  faqs?: any[];
  portfolios?: any[];
} = {}) {
  vi.mocked(getMyCustomerProfile).mockResolvedValue(customerProfile);
  vi.mocked(getMyDeveloperProfile).mockImplementation(async () => {
    if (developerProfile == null) {
      throw new ApiError('not found', 404);
    }

    return developerProfile;
  });
  vi.mocked(listInboxQuoteShares).mockResolvedValue(inbox as any);
  vi.mocked(listReceivedReviews).mockResolvedValue(receivedReviews as any);
  vi.mocked(listMyFaqs).mockResolvedValue(faqs as any);
  vi.mocked(listMyPortfolios).mockResolvedValue(portfolios as any);
}

beforeEach(() => {
  mockAuthState = {
    token: 'test-token',
    user: {
      id: 'user-1',
      email: 'user@test.local',
      role: 'customer',
      hasCustomerProfile: true,
      hasExpertProfile: false,
    },
    activeMode: 'customer',
    updateUser: mockUpdateUser,
  };

  mockUpdateUser.mockReset();
  vi.clearAllMocks();
  mockBaseLoad();
});

afterEach(() => {
  cleanup();
});

describe('MyPage', () => {
  it('renders customer mode without duplicate quote sections', async () => {
    renderMyPage();

    expect(await screen.findByText('고객 마이페이지')).toBeInTheDocument();
    expect(screen.getByText("프로필과 활동 지역을 관리할 수 있습니다. 견적 이력과 요청 관리는 `/quotes`에서 확인하세요.")).toBeInTheDocument();
    expect(screen.queryByText('작성한 견적 리스트')).not.toBeInTheDocument();
    expect(screen.queryByText('견적 요청 리스트')).not.toBeInTheDocument();
  });

  it('renders expert mode sections and starts a received quote share', async () => {
    mockAuthState = {
      ...mockAuthState,
      activeMode: 'expert',
      user: {
        id: 'expert-1',
        email: 'expert@test.local',
        role: 'developer',
        hasCustomerProfile: true,
        hasExpertProfile: true,
      },
    };

    mockBaseLoad({
      developerProfile: {
        id: 'developer-1',
        displayName: '스튜디오 A',
        type: 'freelancer',
        headline: 'React 전문',
        introduction: '소개',
        skills: ['React'],
        specialties: ['웹앱'],
        supportedProjectTypes: ['브랜드'],
        budgetMin: 1000000,
        budgetMax: 5000000,
        totalCareerYears: 7,
        availabilityStatus: 'available',
        avgResponseHours: 12,
        languages: ['ko'],
        regionCode: 'KR-11',
        active: true,
      },
      inbox: [
        {
          id: 'share-2',
          status: 'sent',
          updatedAt: '2026-04-01T09:00:00.000Z',
          canChat: false,
          canComplete: false,
          projectRequest: { projectName: '커머스 구축' },
        },
      ],
      faqs: [{ id: 'faq-1', question: '질문', answer: '답변', sortOrder: 0 }],
      portfolios: [{ id: 'portfolio-1', description: '설명', sortOrder: 0, imageUrls: [] }],
      receivedReviews: [
        {
          id: 'review-1',
          rating: 5,
          content: '좋은 협업이었습니다.',
          createdAt: '2026-04-01T10:00:00.000Z',
          customer: { name: '고객 A', email: 'customer@test.local' },
        },
      ],
    });

    renderMyPage();

    expect(await screen.findByText('전문가 마이페이지')).toBeInTheDocument();
    expect(screen.getByText('FAQ 관리')).toBeInTheDocument();
    expect(screen.getByText('포트폴리오 관리')).toBeInTheDocument();
    expect(screen.getByText('받은 견적 리스트')).toBeInTheDocument();
    expect(screen.getByText('받은 리뷰')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('start-quote-share-share-2'));

    await waitFor(() => {
      expect(vi.mocked(approveQuoteShareByDeveloper)).toHaveBeenCalledWith('test-token', 'share-2');
    });
  });
});
