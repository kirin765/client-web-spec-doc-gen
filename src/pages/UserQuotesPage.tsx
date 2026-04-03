import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { FileText, Mail, RefreshCw, SendHorizontal, XCircle } from 'lucide-react';
import { Seo } from '@/components/seo/Seo';
import { LoadingButton } from '@/components/common/LoadingButton';
import {
  cancelQuoteShareByUser,
  getMyProjectRequestDetail,
  getQuoteShareDetail,
  listMyProjectRequests,
  listSentQuoteShares,
} from '@/lib/api';
import type { ProjectRequestDetail, ProjectRequestSummary, QuoteShareItem } from '@/types/api';
import { useAuthStore } from '@/store/useAuthStore';
import { formatRange } from '@/lib/utils';

function formatDate(value: string | null | undefined) {
  if (!value) return '-';
  return new Date(value).toLocaleString('ko-KR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

function toStatusLabel(status: QuoteShareItem['status']) {
  if (status === 'completed') return '완료';
  if (status === 'in_progress') return '진행 중';
  if (status === 'sent') return '전송됨';
  if (status === 'canceled_by_user') return '사용자 취소';
  return '전문가 취소';
}

function toProjectStatusLabel(status: string) {
  if (status === 'DRAFT') return '임시 저장';
  if (status === 'SUBMITTED') return '제출됨';
  if (status === 'CALCULATING') return '비용 계산 중';
  if (status === 'GENERATING_DOCUMENT') return '문서 생성 중';
  if (status === 'MATCHING') return '전문가 매칭 중';
  if (status === 'COMPLETED') return '완료';
  if (status === 'ARCHIVED') return '보관됨';
  return status;
}

export function UserQuotesPage() {
  const token = useAuthStore((state) => state.token);
  const activeMode = useAuthStore((state) => state.activeMode);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loadingProjectDetailId, setLoadingProjectDetailId] = useState<string | null>(null);
  const [loadingDetailId, setLoadingDetailId] = useState<string | null>(null);
  const [cancelingShareId, setCancelingShareId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [projectRequests, setProjectRequests] = useState<ProjectRequestSummary[]>([]);
  const [sentShares, setSentShares] = useState<QuoteShareItem[]>([]);
  const [selectedProjectDetail, setSelectedProjectDetail] = useState<ProjectRequestDetail | null>(null);
  const [selectedDetail, setSelectedDetail] = useState<QuoteShareItem | null>(null);

  const loadData = useCallback(async () => {
    if (!token) return;

    setIsLoading(true);
    setErrorMessage(null);
    try {
      const [projectList, shares] = await Promise.all([
        listMyProjectRequests(token),
        listSentQuoteShares(token),
      ]);
      setProjectRequests(projectList.data);
      setSentShares(shares);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : '데이터를 불러오지 못했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const sentCountByProject = useMemo(() => {
    return sentShares.reduce<Record<string, number>>((acc, share) => {
      acc[share.projectRequestId] = (acc[share.projectRequestId] ?? 0) + 1;
      return acc;
    }, {});
  }, [sentShares]);

  if (!token) return null;
  if (activeMode === 'expert') {
    return <Navigate to="/mypage" replace />;
  }

  return (
    <div className="bg-neutral-50 px-6 py-10">
      <Seo
        title="내 견적서 | 웹사이트 견적 자동 생성기"
        description="내가 만든 견적서와 전문가 발송 상태를 확인합니다."
        noIndex
      />
      <div className="mx-auto max-w-6xl space-y-8">
        <section className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-secondary-100">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-caption-sm font-semibold text-primary-600">사용자 견적서</p>
              <h1 className="mt-2 text-heading-lg font-bold text-secondary-900">내가 만든 견적서 목록</h1>
              <p className="mt-3 text-secondary-600">
                전문가에게 보낸 견적 상태와 내가 남긴 연락방법, 완료 여부를 확인할 수 있습니다.
              </p>
            </div>
            <LoadingButton
              loading={isRefreshing}
              loadingLabel="새로고침 중..."
              onClick={async () => {
                setIsRefreshing(true);
                try {
                  await loadData();
                } finally {
                  setIsRefreshing(false);
                }
              }}
              className="inline-flex items-center gap-2 rounded-lg border border-secondary-300 px-4 py-2 font-semibold text-secondary-700"
            >
              <RefreshCw className="h-4 w-4" />
              새로고침
            </LoadingButton>
          </div>
        </section>

        {isLoading ? (
          <section className="rounded-2xl bg-white p-8 text-secondary-600 shadow-sm ring-1 ring-secondary-100">
            불러오는 중...
          </section>
        ) : null}

        {errorMessage ? (
          <section className="rounded-2xl border border-error-200 bg-error-50 p-6 text-error-700">
            {errorMessage}
          </section>
        ) : null}

        <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-secondary-100">
          <h2 className="text-heading-sm font-bold text-secondary-900">내 견적서</h2>
          <div className="mt-4 space-y-3">
            {projectRequests.length === 0 ? (
              <div className="rounded-xl border border-dashed border-secondary-300 p-8 text-center text-secondary-600">
                아직 저장된 견적서가 없습니다. 결과 페이지에서 "내 견적서에 저장"을 눌러 주세요.
              </div>
            ) : (
              projectRequests.map((project) => (
                <article key={project.id} className="rounded-xl border border-secondary-200 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-secondary-900">
                        {project.projectName || '이름 없는 견적서'}
                      </p>
                      <p className="mt-1 text-body-sm text-secondary-500">
                        {project.siteType || '-'} · 생성 {formatDate(project.createdAt)} · 연락방법:{' '}
                        {project.contactMethod || '미입력'}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-primary-50 px-3 py-1 text-caption-sm font-semibold text-primary-700">
                        발송 {sentCountByProject[project.id] ?? 0}건
                      </span>
                      <LoadingButton
                        loading={loadingProjectDetailId === project.id}
                        loadingLabel="불러오는 중..."
                        onClick={async () => {
                          if (!token) return;
                          setLoadingProjectDetailId(project.id);
                          try {
                            const detail = await getMyProjectRequestDetail(token, project.id);
                            setSelectedProjectDetail(detail);
                          } finally {
                            setLoadingProjectDetailId(null);
                          }
                        }}
                        className="inline-flex items-center gap-1 rounded-lg border border-secondary-300 px-3 py-2 text-body-sm font-semibold text-secondary-700"
                      >
                        <FileText className="h-4 w-4" />
                        상세
                      </LoadingButton>
                    </div>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>

        {selectedProjectDetail ? (
          <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-secondary-100">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="text-heading-sm font-bold text-secondary-900">저장한 견적서 상세</h2>
                <p className="mt-1 text-body-sm text-secondary-500">
                  {selectedProjectDetail.projectName || '이름 없는 견적서'} · 생성{' '}
                  {formatDate(selectedProjectDetail.createdAt)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedProjectDetail(null)}
                className="rounded-lg border border-secondary-300 px-3 py-2 text-body-sm font-semibold text-secondary-700"
              >
                닫기
              </button>
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-2">
              <section className="rounded-xl border border-secondary-200 p-4">
                <h3 className="text-body-sm font-semibold text-secondary-900">프로젝트 정보</h3>
                <div className="mt-3 space-y-2 text-body-sm text-secondary-700">
                  <p>상태: {toProjectStatusLabel(selectedProjectDetail.status)}</p>
                  <p>사이트 유형: {selectedProjectDetail.siteType || '-'}</p>
                  <p>연락방법: {selectedProjectDetail.contactMethod || '-'}</p>
                  <p>제출 시각: {formatDate(selectedProjectDetail.submittedAt)}</p>
                  <p>가격 정책 버전: {selectedProjectDetail.pricingVersion || '-'}</p>
                </div>
              </section>

              <section className="rounded-xl border border-secondary-200 p-4">
                <h3 className="text-body-sm font-semibold text-secondary-900">예상 비용</h3>
                {selectedProjectDetail.costEstimate ? (
                  <div className="mt-3 space-y-2 text-body-sm text-secondary-700">
                    <p className="text-body-lg font-bold text-primary-600">
                      {formatRange(
                        selectedProjectDetail.costEstimate.totalMin,
                        selectedProjectDetail.costEstimate.totalMax,
                      )}
                    </p>
                    <p>기본 티어: {selectedProjectDetail.costEstimate.baseTier.id}</p>
                    <p>디자인 승수: ×{selectedProjectDetail.costEstimate.designMultiplier}</p>
                    <p>일정 승수: ×{selectedProjectDetail.costEstimate.timelineMultiplier}</p>
                  </div>
                ) : (
                  <p className="mt-3 text-body-sm text-secondary-500">비용 정보가 아직 없습니다.</p>
                )}
              </section>

              <section className="rounded-xl border border-secondary-200 p-4">
                <h3 className="text-body-sm font-semibold text-secondary-900">문서 및 매칭</h3>
                <div className="mt-3 space-y-2 text-body-sm text-secondary-700">
                  <p>생성된 문서: {selectedProjectDetail.documents.length}개</p>
                  <p>매칭 결과: {selectedProjectDetail.matches.length}명</p>
                  <p>발송: {selectedProjectDetail.quoteSharesSummary.sent}건</p>
                  <p>진행 중: {selectedProjectDetail.quoteSharesSummary.inProgress}건</p>
                  <p>완료: {selectedProjectDetail.quoteSharesSummary.completed}건</p>
                  <p>취소: {selectedProjectDetail.quoteSharesSummary.canceled}건</p>
                </div>
              </section>

              <section className="rounded-xl border border-secondary-200 p-4">
                <h3 className="text-body-sm font-semibold text-secondary-900">정리된 요구사항</h3>
                <pre className="mt-3 max-h-64 overflow-auto rounded-lg bg-secondary-50 p-4 text-caption-sm leading-6 text-secondary-700">
                  {JSON.stringify(selectedProjectDetail.normalizedSpec ?? {}, null, 2)}
                </pre>
              </section>
            </div>

            <section className="mt-6 rounded-xl border border-secondary-200 p-4">
              <h3 className="text-body-sm font-semibold text-secondary-900">원본 답변</h3>
              <pre className="mt-3 max-h-80 overflow-auto rounded-lg bg-secondary-50 p-4 text-caption-sm leading-6 text-secondary-700">
                {JSON.stringify(selectedProjectDetail.rawAnswers ?? {}, null, 2)}
              </pre>
            </section>
          </section>
        ) : null}

        <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-secondary-100">
          <h2 className="text-heading-sm font-bold text-secondary-900">보낸 견적서</h2>
          <div className="mt-4 space-y-3">
            {sentShares.length === 0 ? (
              <div className="rounded-xl border border-dashed border-secondary-300 p-8 text-center text-secondary-600">
                아직 전문가에게 보낸 견적서가 없습니다.
              </div>
            ) : (
              sentShares.map((share) => (
                <article key={share.id} className="rounded-xl border border-secondary-200 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-secondary-900">
                        {share.projectRequest?.projectName || '견적서'}
                      </p>
                      <p className="mt-1 text-body-sm text-secondary-500">
                        전문가: {share.developer?.displayName || '-'} · 상태: {toStatusLabel(share.status)}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <LoadingButton
                        loading={loadingDetailId === share.id}
                        loadingLabel="불러오는 중..."
                        onClick={async () => {
                          if (!token) return;
                          setLoadingDetailId(share.id);
                          try {
                            const detail = await getQuoteShareDetail(token, share.id);
                            setSelectedDetail(detail);
                          } finally {
                            setLoadingDetailId(null);
                          }
                        }}
                        className="inline-flex items-center gap-1 rounded-lg border border-secondary-300 px-3 py-2 text-body-sm font-semibold text-secondary-700"
                      >
                        <FileText className="h-4 w-4" />
                        상세
                      </LoadingButton>
                      {share.status === 'sent' ? (
                        <LoadingButton
                          loading={cancelingShareId === share.id}
                          loadingLabel="취소 중..."
                          onClick={async () => {
                            if (!token) return;
                            setCancelingShareId(share.id);
                            try {
                              await cancelQuoteShareByUser(token, share.id);
                              await loadData();
                            } finally {
                              setCancelingShareId(null);
                            }
                          }}
                          className="inline-flex items-center gap-1 rounded-lg border border-error-200 px-3 py-2 text-body-sm font-semibold text-error-700"
                        >
                          <XCircle className="h-4 w-4" />
                          취소
                        </LoadingButton>
                      ) : null}
                    </div>
                  </div>
                  <p className="mt-2 text-caption-sm text-secondary-500">업데이트: {formatDate(share.updatedAt)}</p>
                </article>
              ))
            )}
          </div>
        </section>

        {selectedDetail ? (
          <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-secondary-100">
            <h2 className="text-heading-sm font-bold text-secondary-900">견적서 상세</h2>
            <div className="mt-4 space-y-3 text-body-sm text-secondary-700">
              <p>
                상태: <strong>{toStatusLabel(selectedDetail.status)}</strong>
              </p>
              <p>전문가: {selectedDetail.developer?.displayName || '-'}</p>
              <p>진행 시작: {formatDate(selectedDetail.startedAt)}</p>
              <p>완료 시각: {formatDate(selectedDetail.completedAt)}</p>
              <p>내 연락방법: {selectedDetail.contactMethod || '미입력'}</p>
              {selectedDetail.counterpartyEmail ? (
                <p className="inline-flex items-center gap-2 rounded-lg bg-success-50 px-3 py-2 text-success-700">
                  <Mail className="h-4 w-4" />
                  전문가 Gmail: {selectedDetail.counterpartyEmail}
                </p>
              ) : (
                <p className="text-secondary-500">
                  아직 진행이 시작되지 않아 전문가 Gmail이 노출되지 않습니다.
                </p>
              )}
            </div>
            <div className="mt-4">
              <Link
                to={`/experts/${selectedDetail.developerId}`}
                className="inline-flex items-center gap-2 rounded-lg border border-secondary-300 px-4 py-2 text-body-sm font-semibold text-secondary-700"
              >
                <SendHorizontal className="h-4 w-4" />
                전문가 상세 보기
              </Link>
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
}
