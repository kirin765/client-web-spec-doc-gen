import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CheckCircle2,
  ImagePlus,
  Mail,
  Pencil,
  RefreshCw,
  Save,
  Trash2,
  XCircle,
} from 'lucide-react';
import { Seo } from '@/components/seo/Seo';
import { LoadingButton } from '@/components/common/LoadingButton';
import { RegionSelector } from '@/components/regions/RegionSelector';
import { useAuthStore } from '@/store/useAuthStore';
import {
  ApiError,
  approveQuoteShareByDeveloper,
  cancelQuoteShareByDeveloper,
  completeQuoteShareByDeveloper,
  createMyFaq,
  createMyPortfolio,
  getMyCustomerProfile,
  getMyDeveloperProfile,
  getQuoteShareDetail,
  listInboxQuoteShares,
  listMyFaqs,
  listMyPortfolios,
  listReceivedReviews,
  updateMyFaq,
  updateMyPortfolio,
  uploadImages,
  upsertMyCustomerProfile,
  upsertMyDeveloperProfile,
  deleteMyFaq,
  deleteMyPortfolio,
} from '@/lib/api';
import type {
  CustomerProfileApi,
  ExpertFaqItem,
  ExpertPortfolioItem,
  QuoteShareItem,
  ReviewItem,
  SignedImage,
  UpsertDeveloperProfilePayload,
} from '@/types/api';

function getCareerLevel(totalCareerYears: number | null | undefined) {
  if (!Number.isFinite(totalCareerYears) || totalCareerYears == null || totalCareerYears <= 0) {
    return null;
  }

  if (totalCareerYears <= 3) {
    return 'newcomer';
  }

  if (totalCareerYears <= 9) {
    return 'senior';
  }

  return 'veteran';
}

function getCareerLevelLabel(level: ReturnType<typeof getCareerLevel>) {
  switch (level) {
    case 'newcomer':
      return '신입';
    case 'senior':
      return '시니어';
    case 'veteran':
      return '베테랑';
    default:
      return '미설정';
  }
}

