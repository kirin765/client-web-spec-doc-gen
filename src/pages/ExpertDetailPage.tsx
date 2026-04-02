import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Send, Star } from 'lucide-react';
import { Seo } from '@/components/seo/Seo';
import { LoadingButton } from '@/components/common/LoadingButton';
import {
  createQuoteShare,
  getDeveloperById,
  listDeveloperFaqs,
  listDeveloperPortfolios,
  listDeveloperReviews,
  listMyProjectRequests,
  listSentQuoteShares,
} from '@/lib/api';
import type {
  DeveloperProfileApi,
  DeveloperReviewsResponse,
  ExpertFaqItem,
  ExpertPortfolioItem,
  ProjectRequestSummary,
} from '@/types/api';
import { formatRange } from '@/lib/utils';
import { useAuthStore } from '@/store/useAuthStore';

function getCareerLevelLabel(level: DeveloperProfileApi['careerLevel']) {
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

export function ExpertDetailPage() {
  const { developerId } = useParams<{ developerId: string }>();
  const token = useAuthStore((state) => state.token);
  const activeMode = useAuthStore((state) => state.activeMode);
  const [developer, setDeveloper] = useState<DeveloperProfileApi | null>(null);
  const [projects, setProjects] = useState<ProjectRequestSummary[]>([]);
  const [faqs, setFaqs] = useState<ExpertFaqItem[]>([]);
  const [portfolios, setPortfolios] = useState<ExpertPortfolioItem[]>([]);
  const [reviews, setReviews] = useState<DeveloperReviewsResponse | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [alreadySentProjectIds, setAlreadySentProjectIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [isSendingQuote, setIsSendingQuote] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!developerId) return;
    setIsLoading(true);
    setErrorMessage(null);

    const fetchAll = async () => {
      try {
        const [profile, nextFaqs, nextPortfolios, nextReviews] = await Promise.all([
          getDeveloperById(developerId),
          listDeveloperFaqs(developerId),
          listDeveloperPortfolios(developerId),
          listDeveloperReviews(developerId),
        ]);
        setDeveloper(profile);
        setFaqs(nextFaqs);
        setPortfolios(nextPortfolios);
        setReviews(nextReviews);

        if (token) {
          const [projectList, shares] = await Promise.all([
            listMyProjectRequests(token),
            listSentQuoteShares(token),
          ]);
          setProjects(projectList.data);
          setAlreadySentProjectIds(new Set(shares.map((share) => share.projectRequestId)));
        }
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : '전문가 정보를 불러오지 못했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    void fetchAll();
  }, [developerId, token]);

  const selectedProject = useMemo(
    () => projects.find((project) => project.id === selectedProjectId) || null,
    [projects, selectedProjectId],
  );

  if (!developerId) {
    return <Navigate to="/experts" replace />;
  }

  return (
    <div className="bg-neutral-50 px-6 py-10">
      <Seo
        title={`${developer?.displayName || '전문가'} 상세 | 웹사이트 견적 자동 생성기`}
        description="전문가 상세 정보를 확인하고 내 견적서를 보낼 수 있습니다."
        noIndex
      />
      <div className="mx-auto max-w-5xl space-y-8">
        <section className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-secondary-100">
          <Link
            to="/experts"
            className="inline-flex items-center gap-1 text-sm font-semibold text-secondary-600 hover:text-secondary-900"
          >
            <ArrowLeft className="h-4 w-4" />
            전문가 목록으로
          </Link>

          {isLoading ? <p className="mt-6 text-secondary-600">불러오는 중...</p> : null}
          {errorMessage ? <p className="mt-6 text-error-600">{errorMessage}</p> : null}

          {developer ? (
            <div className="mt-6 space-y-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-primary-600">전문가 상세</p>
                  <h1 className="mt-1 text-heading-lg font-bold text-secondary-900">{developer.displayName}</h1>
                  <p className="mt-2 text-secondary-600">{developer.headline}</p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    developer.active ? 'bg-success-50 text-success-700' : 'bg-warning-50 text-warning-700'
                  }`}
                >
                  {developer.active ? '활성 전문가' : '승인 대기'}
                </span>
              </div>

              <p className="leading-7 text-secondary-700">
                {developer.introduction || '소개가 아직 등록되지 않았습니다.'}
              </p>

                <div className="grid gap-3 md:grid-cols-3 text-sm text-secondary-600">
                  <div>유형: {developer.type === 'agency' ? '에이전시' : '프리랜서'}</div>
                  <div>예산: {formatRange(developer.budgetMin, developer.budgetMax)}</div>
                  <div>응답 속도: {developer.avgResponseHours}시간</div>
                </div>

              <div className="grid gap-3 text-sm text-secondary-600 md:grid-cols-3">
                <div>
                  경력:{' '}
                  {developer.totalCareerYears != null && developer.careerLevel
                    ? `${developer.totalCareerYears}년 · ${getCareerLevelLabel(developer.careerLevel)}`
                    : '미등록'}
                </div>
                <div>활동 지역: {developer.region?.name || '미설정'}</div>
                <div>FAQ: {developer.faqCount}개</div>
              </div>
              <div className="text-sm text-secondary-600">
                리뷰: {developer.reviewCount}개 / 평균 {developer.reviewAverage.toFixed(1)}점
              </div>

              <div className="flex flex-wrap gap-2">
                {developer.specialties.slice(0, 5).map((specialty) => (
                  <span key={specialty} className="rounded-full bg-secondary-100 px-3 py-1 text-xs font-medium text-secondary-700">
                    {specialty}
                  </span>
                ))}
              </div>
            </div>
          ) : null}
        </section>

        <section className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-secondary-100">
          <h2 className="text-heading-sm font-bold text-secondary-900">내 견적서 1건 보내기</h2>
          {!token ? (
            <p className="mt-3 text-secondary-600">로그인 후 견적서를 보낼 수 있습니다.</p>
          ) : activeMode !== 'customer' ? (
            <p className="mt-3 text-secondary-600">전문가 모드에서는 견적서를 보낼 수 없습니다. 고객 모드로 전환해 주세요.</p>
          ) : projects.length === 0 ? (
            <p className="mt-3 text-secondary-600">
              보낼 수 있는 견적서가 없습니다. 결과 페이지에서 먼저 "내 견적서에 저장"을 눌러 주세요.
            </p>
          ) : (
            <div className="mt-4 space-y-4">
              <select
                value={selectedProjectId}
                onChange={(event) => setSelectedProjectId(event.target.value)}
                data-testid="project-request-select"
                className="w-full rounded-xl border border-secondary-300 px-4 py-3"
              >
                <option value="">견적서를 선택하세요</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.projectName || '이름 없는 견적서'} ({project.siteType || '-'})
                  </option>
                ))}
              </select>

              {selectedProject ? (
                <div className="rounded-xl bg-secondary-50 p-4 text-sm text-secondary-700">
                  <p>선택 견적: {selectedProject.projectName || '이름 없는 견적서'}</p>
                  <p className="mt-1">생성일: {new Date(selectedProject.createdAt).toLocaleDateString('ko-KR')}</p>
                  {alreadySentProjectIds.has(selectedProject.id) ? (
                    <p className="mt-2 inline-flex items-center gap-1 font-semibold text-warning-700">
                      <CheckCircle2 className="h-4 w-4" />
                      이미 이 전문가에게 보낸 견적서입니다.
                    </p>
                  ) : null}
                </div>
              ) : null}

            <LoadingButton
              loading={isSendingQuote}
              loadingLabel="전송 중..."
              data-testid="send-quote-button"
              disabled={
                activeMode !== 'customer' ||
                !selectedProjectId ||
                  alreadySentProjectIds.has(selectedProjectId) ||
                  !developer?.active
                }
                onClick={async () => {
                  if (!token || !selectedProjectId || !developer) return;
                  setIsSendingQuote(true);
                  setSuccessMessage(null);
                  setErrorMessage(null);
                  try {
                    await createQuoteShare(token, {
                      projectRequestId: selectedProjectId,
                      developerId: developer.id,
                    });
                    setAlreadySentProjectIds((current) => new Set([...current, selectedProjectId]));
                    setSuccessMessage('견적서를 전문가에게 보냈습니다.');
                  } catch (error) {
                    setErrorMessage(error instanceof Error ? error.message : '견적서 전송 실패');
                  } finally {
                    setIsSendingQuote(false);
                  }
                }}
                className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-5 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:bg-secondary-300"
              >
                <Send className="h-4 w-4" />
                견적서 보내기
              </LoadingButton>

              {successMessage ? <p className="text-success-700">{successMessage}</p> : null}
              {errorMessage ? <p className="text-error-600">{errorMessage}</p> : null}
            </div>
          )}
        </section>

        <section className="grid gap-8 lg:grid-cols-2">
          <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-secondary-100">
            <h2 className="text-heading-sm font-bold text-secondary-900">FAQ</h2>
            <div className="mt-4 space-y-3">
              {faqs.length === 0 ? (
                <p className="text-sm text-secondary-500">등록된 FAQ가 없습니다.</p>
              ) : (
                faqs.map((faq) => (
                  <article key={faq.id} className="rounded-xl border border-secondary-200 p-4">
                    <p className="font-semibold text-secondary-900">{faq.question}</p>
                    <p className="mt-2 text-sm leading-6 text-secondary-600">{faq.answer}</p>
                  </article>
                ))
              )}
            </div>
          </div>

          <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-secondary-100">
            <h2 className="text-heading-sm font-bold text-secondary-900">리뷰</h2>
            <div className="mt-4 space-y-3">
              {reviews && reviews.items.length > 0 ? (
                reviews.items.map((review) => (
                  <article key={review.id} className="rounded-xl border border-secondary-200 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-semibold text-secondary-900">
                        {review.customer?.name || review.customer?.email || '고객'}
                      </p>
                      <p className="inline-flex items-center gap-1 text-sm font-semibold text-warning-600">
                        <Star className="h-4 w-4 fill-current" />
                        {review.rating}.0
                      </p>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-secondary-600">{review.content}</p>
                  </article>
                ))
              ) : (
                <p className="text-sm text-secondary-500">등록된 리뷰가 없습니다.</p>
              )}
            </div>
          </div>
        </section>

        <section className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-secondary-100">
          <h2 className="text-heading-sm font-bold text-secondary-900">포트폴리오</h2>
          <div className="mt-4 space-y-4">
            {portfolios.length === 0 ? (
              <p className="text-sm text-secondary-500">공개된 포트폴리오가 없습니다.</p>
            ) : (
              portfolios.map((portfolio) => (
                <article key={portfolio.id} className="rounded-2xl border border-secondary-200 p-4">
                  <div className="grid gap-4 md:grid-cols-[1fr,280px]">
                    <p className="text-sm leading-6 text-secondary-700">{portfolio.description}</p>
                    <div className="grid grid-cols-3 gap-2">
                      {portfolio.imageUrls.map((image) => (
                        <img
                          key={image.storageUrl}
                          src={image.url}
                          alt="포트폴리오 이미지"
                          className="h-24 w-full rounded-lg object-cover"
                        />
                      ))}
                    </div>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
