import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Mail, RefreshCw, SendHorizontal, XCircle } from 'lucide-react';
import { Seo } from '@/components/seo/Seo';
import {
  cancelQuoteShareByUser,
  getQuoteShareDetail,
  listMyProjectRequests,
  listSentQuoteShares,
} from '@/lib/api';
import type { ProjectRequestSummary, QuoteShareItem } from '@/types/api';
import { useAuthStore } from '@/store/useAuthStore';

function formatDate(value: string | null | undefined) {
  if (!value) return '-';
  return new Date(value).toLocaleString('ko-KR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

function toStatusLabel(status: QuoteShareItem['status']) {
  if (status === 'approved') return '승인됨';
  if (status === 'sent') return '전송됨';
  if (status === 'canceled_by_user') return '사용자 취소';
  return '전문가 취소';
}

export function UserQuotesPage() {
  const token = useAuthStore((state) => state.token);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [projectRequests, setProjectRequests] = useState<ProjectRequestSummary[]>([]);
  const [sentShares, setSentShares] = useState<QuoteShareItem[]>([]);
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

  return (
    <div className="bg-gray-50 px-6 py-10">
      <Seo
        title="내 견적서 | 웹사이트 견적 자동 생성기"
        description="내가 만든 견적서와 전문가 발송 상태를 확인합니다."
        noIndex
      />
      <div className="mx-auto max-w-6xl space-y-8">
        <section className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-gray-100">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-blue-600">사용자 견적서</p>
              <h1 className="mt-2 text-3xl font-bold text-gray-900">내가 만든 견적서 목록</h1>
              <p className="mt-3 text-gray-600">
                전문가에게 보낸 견적 상태와 승인 후 연락 가능한 Gmail을 확인할 수 있습니다.
              </p>
            </div>
            <button
              onClick={() => void loadData()}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 font-semibold text-gray-700"
            >
              <RefreshCw className="h-4 w-4" />
              새로고침
            </button>
          </div>
        </section>

        {isLoading ? (
          <section className="rounded-2xl bg-white p-8 text-gray-600 shadow-sm ring-1 ring-gray-100">
            불러오는 중...
          </section>
        ) : null}

        {errorMessage ? (
          <section className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-rose-700">
            {errorMessage}
          </section>
        ) : null}

        <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
          <h2 className="text-xl font-bold text-gray-900">내 견적서</h2>
          <div className="mt-4 space-y-3">
            {projectRequests.length === 0 ? (
              <div className="rounded-xl border border-dashed border-gray-300 p-8 text-center text-gray-600">
                아직 저장된 견적서가 없습니다. 결과 페이지에서 "내 견적서에 저장"을 눌러 주세요.
              </div>
            ) : (
              projectRequests.map((project) => (
                <article key={project.id} className="rounded-xl border border-gray-200 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-gray-900">
                        {project.projectName || '이름 없는 견적서'}
                      </p>
                      <p className="mt-1 text-sm text-gray-500">
                        {project.siteType || '-'} · 생성 {formatDate(project.createdAt)}
                      </p>
                    </div>
                    <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                      발송 {sentCountByProject[project.id] ?? 0}건
                    </span>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>

        <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
          <h2 className="text-xl font-bold text-gray-900">보낸 견적서</h2>
          <div className="mt-4 space-y-3">
            {sentShares.length === 0 ? (
              <div className="rounded-xl border border-dashed border-gray-300 p-8 text-center text-gray-600">
                아직 전문가에게 보낸 견적서가 없습니다.
              </div>
            ) : (
              sentShares.map((share) => (
                <article key={share.id} className="rounded-xl border border-gray-200 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-gray-900">
                        {share.projectRequest?.projectName || '견적서'}
                      </p>
                      <p className="mt-1 text-sm text-gray-500">
                        전문가: {share.developer?.displayName || '-'} · 상태: {toStatusLabel(share.status)}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={async () => {
                          if (!token) return;
                          const detail = await getQuoteShareDetail(token, share.id);
                          setSelectedDetail(detail);
                        }}
                        className="inline-flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-700"
                      >
                        <FileText className="h-4 w-4" />
                        상세
                      </button>
                      {share.status === 'sent' ? (
                        <button
                          onClick={async () => {
                            if (!token) return;
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
                  <p className="mt-2 text-xs text-gray-500">업데이트: {formatDate(share.updatedAt)}</p>
                </article>
              ))
            )}
          </div>
        </section>

        {selectedDetail ? (
          <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
            <h2 className="text-xl font-bold text-gray-900">견적서 상세</h2>
            <div className="mt-4 space-y-3 text-sm text-gray-700">
              <p>
                상태: <strong>{toStatusLabel(selectedDetail.status)}</strong>
              </p>
              <p>전문가: {selectedDetail.developer?.displayName || '-'}</p>
              <p>승인 시각: {formatDate(selectedDetail.approvedAt)}</p>
              {selectedDetail.counterpartyEmail ? (
                <p className="inline-flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-emerald-700">
                  <Mail className="h-4 w-4" />
                  전문가 Gmail: {selectedDetail.counterpartyEmail}
                </p>
              ) : (
                <p className="text-gray-500">
                  아직 승인되지 않아 전문가 Gmail이 노출되지 않습니다.
                </p>
              )}
            </div>
            <div className="mt-4">
              <Link
                to={`/experts/${selectedDetail.developerId}`}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700"
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
