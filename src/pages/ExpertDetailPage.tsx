import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Send } from 'lucide-react';
import { Seo } from '@/components/seo/Seo';
import {
  createQuoteShare,
  getDeveloperById,
  listMyProjectRequests,
  listSentQuoteShares,
} from '@/lib/api';
import type { DeveloperProfileApi, ProjectRequestSummary } from '@/types/api';
import { formatRange } from '@/lib/utils';
import { useAuthStore } from '@/store/useAuthStore';

export function ExpertDetailPage() {
  const { developerId } = useParams<{ developerId: string }>();
  const token = useAuthStore((state) => state.token);
  const [developer, setDeveloper] = useState<DeveloperProfileApi | null>(null);
  const [projects, setProjects] = useState<ProjectRequestSummary[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [alreadySentProjectIds, setAlreadySentProjectIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!developerId) return;
    setIsLoading(true);
    setErrorMessage(null);

    const fetchAll = async () => {
      try {
        const profile = await getDeveloperById(developerId);
        setDeveloper(profile);

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
    <div className="bg-gray-50 px-6 py-10">
      <Seo
        title={`${developer?.displayName || '전문가'} 상세 | 웹사이트 견적 자동 생성기`}
        description="전문가 상세 정보를 확인하고 내 견적서를 보낼 수 있습니다."
        noIndex
      />
      <div className="mx-auto max-w-5xl space-y-8">
        <section className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-gray-100">
          <Link
            to="/experts"
            className="inline-flex items-center gap-1 text-sm font-semibold text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" />
            전문가 목록으로
          </Link>

          {isLoading ? <p className="mt-6 text-gray-600">불러오는 중...</p> : null}
          {errorMessage ? <p className="mt-6 text-rose-600">{errorMessage}</p> : null}

          {developer ? (
            <div className="mt-6 space-y-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-blue-600">전문가 상세</p>
                  <h1 className="mt-1 text-3xl font-bold text-gray-900">{developer.displayName}</h1>
                  <p className="mt-2 text-gray-600">{developer.headline}</p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    developer.active ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                  }`}
                >
                  {developer.active ? '활성 전문가' : '승인 대기'}
                </span>
              </div>

              <p className="leading-7 text-gray-700">
                {developer.introduction || '소개가 아직 등록되지 않았습니다.'}
              </p>

              <div className="grid gap-3 md:grid-cols-3 text-sm text-gray-600">
                <div>유형: {developer.type === 'agency' ? '에이전시' : '프리랜서'}</div>
                <div>예산: {formatRange(developer.budgetMin, developer.budgetMax)}</div>
                <div>응답 속도: {developer.avgResponseHours}시간</div>
              </div>

              <div className="flex flex-wrap gap-2">
                {developer.specialties.slice(0, 5).map((specialty) => (
                  <span key={specialty} className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
                    {specialty}
                  </span>
                ))}
              </div>
            </div>
          ) : null}
        </section>

        <section className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-gray-100">
          <h2 className="text-xl font-bold text-gray-900">내 견적서 1건 보내기</h2>
          {!token ? (
            <p className="mt-3 text-gray-600">로그인 후 견적서를 보낼 수 있습니다.</p>
          ) : projects.length === 0 ? (
            <p className="mt-3 text-gray-600">
              보낼 수 있는 견적서가 없습니다. 결과 페이지에서 먼저 "내 견적서에 저장"을 눌러 주세요.
            </p>
          ) : (
            <div className="mt-4 space-y-4">
              <select
                value={selectedProjectId}
                onChange={(event) => setSelectedProjectId(event.target.value)}
                className="w-full rounded-xl border border-gray-300 px-4 py-3"
              >
                <option value="">견적서를 선택하세요</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.projectName || '이름 없는 견적서'} ({project.siteType || '-'})
                  </option>
                ))}
              </select>

              {selectedProject ? (
                <div className="rounded-xl bg-gray-50 p-4 text-sm text-gray-700">
                  <p>선택 견적: {selectedProject.projectName || '이름 없는 견적서'}</p>
                  <p className="mt-1">생성일: {new Date(selectedProject.createdAt).toLocaleDateString('ko-KR')}</p>
                  {alreadySentProjectIds.has(selectedProject.id) ? (
                    <p className="mt-2 inline-flex items-center gap-1 font-semibold text-amber-700">
                      <CheckCircle2 className="h-4 w-4" />
                      이미 이 전문가에게 보낸 견적서입니다.
                    </p>
                  ) : null}
                </div>
              ) : null}

              <button
                disabled={!selectedProjectId || alreadySentProjectIds.has(selectedProjectId) || !developer?.active}
                onClick={async () => {
                  if (!token || !selectedProjectId || !developer) return;
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
                  }
                }}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:bg-gray-300"
              >
                <Send className="h-4 w-4" />
                견적서 보내기
              </button>

              {successMessage ? <p className="text-emerald-700">{successMessage}</p> : null}
              {errorMessage ? <p className="text-rose-600">{errorMessage}</p> : null}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
