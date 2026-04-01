import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  CheckCircle2,
  ChevronRight,
  ImagePlus,
  Mail,
  Pencil,
  RefreshCw,
  Save,
  Star,
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
  cancelQuoteShareByUser,
  completeQuoteShareByDeveloper,
  createMyFaq,
  createMyPortfolio,
  createReview,
  getMyCustomerProfile,
  getMyDeveloperProfile,
  getMyProjectRequestDetail,
  getQuoteShareDetail,
  listInboxQuoteShares,
  listMyFaqs,
  listMyPortfolios,
  listMyProjectRequests,
  listReceivedReviews,
  listSentQuoteShares,
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
  ProjectRequestDetail,
  QuoteShareItem,
  ReviewItem,
  SignedImage,
  UpsertDeveloperProfilePayload,
} from '@/types/api';
import { formatRange } from '@/lib/utils';

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

type SelectedDetail =
  | { kind: 'project'; data: ProjectRequestDetail }
  | { kind: 'quote'; data: QuoteShareItem };

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

function getProjectStatusLabel(status: string) {
  switch (status) {
    case 'DRAFT':
      return '임시 저장';
    case 'SUBMITTED':
      return '제출됨';
    case 'CALCULATING':
      return '비용 계산 중';
    case 'GENERATING_DOCUMENT':
      return '문서 생성 중';
    case 'MATCHING':
      return '전문가 매칭 중';
    case 'COMPLETED':
      return '완료';
    case 'ARCHIVED':
      return '보관됨';
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

  const [projectRequests, setProjectRequests] = useState<any[]>([]);
  const [sentShares, setSentShares] = useState<QuoteShareItem[]>([]);
  const [inbox, setInbox] = useState<QuoteShareItem[]>([]);
  const [faqs, setFaqs] = useState<ExpertFaqItem[]>([]);
  const [portfolios, setPortfolios] = useState<ExpertPortfolioItem[]>([]);
  const [receivedReviews, setReceivedReviews] = useState<ReviewItem[]>([]);
  const [selectedDetail, setSelectedDetail] = useState<SelectedDetail | null>(null);
  const [selectedDetailLoading, setSelectedDetailLoading] = useState(false);
  const [selectedDetailError, setSelectedDetailError] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isSavingCustomer, setIsSavingCustomer] = useState(false);
  const [isSavingExpert, setIsSavingExpert] = useState(false);
  const [isSavingFaq, setIsSavingFaq] = useState(false);
  const [isSavingPortfolio, setIsSavingPortfolio] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [reviewDrafts, setReviewDrafts] = useState<
    Record<string, { rating: string; content: string }>
  >({});

  const loadData = useCallback(async () => {
    if (!token) return;

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const [
        nextCustomerProfile,
        nextDeveloperProfile,
        nextProjectRequests,
        nextSentShares,
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
        listMyProjectRequests(token),
        listSentQuoteShares(token),
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

      setProjectRequests(nextProjectRequests.data);
      setSentShares(nextSentShares);
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

  const sentCountByProject = useMemo(() => {
    return sentShares.reduce<Record<string, number>>((acc, share) => {
      acc[share.projectRequestId] = (acc[share.projectRequestId] ?? 0) + 1;
      return acc;
    }, {});
  }, [sentShares]);

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
      setSelectedDetail({ kind: 'quote', data: detail });
    } catch (error) {
      setSelectedDetailError(error instanceof Error ? error.message : '상세 정보를 불러오지 못했습니다.');
    } finally {
      setSelectedDetailLoading(false);
    }
  };

  const handleViewProjectDetail = async (projectRequestId: string) => {
    if (!token) return;

    setSelectedDetailLoading(true);
    setSelectedDetailError(null);
    setSelectedDetail(null);

    try {
      const detail = await getMyProjectRequestDetail(token, projectRequestId);
      setSelectedDetail({ kind: 'project', data: detail });
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

  const handleCreateReview = async (quoteShareId: string) => {
    if (!token) return;

    const draft = reviewDrafts[quoteShareId];
    if (!draft) return;

    setActionMessage(null);
    setErrorMessage(null);

    try {
      await createReview(token, {
        quoteShareId,
        rating: Number(draft.rating || 5),
        content: draft.content,
      });

      setReviewDrafts((current) => {
        const next = { ...current };
        delete next[quoteShareId];
        return next;
      });
      setActionMessage('리뷰가 등록되었습니다.');
      await loadData();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : '리뷰 등록에 실패했습니다.');
    }
  };

  const renderSelectedDetailPanel = () => {
    if (selectedDetailLoading) {
      return (
        <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
          상세를 불러오는 중...
        </section>
      );
    }

    if (selectedDetailError) {
      return (
        <section className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-rose-700">
          {selectedDetailError}
        </section>
      );
    }

    if (!selectedDetail) {
      return null;
    }

    if (selectedDetail.kind === 'project') {
      const project = selectedDetail.data;

      return (
        <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900">견적 상세</h2>
              <p className="mt-1 text-sm text-gray-500">
                {project.projectName || '이름 없는 견적서'} · 생성 {formatDate(project.createdAt)}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setSelectedDetail(null)}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-700"
            >
              닫기
            </button>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <section className="rounded-xl border border-gray-200 p-4">
              <h3 className="text-sm font-semibold text-gray-900">프로젝트 정보</h3>
              <div className="mt-3 space-y-2 text-sm text-gray-700">
                <p>상태: {getProjectStatusLabel(project.status)}</p>
                <p>사이트 유형: {project.siteType || '-'}</p>
                <p>연락방법: {project.contactMethod || '-'}</p>
                <p>제출 시각: {formatDate(project.submittedAt)}</p>
                <p>가격 정책 버전: {project.pricingVersion || '-'}</p>
              </div>
            </section>

            <section className="rounded-xl border border-gray-200 p-4">
              <h3 className="text-sm font-semibold text-gray-900">예상 비용</h3>
              {project.costEstimate ? (
                <div className="mt-3 space-y-2 text-sm text-gray-700">
                  <p className="text-lg font-bold text-blue-600">
                    {formatRange(project.costEstimate.totalMin, project.costEstimate.totalMax)}
                  </p>
                  <p>기본 티어: {project.costEstimate.baseTier.id}</p>
                  <p>디자인 승수: ×{project.costEstimate.designMultiplier}</p>
                  <p>일정 승수: ×{project.costEstimate.timelineMultiplier}</p>
                </div>
              ) : (
                <p className="mt-3 text-sm text-gray-500">비용 정보가 아직 없습니다.</p>
              )}
            </section>

            <section className="rounded-xl border border-gray-200 p-4">
              <h3 className="text-sm font-semibold text-gray-900">문서 및 매칭</h3>
              <div className="mt-3 space-y-2 text-sm text-gray-700">
                <p>생성된 문서: {project.documents.length}개</p>
                <p>매칭 결과: {project.matches.length}명</p>
                <p>발송: {project.quoteSharesSummary.sent}건</p>
                <p>진행 중: {project.quoteSharesSummary.inProgress}건</p>
                <p>완료: {project.quoteSharesSummary.completed}건</p>
                <p>취소: {project.quoteSharesSummary.canceled}건</p>
              </div>
            </section>

            <section className="rounded-xl border border-gray-200 p-4">
              <h3 className="text-sm font-semibold text-gray-900">주요 매칭</h3>
              {project.matches.length > 0 ? (
                <ul className="mt-3 space-y-2 text-sm text-gray-700">
                  {project.matches.slice(0, 3).map((match) => (
                    <li key={match.id} className="rounded-lg bg-gray-50 px-3 py-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-medium text-gray-900">
                          {match.developer?.displayName || '전문가'}
                        </span>
                        <span className="text-blue-600">{Math.round(match.score)}점</span>
                      </div>
                      <p className="mt-1 text-xs text-gray-500">
                        {match.developer?.headline || '-'} · {match.status}
                      </p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 text-sm text-gray-500">매칭된 전문가가 없습니다.</p>
              )}
            </section>
          </div>

          <section className="mt-6 rounded-xl border border-gray-200 p-4">
            <h3 className="text-sm font-semibold text-gray-900">원본 답변</h3>
            <pre className="mt-3 max-h-80 overflow-auto rounded-lg bg-gray-50 p-4 text-xs leading-6 text-gray-700">
              {JSON.stringify(project.rawAnswers, null, 2)}
            </pre>
          </section>
        </section>
      );
    }

    const share = selectedDetail.data;

    return (
      <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">선택한 견적 상세</h2>
            <p className="mt-1 text-sm text-gray-500">
              {share.projectRequest?.projectName || '견적서'} · 생성 {formatDate(share.createdAt)}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setSelectedDetail(null)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-700"
          >
            닫기
          </button>
        </div>
        <div className="mt-4 space-y-3 text-sm text-gray-700">
          <p>
            상태: <strong>{getQuoteStatusLabel(share.status)}</strong>
          </p>
          <p>프로젝트: {share.projectRequest?.projectName || '견적서'}</p>
          <p>진행 시작: {formatDate(share.startedAt)}</p>
          <p>완료 시각: {formatDate(share.completedAt)}</p>
          <p>고객 연락방법: {share.contactMethod || '아직 공개되지 않았습니다.'}</p>
          {share.counterpartyEmail ? (
            <p className="inline-flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-emerald-700">
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
      <section className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-gray-100">
        <p className="text-sm font-semibold text-blue-600">고객 마이페이지</p>
        <h1 className="mt-2 text-3xl font-bold text-gray-900">프로필과 내 견적 흐름 관리</h1>
        <p className="mt-3 text-gray-600">
          프로필을 저장하고, 작성한 견적 리스트와 전문가에게 보낸 요청 상태를 확인할 수 있습니다.
        </p>
      </section>

      <section className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-gray-100">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-gray-900">고객 프로필</h2>
            <p className="mt-1 text-sm text-gray-500">전문가가 참고할 기본 정보와 활동 지역입니다.</p>
            {customerProfile ? (
              <p className="mt-2 text-xs text-gray-500">
                현재 저장된 지역: {customerProfile.region?.name || '미설정'}
              </p>
            ) : null}
          </div>
          <button
            onClick={() => void loadData()}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700"
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
            className="rounded-xl border border-gray-300 px-4 py-3"
          />
          <textarea
            value={customerForm.introduction}
            onChange={(event) =>
              setCustomerForm((prev) => ({ ...prev, introduction: event.target.value }))
            }
            placeholder="프로젝트 스타일이나 협업 방식이 있다면 적어주세요."
            rows={4}
            className="rounded-xl border border-gray-300 px-4 py-3"
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
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            <Save className="h-4 w-4" />
            고객 프로필 저장
          </LoadingButton>
        </div>
      </section>

      <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
        <h2 className="text-xl font-bold text-gray-900">작성한 견적 리스트</h2>
        <div className="mt-4 space-y-3">
          {projectRequests.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-300 p-8 text-center text-gray-600">
              아직 저장된 견적서가 없습니다.
            </div>
          ) : (
            projectRequests.map((project) => (
              <button
                key={project.id}
                type="button"
                onClick={() => void handleViewProjectDetail(project.id)}
                aria-pressed={selectedDetail?.kind === 'project' && selectedDetail.data.id === project.id}
                className={`w-full rounded-xl border p-4 text-left transition hover:border-blue-300 hover:bg-blue-50/40 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  selectedDetail?.kind === 'project' && selectedDetail.data.id === project.id
                    ? 'border-blue-300 bg-blue-50/60'
                    : 'border-gray-200'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900">
                      {project.projectName || '이름 없는 견적서'}
                    </p>
                    <p className="mt-1 text-sm text-gray-500">
                      {project.siteType || '-'} · 연락방법: {project.contactMethod || '미입력'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                      발송 {sentCountByProject[project.id] ?? 0}건
                    </span>
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </section>

      <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
        <h2 className="text-xl font-bold text-gray-900">견적 요청 리스트</h2>
        <div className="mt-4 space-y-3">
          {sentShares.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-300 p-8 text-center text-gray-600">
              아직 전문가에게 보낸 견적이 없습니다.
            </div>
          ) : (
            sentShares.map((share) => {
              const draft = reviewDrafts[share.id] ?? { rating: '5', content: '' };

              return (
                <article key={share.id} className="rounded-xl border border-gray-200 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-gray-900">
                        {share.projectRequest?.projectName || '견적서'}
                      </p>
                      <p className="mt-1 text-sm text-gray-500">
                        전문가: {share.developer?.displayName || '-'} · 상태: {getQuoteStatusLabel(share.status)}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => void handleViewDetail(share.id)}
                        className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-700"
                      >
                        상세
                      </button>
                      {share.status === 'sent' ? (
                        <button
                          type="button"
                          onClick={async () => {
                            await cancelQuoteShareByUser(token, share.id);
                            await loadData();
                          }}
                          className="inline-flex items-center gap-1 rounded-lg border border-rose-200 px-3 py-2 text-sm font-semibold text-rose-700"
                        >
                          <XCircle className="h-4 w-4" />
                          취소
                        </button>
                      ) : null}
                    </div>
                  </div>

                  <p className="mt-3 text-sm text-gray-600">
                    내 연락방법: {share.contactMethod || '미입력'}
                  </p>

                  {share.canReview ? (
                    <div className="mt-4 rounded-xl bg-amber-50 p-4">
                      <p className="text-sm font-semibold text-amber-900">완료된 견적입니다. 리뷰를 남겨주세요.</p>
                      <div className="mt-3 grid gap-3 md:grid-cols-[120px,1fr]">
                        <select
                          value={draft.rating}
                          onChange={(event) =>
                            setReviewDrafts((current) => ({
                              ...current,
                              [share.id]: { ...draft, rating: event.target.value },
                            }))
                          }
                          className="rounded-xl border border-amber-200 px-4 py-3"
                        >
                          {[5, 4, 3, 2, 1].map((rating) => (
                            <option key={rating} value={String(rating)}>
                              {rating}점
                            </option>
                          ))}
                        </select>
                        <textarea
                          value={draft.content}
                          onChange={(event) =>
                            setReviewDrafts((current) => ({
                              ...current,
                              [share.id]: { ...draft, content: event.target.value },
                            }))
                          }
                          rows={3}
                          placeholder="협업 경험과 결과를 간단히 남겨주세요."
                          className="rounded-xl border border-amber-200 px-4 py-3"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => void handleCreateReview(share.id)}
                        className="mt-3 inline-flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-white"
                      >
                        <Star className="h-4 w-4" />
                        리뷰 등록
                      </button>
                    </div>
                  ) : null}
                </article>
              );
            })
          )}
        </div>
      </section>
    </>
  );

  const renderExpertMode = () => (
    <>
      <section className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-gray-100">
        <p className="text-sm font-semibold text-blue-600">전문가 마이페이지</p>
        <h1 className="mt-2 text-3xl font-bold text-gray-900">프로필, FAQ, 포트폴리오와 받은 견적 관리</h1>
        <p className="mt-3 text-gray-600">
          진행 중인 견적만 완료 처리할 수 있으며, 완료 이후 고객이 리뷰를 남길 수 있습니다.
        </p>
      </section>

      <section className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-gray-100">
        <h2 className="text-xl font-bold text-gray-900">전문가 프로필</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <input
            value={expertForm.displayName}
            onChange={(event) => setExpertForm((prev) => ({ ...prev, displayName: event.target.value }))}
            placeholder="이름 또는 회사명"
            className="rounded-xl border border-gray-300 px-4 py-3"
          />
          <input
            value={expertForm.headline}
            onChange={(event) => setExpertForm((prev) => ({ ...prev, headline: event.target.value }))}
            placeholder="한 줄 소개"
            className="rounded-xl border border-gray-300 px-4 py-3"
          />
          <select
            value={expertForm.type}
            onChange={(event) =>
              setExpertForm((prev) => ({
                ...prev,
                type: event.target.value as 'freelancer' | 'agency',
              }))
            }
            className="rounded-xl border border-gray-300 px-4 py-3"
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
            className="rounded-xl border border-gray-300 px-4 py-3"
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
            className="md:col-span-2 rounded-xl border border-gray-300 px-4 py-3"
          />
          <input
            value={expertForm.skills}
            onChange={(event) => setExpertForm((prev) => ({ ...prev, skills: event.target.value }))}
            placeholder="기술 스택 (쉼표 구분)"
            className="rounded-xl border border-gray-300 px-4 py-3"
          />
          <input
            value={expertForm.specialties}
            onChange={(event) =>
              setExpertForm((prev) => ({ ...prev, specialties: event.target.value }))
            }
            placeholder="전문 분야 (쉼표 구분)"
            className="rounded-xl border border-gray-300 px-4 py-3"
          />
          <input
            value={expertForm.supportedProjectTypes}
            onChange={(event) =>
              setExpertForm((prev) => ({ ...prev, supportedProjectTypes: event.target.value }))
            }
            placeholder="가능 프로젝트 유형 (쉼표 구분)"
            className="rounded-xl border border-gray-300 px-4 py-3"
          />
          <input
            value={expertForm.languages}
            onChange={(event) => setExpertForm((prev) => ({ ...prev, languages: event.target.value }))}
            placeholder="가능 언어 (쉼표 구분)"
            className="rounded-xl border border-gray-300 px-4 py-3"
          />
          <input
            value={expertForm.budgetMin}
            onChange={(event) => setExpertForm((prev) => ({ ...prev, budgetMin: event.target.value }))}
            placeholder="최소 예산"
            className="rounded-xl border border-gray-300 px-4 py-3"
          />
          <input
            value={expertForm.budgetMax}
            onChange={(event) => setExpertForm((prev) => ({ ...prev, budgetMax: event.target.value }))}
            placeholder="최대 예산"
            className="rounded-xl border border-gray-300 px-4 py-3"
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
            className="rounded-xl border border-gray-300 px-4 py-3"
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
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            <Save className="h-4 w-4" />
            전문가 프로필 저장
          </LoadingButton>
        </div>
      </section>

      <section className="grid gap-8 xl:grid-cols-2">
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-xl font-bold text-gray-900">FAQ 관리</h2>
            {faqs.length > 0 ? (
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                {faqs.length}개
              </span>
            ) : null}
          </div>

          <div className="mt-4 space-y-3">
            <input
              value={faqForm.question}
              onChange={(event) => setFaqForm((prev) => ({ ...prev, question: event.target.value }))}
              placeholder="질문"
              className="w-full rounded-xl border border-gray-300 px-4 py-3"
            />
            <textarea
              value={faqForm.answer}
              onChange={(event) => setFaqForm((prev) => ({ ...prev, answer: event.target.value }))}
              rows={4}
              placeholder="답변"
              className="w-full rounded-xl border border-gray-300 px-4 py-3"
            />
            <input
              value={faqForm.sortOrder}
              onChange={(event) => setFaqForm((prev) => ({ ...prev, sortOrder: event.target.value }))}
              placeholder="정렬 순서"
              className="w-full rounded-xl border border-gray-300 px-4 py-3"
            />
            <div className="flex flex-wrap gap-2">
              <LoadingButton
                type="button"
                loading={isSavingFaq}
                loadingLabel="저장 중..."
                onClick={() => void handleFaqSave()}
                className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-gray-300"
              >
                <Save className="h-4 w-4" />
                {faqForm.id ? 'FAQ 수정' : 'FAQ 추가'}
              </LoadingButton>
              {faqForm.id ? (
                <button
                  type="button"
                  onClick={() => setFaqForm(INITIAL_FAQ_FORM)}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700"
                >
                  취소
                </button>
              ) : null}
            </div>
          </div>

          <div className="mt-6 space-y-3">
            {faqs.length === 0 ? (
              <div className="rounded-xl border border-dashed border-gray-300 p-6 text-center text-gray-600">
                등록된 FAQ가 없습니다.
              </div>
            ) : (
              faqs.map((faq) => (
                <article key={faq.id} className="rounded-xl border border-gray-200 p-4">
                  <p className="font-semibold text-gray-900">{faq.question}</p>
                  <p className="mt-2 text-sm leading-6 text-gray-600">{faq.answer}</p>
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
                      className="inline-flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-700"
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
                      className="inline-flex items-center gap-1 rounded-lg border border-rose-200 px-3 py-2 text-sm font-semibold text-rose-700"
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

        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-xl font-bold text-gray-900">포트폴리오 관리</h2>
            {portfolios.length > 0 ? (
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
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
              className="w-full rounded-xl border border-gray-300 px-4 py-3"
            />
            <input
              value={portfolioForm.sortOrder}
              onChange={(event) =>
                setPortfolioForm((prev) => ({ ...prev, sortOrder: event.target.value }))
              }
              placeholder="정렬 순서"
              className="w-full rounded-xl border border-gray-300 px-4 py-3"
            />
            <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-gray-300 px-4 py-4 text-sm text-gray-600">
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
                      <XCircle className="h-4 w-4 text-rose-600" />
                    </button>
                  </div>
                ))}
              </div>
            ) : null}

            {portfolioForm.files.length > 0 ? (
              <p className="text-sm text-gray-500">
                새 이미지 {portfolioForm.files.length}개가 업로드 대기 중입니다.
              </p>
            ) : null}

            <div className="flex flex-wrap gap-2">
              <LoadingButton
                type="button"
                loading={isSavingPortfolio}
                loadingLabel="저장 중..."
                onClick={() => void handlePortfolioSave()}
                className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-gray-300"
              >
                <Save className="h-4 w-4" />
                {portfolioForm.id ? '포트폴리오 수정' : '포트폴리오 추가'}
              </LoadingButton>
              {portfolioForm.id ? (
                <button
                  type="button"
                  onClick={() => setPortfolioForm(INITIAL_PORTFOLIO_FORM)}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700"
                >
                  취소
                </button>
              ) : null}
            </div>
          </div>

          <div className="mt-6 space-y-3">
            {portfolios.length === 0 ? (
              <div className="rounded-xl border border-dashed border-gray-300 p-6 text-center text-gray-600">
                등록된 포트폴리오가 없습니다.
              </div>
            ) : (
              portfolios.map((portfolio) => (
                <article key={portfolio.id} className="rounded-xl border border-gray-200 p-4">
                  <div className="grid gap-4 md:grid-cols-[1fr,220px]">
                    <div>
                      <p className="text-sm leading-6 text-gray-700">{portfolio.description}</p>
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
                          className="inline-flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-700"
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
                          className="inline-flex items-center gap-1 rounded-lg border border-rose-200 px-3 py-2 text-sm font-semibold text-rose-700"
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

      <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
        <h2 className="text-xl font-bold text-gray-900">받은 견적 리스트</h2>
        <div className="mt-4 space-y-3">
          {inbox.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-300 p-8 text-center text-gray-600">
              받은 견적이 없습니다.
            </div>
          ) : (
            inbox.map((share) => (
              <article key={share.id} className="rounded-xl border border-gray-200 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-gray-900">
                      {share.projectRequest?.projectName || '견적서'}
                    </p>
                    <p className="mt-1 text-sm text-gray-500">
                      상태: {getQuoteStatusLabel(share.status)}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => void handleViewDetail(share.id)}
                      className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-700"
                    >
                      상세
                    </button>
                    {share.status === 'sent' ? (
                      <>
                        <button
                          type="button"
                          onClick={async () => {
                            await approveQuoteShareByDeveloper(token, share.id);
                            await loadData();
                          }}
                          className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white"
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
                          className="inline-flex items-center gap-1 rounded-lg border border-rose-200 px-3 py-2 text-sm font-semibold text-rose-700"
                        >
                          <XCircle className="h-4 w-4" />
                          거절
                        </button>
                      </>
                    ) : null}
                    {share.canComplete ? (
                      <button
                        type="button"
                        onClick={async () => {
                          await completeQuoteShareByDeveloper(token, share.id);
                          await loadData();
                        }}
                        className="inline-flex items-center gap-1 rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        완료 처리
                      </button>
                    ) : null}
                  </div>
                </div>
                <p className="mt-2 text-xs text-gray-500">업데이트: {formatDate(share.updatedAt)}</p>
              </article>
            ))
          )}
        </div>
      </section>

      <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
        <h2 className="text-xl font-bold text-gray-900">받은 리뷰</h2>
        <div className="mt-4 space-y-3">
          {receivedReviews.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-300 p-8 text-center text-gray-600">
              아직 받은 리뷰가 없습니다.
            </div>
          ) : (
            receivedReviews.map((review) => (
              <article key={review.id} className="rounded-xl border border-gray-200 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold text-gray-900">
                    {review.customer?.name || review.customer?.email || '고객'}
                  </p>
                  <p className="text-sm font-semibold text-amber-600">{'★'.repeat(review.rating)}</p>
                </div>
                <p className="mt-2 text-sm leading-6 text-gray-700">{review.content}</p>
                <p className="mt-3 text-xs text-gray-500">{formatDate(review.createdAt)}</p>
              </article>
            ))
          )}
        </div>
      </section>
    </>
  );

  return (
    <div className="bg-gray-50 px-6 py-10">
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
          <section className="rounded-2xl bg-white p-8 text-gray-600 shadow-sm ring-1 ring-gray-100">
            불러오는 중...
          </section>
        ) : null}

        {actionMessage ? (
          <section className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-emerald-700">
            {actionMessage}
          </section>
        ) : null}

        {errorMessage ? (
          <section className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-rose-700">
            {errorMessage}
          </section>
        ) : null}

        {!isLoading ? (activeMode === 'expert' ? renderExpertMode() : renderCustomerMode()) : null}

        {renderSelectedDetailPanel()}
      </div>
    </div>
  );
}
