import { useCallback, useEffect, useMemo, useState } from 'react';
import { Seo } from '@/components/seo/Seo';
import { LoadingButton } from '@/components/common/LoadingButton';
import { useAuthStore } from '@/store/useAuthStore';
import {
  approveAdminDeveloper,
  listAdminDevelopers,
  listAdminProjects,
} from '@/lib/api';
import type {
  AdminDeveloperSummary,
  AdminProjectRequestSummary,
} from '@/types/api';
import { formatRange } from '@/lib/utils';

function formatDate(value: string | null | undefined) {
  if (!value) return '-';
  return new Date(value).toLocaleString('ko-KR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
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

export function AdminPage() {
  const token = useAuthStore((state) => state.token);
  const [projects, setProjects] = useState<AdminProjectRequestSummary[]>([]);
  const [pendingDevelopers, setPendingDevelopers] = useState<AdminDeveloperSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [approvingDeveloperId, setApprovingDeveloperId] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!token) return;

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const [developerResponse, projectResponse] = await Promise.all([
        listAdminDevelopers(token, { status: 'pending', page: 1, limit: 50 }),
        listAdminProjects(token, { page: 1, limit: 20 }),
      ]);

      setPendingDevelopers(developerResponse.data);
      setProjects(projectResponse.data);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : '관리자 데이터를 불러오지 못했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const completedProjects = useMemo(
    () => projects.filter((project) => project.status !== 'SUBMITTED').length,
    [projects],
  );

  const handleApprove = async (developerId: string) => {
    if (!token) return;

    setApprovingDeveloperId(developerId);
    setErrorMessage(null);

    try {
      await approveAdminDeveloper(token, developerId);
      await loadData();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : '전문가 승인에 실패했습니다.');
    } finally {
      setApprovingDeveloperId(null);
    }
  };

  return (
    <div className="bg-slate-50 px-6 py-10">
      <Seo
        title="관리자 대시보드 | 웹사이트 견적 자동 생성기"
        description="프로젝트 목록, 전문가 승인, 가격 룰을 관리하는 관리자 화면입니다."
        noIndex
      />
      <div className="mx-auto max-w-7xl space-y-8">
        <section className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-gray-100">
          <p className="text-sm font-semibold text-blue-600">관리자 대시보드</p>
          <h1 className="mt-2 text-3xl font-bold text-gray-900">프로젝트, 전문가, 가격 룰 관리</h1>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="rounded-xl bg-gray-50 p-5">
              <p className="text-sm text-gray-500">총 프로젝트</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">{projects.length}</p>
            </div>
            <div className="rounded-xl bg-gray-50 p-5">
              <p className="text-sm text-gray-500">승인 대기 전문가</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">{pendingDevelopers.length}</p>
            </div>
            <div className="rounded-xl bg-gray-50 p-5">
              <p className="text-sm text-gray-500">비교 가능한 제안 흐름</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">{completedProjects}</p>
            </div>
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

        <section className="grid gap-8 xl:grid-cols-2">
          <article className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-gray-100">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-xl font-bold text-gray-900">전문가 승인</h2>
              <LoadingButton
                type="button"
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
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700"
              >
                새로고침
              </LoadingButton>
            </div>
            <div className="mt-6 space-y-4">
              {pendingDevelopers.length === 0 ? (
                <p className="text-gray-600">승인 대기 중인 전문가가 없습니다.</p>
              ) : (
                pendingDevelopers.map((developer) => (
                  <div
                    key={developer.id}
                    className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-gray-200 p-4"
                  >
                    <div>
                      <p className="font-semibold text-gray-900">{developer.displayName}</p>
                      <p className="mt-1 text-sm text-gray-500">{developer.headline}</p>
                      <p className="mt-1 text-xs text-gray-400">
                        {developer.type} · {developer.availabilityStatus} · 생성 {formatDate(developer.createdAt)}
                      </p>
                    </div>
                    <LoadingButton
                      type="button"
                      loading={approvingDeveloperId === developer.id}
                      loadingLabel="승인 중..."
                      onClick={() => void handleApprove(developer.id)}
                      className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white disabled:cursor-not-allowed disabled:bg-gray-300"
                    >
                      승인
                    </LoadingButton>
                  </div>
                ))
              )}
            </div>
          </article>

          <article className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-gray-100">
            <h2 className="text-xl font-bold text-gray-900">최근 프로젝트</h2>
            <div className="mt-6 space-y-4">
              {projects.length === 0 ? (
                <p className="text-gray-600">프로젝트가 없습니다.</p>
              ) : (
                projects.map((project) => (
                  <div
                    key={project.id}
                    className="grid gap-3 rounded-xl border border-gray-200 p-4 md:grid-cols-[1.4fr_1fr_0.8fr]"
                  >
                    <div>
                      <p className="font-semibold text-gray-900">
                        {project.projectName || '이름 없는 프로젝트'}
                      </p>
                      <p className="mt-1 text-sm text-gray-500">
                        {project.siteType || '-'} · 연락방법: {project.contactMethod || '미입력'}
                      </p>
                    </div>
                    <div className="text-sm text-gray-600">
                      {project.costEstimate
                        ? formatRange(project.costEstimate.totalMin, project.costEstimate.totalMax)
                        : '비용 정보 없음'}
                    </div>
                    <div className="text-sm font-semibold uppercase text-gray-700">
                      {getProjectStatusLabel(project.status)}
                    </div>
                  </div>
                ))
              )}
            </div>
          </article>
        </section>
      </div>
    </div>
  );
}