function splitCsv(value: string) {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function joinCsv(items: string[]) {
  return items.join(', ');
}

function formatDate(value: string | null | undefined) {
  if (!value) return '-';

  return new Date(value).toLocaleString('ko-KR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

function getQuoteStatusLabel(status: QuoteShareItem['status']) {
  switch (status) {
    case 'sent':
      return '발송됨';
    case 'in_progress':
      return '진행 중';
    case 'completed':
      return '완료';
    case 'canceled_by_user':
      return '고객 취소';
    case 'canceled_by_developer':
      return '전문가 취소';
    default:
      return status;
  }
}

type CustomerFormState = {
  displayName: string;
  introduction: string;
  regionCode: string;
};

type ExpertFormState = {
  displayName: string;
  type: 'freelancer' | 'agency';
  headline: string;
  introduction: string;
  skills: string;
  specialties: string;
  supportedProjectTypes: string;
  budgetMin: string;
  budgetMax: string;
  totalCareerYears: string;
  availabilityStatus: 'available' | 'busy' | 'limited';
  avgResponseHours: string;
  languages: string;
  regionCode: string;
};

type FaqFormState = {
  id: string | null;
  question: string;
  answer: string;
  sortOrder: string;
};

type PortfolioFormState = {
  id: string | null;
  description: string;
  sortOrder: string;
  existingImages: SignedImage[];
  files: File[];
};

const INITIAL_CUSTOMER_FORM: CustomerFormState = {
  displayName: '',
  introduction: '',
  regionCode: '',
};

const INITIAL_EXPERT_FORM: ExpertFormState = {
  displayName: '',
  type: 'freelancer',
  headline: '',
  introduction: '',
  skills: '',
  specialties: '',
  supportedProjectTypes: '',
  budgetMin: '1000000',
  budgetMax: '5000000',
  totalCareerYears: '',
  availabilityStatus: 'available',
  avgResponseHours: '24',
  languages: 'ko',
  regionCode: '',
};

const INITIAL_FAQ_FORM: FaqFormState = {
  id: null,
  question: '',
  answer: '',
  sortOrder: '0',
};

const INITIAL_PORTFOLIO_FORM: PortfolioFormState = {
  id: null,
  description: '',
  sortOrder: '0',
  existingImages: [],
  files: [],
};

export function MyPage() {
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const activeMode = useAuthStore((state) => state.activeMode);
  const updateUser = useAuthStore((state) => state.updateUser);

  const [customerProfile, setCustomerProfile] = useState<CustomerProfileApi | null>(null);
  const [customerForm, setCustomerForm] = useState<CustomerFormState>(INITIAL_CUSTOMER_FORM);
  const [expertForm, setExpertForm] = useState<ExpertFormState>(INITIAL_EXPERT_FORM);
  const [faqForm, setFaqForm] = useState<FaqFormState>(INITIAL_FAQ_FORM);
  const [portfolioForm, setPortfolioForm] = useState<PortfolioFormState>(INITIAL_PORTFOLIO_FORM);

  const [inbox, setInbox] = useState<QuoteShareItem[]>([]);
  const [faqs, setFaqs] = useState<ExpertFaqItem[]>([]);
  const [portfolios, setPortfolios] = useState<ExpertPortfolioItem[]>([]);
  const [receivedReviews, setReceivedReviews] = useState<ReviewItem[]>([]);
  const [selectedDetail, setSelectedDetail] = useState<QuoteShareItem | null>(null);
  const [selectedDetailLoading, setSelectedDetailLoading] = useState(false);
  const [selectedDetailError, setSelectedDetailError] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isSavingCustomer, setIsSavingCustomer] = useState(false);
  const [isSavingExpert, setIsSavingExpert] = useState(false);
  const [isSavingFaq, setIsSavingFaq] = useState(false);
  const [isSavingPortfolio, setIsSavingPortfolio] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!token) return;

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const [
        nextCustomerProfile,
        nextDeveloperProfile,
        nextInbox,
        nextReceivedReviews,
        nextFaqs,
        nextPortfolios,
      ] = await Promise.all([
        getMyCustomerProfile(token).catch((error) => {
          if (error instanceof ApiError && error.status === 404) return null;
          throw error;
        }),
        getMyDeveloperProfile(token).catch((error) => {
          if (error instanceof ApiError && error.status === 404) return null;
          throw error;
        }),
        listInboxQuoteShares(token).catch((error) => {
          if (error instanceof ApiError && error.status === 404) return [];
          throw error;
        }),
        listReceivedReviews(token).catch((error) => {
          if (error instanceof ApiError && error.status === 404) return [];
          throw error;
        }),
        listMyFaqs(token).catch((error) => {
          if (error instanceof ApiError && error.status === 404) return [];
          throw error;
        }),
        listMyPortfolios(token).catch((error) => {
          if (error instanceof ApiError && error.status === 404) return [];
          throw error;
        }),
      ]);

      setCustomerProfile(nextCustomerProfile);
      if (nextCustomerProfile) {
        setCustomerForm({
          displayName: nextCustomerProfile.displayName,
          introduction: nextCustomerProfile.introduction ?? '',
          regionCode: nextCustomerProfile.regionCode ?? '',
        });
        updateUser({
          hasCustomerProfile: true,
          customerProfileId: nextCustomerProfile.id,
        });
      }

      if (nextDeveloperProfile) {
        setExpertForm({
          displayName: nextDeveloperProfile.displayName,
          type: nextDeveloperProfile.type,
          headline: nextDeveloperProfile.headline,
          introduction: nextDeveloperProfile.introduction ?? '',
          skills: joinCsv(nextDeveloperProfile.skills),
          specialties: joinCsv(nextDeveloperProfile.specialties),
          supportedProjectTypes: joinCsv(nextDeveloperProfile.supportedProjectTypes),
          budgetMin: String(nextDeveloperProfile.budgetMin),
          budgetMax: String(nextDeveloperProfile.budgetMax),
          totalCareerYears:
            nextDeveloperProfile.totalCareerYears == null
              ? ''
              : String(nextDeveloperProfile.totalCareerYears),
          availabilityStatus: nextDeveloperProfile.availabilityStatus,
          avgResponseHours: String(nextDeveloperProfile.avgResponseHours),
          languages: joinCsv(nextDeveloperProfile.languages),
          regionCode: nextDeveloperProfile.regionCode ?? '',
        });
        updateUser({
          hasExpertProfile: true,
          expertProfileId: nextDeveloperProfile.id,
          hasDeveloperProfile: true,
          developerProfileId: nextDeveloperProfile.id,
        });
      }

      setInbox(nextInbox);
      setReceivedReviews(nextReceivedReviews);
      setFaqs(nextFaqs);
      setPortfolios(nextPortfolios);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : '마이페이지를 불러오지 못했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, [token, updateUser]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  if (!token || !user) {
    return null;
  }

  const expertPayload: UpsertDeveloperProfilePayload = {
    displayName: expertForm.displayName,
    type: expertForm.type,
    headline: expertForm.headline,
    introduction: expertForm.introduction,
    skills: splitCsv(expertForm.skills),
    specialties: splitCsv(expertForm.specialties),
    supportedProjectTypes: splitCsv(expertForm.supportedProjectTypes),
    budgetMin: Number(expertForm.budgetMin || 0),
    budgetMax: Number(expertForm.budgetMax || 0),
    totalCareerYears:
      expertForm.totalCareerYears.trim() === '' ? null : Number(expertForm.totalCareerYears),
    availabilityStatus: expertForm.availabilityStatus,
    avgResponseHours: Number(expertForm.avgResponseHours || 24),
    languages: splitCsv(expertForm.languages),
    portfolioLinks: [],
    regionCode: expertForm.regionCode || undefined,
  };
  const expertCareerLevel = getCareerLevel(
    expertForm.totalCareerYears.trim() === '' ? null : Number(expertForm.totalCareerYears),
  );

  const handleViewDetail = async (quoteShareId: string) => {
    if (!token) return;

    setSelectedDetailLoading(true);
    setSelectedDetailError(null);
    setSelectedDetail(null);
    try {
      const detail = await getQuoteShareDetail(token, quoteShareId);
      setSelectedDetail(detail);
    } catch (error) {
      setSelectedDetailError(error instanceof Error ? error.message : '상세 정보를 불러오지 못했습니다.');
    } finally {
      setSelectedDetailLoading(false);
    }
  };

  const handleCustomerSave = async () => {
    if (!token) return;

    setIsSavingCustomer(true);
    setActionMessage(null);
    setErrorMessage(null);

    try {
      const profile = await upsertMyCustomerProfile(token, {
        displayName: customerForm.displayName,
        introduction: customerForm.introduction,
        regionCode: customerForm.regionCode || undefined,
      });

      setCustomerProfile(profile);
      updateUser({
        hasCustomerProfile: true,
        customerProfileId: profile.id,
      });
      setActionMessage('고객 프로필이 저장되었습니다.');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : '고객 프로필 저장에 실패했습니다.');
    } finally {
      setIsSavingCustomer(false);
    }
  };

  const handleExpertSave = async () => {
    if (!token) return;

    setIsSavingExpert(true);
    setActionMessage(null);
    setErrorMessage(null);

    try {
      const profile = await upsertMyDeveloperProfile(token, expertPayload);
      updateUser({
        hasExpertProfile: true,
        expertProfileId: profile.id,
        hasDeveloperProfile: true,
        developerProfileId: profile.id,
      });
      setActionMessage(
        profile.active
          ? '전문가 프로필이 저장되었습니다.'
          : '전문가 프로필이 저장되었습니다. 관리자 승인 후 공개됩니다.',
      );
      await loadData();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : '전문가 프로필 저장에 실패했습니다.');
    } finally {
      setIsSavingExpert(false);
    }
  };

  const handleFaqSave = async () => {
    if (!token) return;

    setIsSavingFaq(true);
    setActionMessage(null);
    setErrorMessage(null);

    try {
      if (faqForm.id) {
        await updateMyFaq(token, faqForm.id, {
          question: faqForm.question,
          answer: faqForm.answer,
          sortOrder: Number(faqForm.sortOrder || 0),
        });
      } else {
        await createMyFaq(token, {
          question: faqForm.question,
          answer: faqForm.answer,
          sortOrder: Number(faqForm.sortOrder || 0),
        });
      }

      setFaqForm(INITIAL_FAQ_FORM);
      setActionMessage('FAQ가 저장되었습니다.');
      await loadData();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'FAQ 저장에 실패했습니다.');
    } finally {
      setIsSavingFaq(false);
    }
  };

  const handlePortfolioSave = async () => {
    if (!token) return;

    setIsSavingPortfolio(true);
    setActionMessage(null);
    setErrorMessage(null);

    try {
      const uploaded = portfolioForm.files.length > 0 ? await uploadImages(token, portfolioForm.files) : null;
      const imageUrls = [
        ...portfolioForm.existingImages.map((image) => image.storageUrl),
        ...(uploaded?.files.map((file) => file.storageUrl) ?? []),
      ];

      if (portfolioForm.id) {
        await updateMyPortfolio(token, portfolioForm.id, {
          description: portfolioForm.description,
          sortOrder: Number(portfolioForm.sortOrder || 0),
          imageUrls,
        });
      } else {
        await createMyPortfolio(token, {
          description: portfolioForm.description,
          sortOrder: Number(portfolioForm.sortOrder || 0),
          imageUrls,
        });
      }

      setPortfolioForm(INITIAL_PORTFOLIO_FORM);
      setActionMessage('포트폴리오가 저장되었습니다.');
      await loadData();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : '포트폴리오 저장에 실패했습니다.');
    } finally {
      setIsSavingPortfolio(false);
    }
  };

  const renderSelectedDetailPanel = () => {
    if (selectedDetailLoading) {
      return (
        <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-secondary-100">
          상세를 불러오는 중...
        </section>
      );
    }

    if (selectedDetailError) {
      return (
        <section className="rounded-2xl border border-error-200 bg-error-50 p-6 text-error-700">
          {selectedDetailError}
        </section>
      );
    }

    if (!selectedDetail) {
      return null;
    }

    const share = selectedDetail;

    return (
      <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-secondary-100">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-heading-md font-bold text-secondary-900">선택한 견적 상세</h2>
            <p className="mt-1 text-body-sm text-secondary-500">
              {share.projectRequest?.projectName || '견적서'} · 생성 {formatDate(share.createdAt)}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setSelectedDetail(null)}
            className="rounded-lg border border-secondary-300 px-3 py-2 text-body-sm font-semibold text-secondary-700"
          >
            닫기
          </button>
        </div>
        <div className="mt-4 space-y-3 text-body-sm text-secondary-700">
          <p>
            상태: <strong>{getQuoteStatusLabel(share.status)}</strong>
          </p>
          <p>프로젝트: {share.projectRequest?.projectName || '견적서'}</p>
          <p>진행 시작: {formatDate(share.startedAt)}</p>
          <p>완료 시각: {formatDate(share.completedAt)}</p>
          <p>고객 연락방법: {share.contactMethod || '아직 공개되지 않았습니다.'}</p>
          {share.counterpartyEmail ? (
            <p className="inline-flex items-center gap-2 rounded-lg bg-success-50 px-3 py-2 text-success-700">
              <Mail className="h-4 w-4" />
              공개 연락 이메일: {share.counterpartyEmail}
            </p>
          ) : null}
        </div>
      </section>
    );
  };

  const renderCustomerMode = () => (
    <>
      <section className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-secondary-100">
        <p className="text-body-sm font-semibold text-primary-600">고객 마이페이지</p>
        <h1 className="mt-2 text-display-sm font-bold text-secondary-900">프로필과 내 견적 흐름 관리</h1>
        <p className="mt-3 text-secondary-600">
          프로필과 활동 지역을 관리할 수 있습니다. 견적 이력과 요청 관리는 `/quotes`에서 확인하세요.
        </p>
      </section>

      <section className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-secondary-100">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-heading-md font-bold text-secondary-900">고객 프로필</h2>
            <p className="mt-1 text-body-sm text-secondary-500">전문가가 참고할 기본 정보와 활동 지역입니다.</p>
            {customerProfile ? (
              <p className="mt-2 text-caption-sm text-secondary-500">
                현재 저장된 지역: {customerProfile.region?.name || '미설정'}
              </p>
            ) : null}
          </div>
          <button
            onClick={() => void loadData()}
            className="inline-flex items-center gap-2 rounded-lg border border-secondary-300 px-4 py-2 text-body-sm font-semibold text-secondary-700"
          >
            <RefreshCw className="h-4 w-4" />
            새로고침
          </button>
        </div>

        <div className="mt-6 grid gap-4">
          <input
            value={customerForm.displayName}
            onChange={(event) =>
              setCustomerForm((prev) => ({ ...prev, displayName: event.target.value }))
            }
            placeholder="이름 또는 닉네임"
            className="rounded-xl border border-secondary-300 px-4 py-3"
          />
          <textarea
            value={customerForm.introduction}
            onChange={(event) =>
              setCustomerForm((prev) => ({ ...prev, introduction: event.target.value }))
            }
            placeholder="프로젝트 스타일이나 협업 방식이 있다면 적어주세요."
            rows={4}
            className="rounded-xl border border-secondary-300 px-4 py-3"
          />
          <RegionSelector
            value={customerForm.regionCode}
            onChange={(value) => setCustomerForm((prev) => ({ ...prev, regionCode: value }))}
            label="활동 지역"
          />
        </div>

        <div className="mt-6">
          <LoadingButton
            type="button"
            loading={isSavingCustomer}
            loadingLabel="저장 중..."
            onClick={() => void handleCustomerSave()}
            className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-5 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:bg-secondary-300"
          >
            <Save className="h-4 w-4" />
            고객 프로필 저장
          </LoadingButton>
        </div>
      </section>

    </>
  );

  const renderExpertMode = () => (
    <>
      <section className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-secondary-100">
        <p className="text-body-sm font-semibold text-primary-600">전문가 마이페이지</p>
        <h1 className="mt-2 text-display-sm font-bold text-secondary-900">프로필, FAQ, 포트폴리오와 받은 견적 관리</h1>
        <p className="mt-3 text-secondary-600">
          진행 중인 견적만 완료 처리할 수 있으며, 완료 이후 고객이 리뷰를 남길 수 있습니다.
        </p>
      </section>

      <section className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-secondary-100">
        <h2 className="text-heading-md font-bold text-secondary-900">전문가 프로필</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <input
            value={expertForm.displayName}
            onChange={(event) => setExpertForm((prev) => ({ ...prev, displayName: event.target.value }))}
            placeholder="이름 또는 회사명"
            className="rounded-xl border border-secondary-300 px-4 py-3"
          />
          <input
            value={expertForm.headline}
            onChange={(event) => setExpertForm((prev) => ({ ...prev, headline: event.target.value }))}
            placeholder="한 줄 소개"
            className="rounded-xl border border-secondary-300 px-4 py-3"
          />
          <select
            value={expertForm.type}
            onChange={(event) =>
              setExpertForm((prev) => ({
                ...prev,
                type: event.target.value as 'freelancer' | 'agency',
              }))
            }
            className="rounded-xl border border-secondary-300 px-4 py-3"
          >
            <option value="freelancer">프리랜서</option>
            <option value="agency">에이전시</option>
          </select>
          <select
            value={expertForm.availabilityStatus}
            onChange={(event) =>
              setExpertForm((prev) => ({
                ...prev,
                availabilityStatus: event.target.value as 'available' | 'busy' | 'limited',
              }))
            }
            className="rounded-xl border border-secondary-300 px-4 py-3"
          >
            <option value="available">가능</option>
            <option value="limited">부분 가능</option>
            <option value="busy">바쁨</option>
          </select>
          <textarea
            value={expertForm.introduction}
            onChange={(event) => setExpertForm((prev) => ({ ...prev, introduction: event.target.value }))}
            placeholder="전문가 소개"
            rows={4}
            className="md:col-span-2 rounded-xl border border-secondary-300 px-4 py-3"
          />
          <input
            value={expertForm.skills}
            onChange={(event) => setExpertForm((prev) => ({ ...prev, skills: event.target.value }))}
            placeholder="기술 스택 (쉼표 구분)"
            className="rounded-xl border border-secondary-300 px-4 py-3"
          />
          <input
            value={expertForm.specialties}
            onChange={(event) =>
              setExpertForm((prev) => ({ ...prev, specialties: event.target.value }))
            }
            placeholder="전문 분야 (쉼표 구분)"
            className="rounded-xl border border-secondary-300 px-4 py-3"
          />
          <input
            value={expertForm.supportedProjectTypes}
            onChange={(event) =>
              setExpertForm((prev) => ({ ...prev, supportedProjectTypes: event.target.value }))
            }
            placeholder="가능 프로젝트 유형 (쉼표 구분)"
            className="rounded-xl border border-secondary-300 px-4 py-3"
          />
          <input
            value={expertForm.languages}
            onChange={(event) => setExpertForm((prev) => ({ ...prev, languages: event.target.value }))}
            placeholder="가능 언어 (쉼표 구분)"
            className="rounded-xl border border-secondary-300 px-4 py-3"
          />
          <input
            value={expertForm.budgetMin}
            onChange={(event) => setExpertForm((prev) => ({ ...prev, budgetMin: event.target.value }))}
            placeholder="최소 예산"
            className="rounded-xl border border-secondary-300 px-4 py-3"
          />
          <input
            value={expertForm.budgetMax}
            onChange={(event) => setExpertForm((prev) => ({ ...prev, budgetMax: event.target.value }))}
            placeholder="최대 예산"
            className="rounded-xl border border-secondary-300 px-4 py-3"
          />
          <div>
            <input
              value={expertForm.totalCareerYears}
              onChange={(event) =>
                setExpertForm((prev) => ({ ...prev, totalCareerYears: event.target.value }))
              }
              placeholder="총 경력 연차"
              className="w-full rounded-xl border border-gray-300 px-4 py-3"
            />
            <p className="mt-2 text-xs text-gray-500">
              자동 분류: {getCareerLevelLabel(expertCareerLevel)} · 1~3년 신입 / 4~9년 시니어 / 10년+
              베테랑
            </p>
          </div>
          <input
            value={expertForm.avgResponseHours}
            onChange={(event) =>
              setExpertForm((prev) => ({ ...prev, avgResponseHours: event.target.value }))
            }
            placeholder="평균 응답시간(시간)"
            className="rounded-xl border border-secondary-300 px-4 py-3"
          />
          <div className="md:col-span-2">
            <RegionSelector
              value={expertForm.regionCode}
              onChange={(value) => setExpertForm((prev) => ({ ...prev, regionCode: value }))}
              label="활동 지역"
            />
          </div>
        </div>

        <div className="mt-6">
          <LoadingButton
            type="button"
            loading={isSavingExpert}
            loadingLabel="저장 중..."
            onClick={() => void handleExpertSave()}
            className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-5 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:bg-secondary-300"
          >
            <Save className="h-4 w-4" />
            전문가 프로필 저장
          </LoadingButton>
        </div>
      </section>

      <section className="grid gap-8 xl:grid-cols-2">
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-secondary-100">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-heading-md font-bold text-secondary-900">FAQ 관리</h2>
            {faqs.length > 0 ? (
              <span className="rounded-full bg-secondary-100 px-3 py-1 text-caption-sm font-semibold text-secondary-600">
                {faqs.length}개
              </span>
            ) : null}
          </div>

          <div className="mt-4 space-y-3">
            <input
              value={faqForm.question}
              onChange={(event) => setFaqForm((prev) => ({ ...prev, question: event.target.value }))}
              placeholder="질문"
              className="w-full rounded-xl border border-secondary-300 px-4 py-3"
            />
            <textarea
              value={faqForm.answer}
              onChange={(event) => setFaqForm((prev) => ({ ...prev, answer: event.target.value }))}
              rows={4}
              placeholder="답변"
              className="w-full rounded-xl border border-secondary-300 px-4 py-3"
            />
            <input
              value={faqForm.sortOrder}
              onChange={(event) => setFaqForm((prev) => ({ ...prev, sortOrder: event.target.value }))}
              placeholder="정렬 순서"
              className="w-full rounded-xl border border-secondary-300 px-4 py-3"
            />
            <div className="flex flex-wrap gap-2">
              <LoadingButton
                type="button"
                loading={isSavingFaq}
                loadingLabel="저장 중..."
                onClick={() => void handleFaqSave()}
                className="inline-flex items-center gap-2 rounded-lg bg-secondary-900 px-4 py-2 text-body-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-secondary-300"
              >
                <Save className="h-4 w-4" />
                {faqForm.id ? 'FAQ 수정' : 'FAQ 추가'}
              </LoadingButton>
              {faqForm.id ? (
                <button
                  type="button"
                  onClick={() => setFaqForm(INITIAL_FAQ_FORM)}
                  className="rounded-lg border border-secondary-300 px-4 py-2 text-body-sm font-semibold text-secondary-700"
                >
                  취소
                </button>
              ) : null}
            </div>
          </div>

          <div className="mt-6 space-y-3">
            {faqs.length === 0 ? (
              <div className="rounded-xl border border-dashed border-secondary-300 p-6 text-center text-secondary-600">
                등록된 FAQ가 없습니다.
              </div>
            ) : (
              faqs.map((faq) => (
                <article key={faq.id} className="rounded-xl border border-secondary-200 p-4">
                  <p className="font-semibold text-secondary-900">{faq.question}</p>
                  <p className="mt-2 text-body-sm leading-6 text-secondary-600">{faq.answer}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setFaqForm({
                          id: faq.id,
                          question: faq.question,
                          answer: faq.answer,
                          sortOrder: String(faq.sortOrder),
                        })
                      }
                      className="inline-flex items-center gap-1 rounded-lg border border-secondary-300 px-3 py-2 text-body-sm font-semibold text-secondary-700"
                    >
                      <Pencil className="h-4 w-4" />
                      수정
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        await deleteMyFaq(token, faq.id);
                        await loadData();
                      }}
                      className="inline-flex items-center gap-1 rounded-lg border border-error-200 px-3 py-2 text-body-sm font-semibold text-error-700"
                    >
                      <Trash2 className="h-4 w-4" />
                      삭제
                    </button>
                  </div>
                </article>
              ))
            )}
          </div>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-secondary-100">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-heading-md font-bold text-secondary-900">포트폴리오 관리</h2>
            {portfolios.length > 0 ? (
              <span className="rounded-full bg-secondary-100 px-3 py-1 text-caption-sm font-semibold text-secondary-600">
                {portfolios.length}개
              </span>
            ) : null}
          </div>

          <div className="mt-4 space-y-3">
            <textarea
              value={portfolioForm.description}
              onChange={(event) =>
                setPortfolioForm((prev) => ({ ...prev, description: event.target.value }))
              }
              rows={4}
              placeholder="포트폴리오 설명"
              className="w-full rounded-xl border border-secondary-300 px-4 py-3"
            />
            <input
              value={portfolioForm.sortOrder}
              onChange={(event) =>
                setPortfolioForm((prev) => ({ ...prev, sortOrder: event.target.value }))
              }
              placeholder="정렬 순서"
              className="w-full rounded-xl border border-secondary-300 px-4 py-3"
            />
            <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-secondary-300 px-4 py-4 text-body-sm text-secondary-600">
              <ImagePlus className="h-4 w-4" />
              사진 업로드
              <input
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={(event) =>
                  setPortfolioForm((prev) => ({
                    ...prev,
                    files: Array.from(event.target.files ?? []),
                  }))
                }
              />
            </label>

            {portfolioForm.existingImages.length > 0 ? (
              <div className="flex flex-wrap gap-3">
                {portfolioForm.existingImages.map((image) => (
                  <div key={image.storageUrl} className="relative">
                    <img
                      src={image.url}
                      alt="기존 포트폴리오 이미지"
                      className="h-20 w-20 rounded-lg object-cover"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setPortfolioForm((prev) => ({
                          ...prev,
                          existingImages: prev.existingImages.filter(
                            (item) => item.storageUrl !== image.storageUrl,
                          ),
                        }))
                      }
                      className="absolute -right-2 -top-2 rounded-full bg-white p-1 shadow"
                    >
                      <XCircle className="h-4 w-4 text-error-600" />
                    </button>
                  </div>
                ))}
              </div>
            ) : null}

            {portfolioForm.files.length > 0 ? (
              <p className="text-body-sm text-secondary-500">
                새 이미지 {portfolioForm.files.length}개가 업로드 대기 중입니다.
              </p>
            ) : null}

            <div className="flex flex-wrap gap-2">
              <LoadingButton
                type="button"
                loading={isSavingPortfolio}
                loadingLabel="저장 중..."
                onClick={() => void handlePortfolioSave()}
                className="inline-flex items-center gap-2 rounded-lg bg-secondary-900 px-4 py-2 text-body-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-secondary-300"
              >
                <Save className="h-4 w-4" />
                {portfolioForm.id ? '포트폴리오 수정' : '포트폴리오 추가'}
              </LoadingButton>
              {portfolioForm.id ? (
                <button
                  type="button"
                  onClick={() => setPortfolioForm(INITIAL_PORTFOLIO_FORM)}
                  className="rounded-lg border border-secondary-300 px-4 py-2 text-body-sm font-semibold text-secondary-700"
                >
                  취소
                </button>
              ) : null}
            </div>
          </div>

          <div className="mt-6 space-y-3">
            {portfolios.length === 0 ? (
              <div className="rounded-xl border border-dashed border-secondary-300 p-6 text-center text-secondary-600">
                등록된 포트폴리오가 없습니다.
              </div>
            ) : (
              portfolios.map((portfolio) => (
                <article key={portfolio.id} className="rounded-xl border border-secondary-200 p-4">
                  <div className="grid gap-4 md:grid-cols-[1fr,220px]">
                    <div>
                      <p className="text-body-sm leading-6 text-secondary-700">{portfolio.description}</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            setPortfolioForm({
                              id: portfolio.id,
                              description: portfolio.description,
                              sortOrder: String(portfolio.sortOrder),
                              existingImages: portfolio.imageUrls,
                              files: [],
                            })
                          }
                          className="inline-flex items-center gap-1 rounded-lg border border-secondary-300 px-3 py-2 text-body-sm font-semibold text-secondary-700"
                        >
                          <Pencil className="h-4 w-4" />
                          수정
                        </button>
                        <button
                          type="button"
                          onClick={async () => {
                            await deleteMyPortfolio(token, portfolio.id);
                            await loadData();
                          }}
                          className="inline-flex items-center gap-1 rounded-lg border border-error-200 px-3 py-2 text-body-sm font-semibold text-error-700"
                        >
                          <Trash2 className="h-4 w-4" />
                          삭제
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {portfolio.imageUrls.slice(0, 3).map((image) => (
                        <img
                          key={image.storageUrl}
                          src={image.url}
                          alt="포트폴리오 이미지"
                          className="h-20 w-full rounded-lg object-cover"
                        />
                      ))}
                    </div>
                  </div>
                </article>
              ))
            )}
          </div>
        </div>
      </section>

      <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-secondary-100">
        <h2 className="text-heading-md font-bold text-secondary-900">받은 견적 리스트</h2>
        <div className="mt-4 space-y-3">
          {inbox.length === 0 ? (
            <div className="rounded-xl border border-dashed border-secondary-300 p-8 text-center text-secondary-600">
              받은 견적이 없습니다.
            </div>
          ) : (
            inbox.map((share) => (
              <article
                key={share.id}
                data-testid={`inbox-quote-share-${share.id}`}
                className="rounded-xl border border-secondary-200 p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-secondary-900">
                      {share.projectRequest?.projectName || '견적서'}
                    </p>
                    <p className="mt-1 text-body-sm text-secondary-500">
                      상태: {getQuoteStatusLabel(share.status)}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => void handleViewDetail(share.id)}
                      className="rounded-lg border border-secondary-300 px-3 py-2 text-body-sm font-semibold text-secondary-700"
                    >
                      상세
                    </button>
                    {share.chatRoomId && share.canChat ? (
                      <Link
                        to={`/chat/${share.chatRoomId}`}
                        data-testid={`open-chat-room-${share.chatRoomId}`}
                        className="rounded-lg bg-primary-600 px-3 py-2 text-body-sm font-semibold text-white"
                      >
                        채팅
                      </Link>
                    ) : null}
                    {share.status === 'sent' ? (
                      <>
                        <button
                          type="button"
                          data-testid={`start-quote-share-${share.id}`}
                          onClick={async () => {
                            await approveQuoteShareByDeveloper(token, share.id);
                            await loadData();
                          }}
                          className="inline-flex items-center gap-1 rounded-lg bg-success-600 px-3 py-2 text-body-sm font-semibold text-white"
                        >
                          <CheckCircle2 className="h-4 w-4" />
                          진행 시작
                        </button>
                        <button
                          type="button"
                          onClick={async () => {
                            await cancelQuoteShareByDeveloper(token, share.id);
                            await loadData();
                          }}
                          className="inline-flex items-center gap-1 rounded-lg border border-error-200 px-3 py-2 text-body-sm font-semibold text-error-700"
                        >
                          <XCircle className="h-4 w-4" />
                          거절
                        </button>
                      </>
                    ) : null}
                    {share.canComplete ? (
                      <button
                        type="button"
                        data-testid={`complete-quote-share-${share.id}`}
                        onClick={async () => {
                          await completeQuoteShareByDeveloper(token, share.id);
                          await loadData();
                        }}
                        className="inline-flex items-center gap-1 rounded-lg bg-secondary-900 px-3 py-2 text-body-sm font-semibold text-white"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        완료 처리
                      </button>
                    ) : null}
                  </div>
                </div>
                <p className="mt-2 text-caption-sm text-secondary-500">업데이트: {formatDate(share.updatedAt)}</p>
              </article>
            ))
          )}
        </div>
      </section>

      <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-secondary-100">
        <h2 className="text-heading-md font-bold text-secondary-900">받은 리뷰</h2>
        <div className="mt-4 space-y-3">
          {receivedReviews.length === 0 ? (
            <div className="rounded-xl border border-dashed border-secondary-300 p-8 text-center text-secondary-600">
              아직 받은 리뷰가 없습니다.
            </div>
          ) : (
            receivedReviews.map((review) => (
              <article key={review.id} className="rounded-xl border border-secondary-200 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold text-secondary-900">
                    {review.customer?.name || review.customer?.email || '고객'}
                  </p>
                  <p className="text-body-sm font-semibold text-amber-600">{'★'.repeat(review.rating)}</p>
                </div>
                <p className="mt-2 text-body-sm leading-6 text-secondary-700">{review.content}</p>
                <p className="mt-3 text-caption-sm text-secondary-500">{formatDate(review.createdAt)}</p>
              </article>
            ))
          )}
        </div>
      </section>
    </>
  );

  return (
    <div className="bg-secondary-50 px-6 py-10">
      <Seo
        title={
          activeMode === 'expert'
            ? '전문가 마이페이지 | 웹사이트 견적 자동 생성기'
            : '고객 마이페이지 | 웹사이트 견적 자동 생성기'
        }
        description="고객과 전문가 모드에 따라 프로필, 견적, 리뷰를 관리합니다."
        noIndex
      />
      <div className="mx-auto max-w-6xl space-y-8">
        {isLoading ? (
          <section className="rounded-2xl bg-white p-8 text-secondary-600 shadow-sm ring-1 ring-secondary-100">
            불러오는 중...
          </section>
        ) : null}

        {actionMessage ? (
          <section className="rounded-2xl border border-success-200 bg-success-50 p-6 text-success-700">
            {actionMessage}
          </section>
        ) : null}

        {errorMessage ? (
          <section className="rounded-2xl border border-error-200 bg-error-50 p-6 text-error-700">
            {errorMessage}
          </section>
        ) : null}

        {!isLoading ? (activeMode === 'expert' ? renderExpertMode() : renderCustomerMode()) : null}

        {renderSelectedDetailPanel()}
      </div>
    </div>
  );
}
