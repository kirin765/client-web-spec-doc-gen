import { useMemo } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { ArrowRight, Briefcase, CheckCircle2, FileText } from 'lucide-react';
import { useMarketplaceStore } from '@/store/useMarketplaceStore';
import { formatRange } from '@/lib/utils';
import { Seo } from '@/components/seo/Seo';

export function CustomerMatchesPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { projects, proposals } = useMarketplaceStore();

  const project = useMemo(
    () => projects.find((item) => item.id === projectId),
    [projectId, projects],
  );

  if (!projectId) {
    return <Navigate to="/" replace />;
  }

  if (!project) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-16">
        <div className="rounded-2xl border border-dashed border-secondary-300 bg-white p-10 text-center">
          <h1 className="text-heading-md font-bold text-secondary-900">프로젝트를 찾을 수 없습니다</h1>
          <p className="mt-3 text-secondary-600">결과 페이지에서 먼저 의뢰를 등록해 주세요.</p>
          <Link
            to="/result"
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary-600 px-5 py-3 font-semibold text-white"
          >
            결과 페이지로 이동
          </Link>
        </div>
      </div>
    );
  }

  const submittedProposalCount = proposals.filter((proposal) => proposal.projectId === project.id).length;

  return (
    <div className="bg-slate-50 px-6 py-10">
      <Seo
        title={`${project.projectName} 매칭 결과 | 웹사이트 견적 자동 생성기`}
        description="프로젝트에 가장 적합한 전문가 후보와 추천 이유, 예상 비용 범위를 확인하세요."
        noIndex
      />
      <div className="mx-auto max-w-6xl space-y-8">
        <section className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-secondary-100">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-body-sm font-semibold text-primary-600">고객 매칭 결과</p>
              <h1 className="mt-2 text-heading-lg font-bold text-secondary-900">{project.projectName}</h1>
              <p className="mt-3 max-w-3xl text-secondary-600">{project.summary}</p>
            </div>

            <div className="rounded-xl bg-primary-50 px-5 py-4 text-right">
              <p className="text-body-sm text-secondary-600">예상 비용 범위</p>
              <p className="mt-1 text-heading-sm font-bold text-primary-700">
                {formatRange(project.costEstimate.totalMin, project.costEstimate.totalMax)}
              </p>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            {project.featureNames.map((feature) => (
              <span
                key={feature}
                className="rounded-full bg-secondary-100 px-3 py-1 text-body-sm font-medium text-secondary-700"
              >
                {feature}
              </span>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <button
              onClick={() => navigate(`/projects/${project.id}/proposals`)}
              className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-5 py-3 font-semibold text-white"
            >
              제안 비교 보기
              <ArrowRight className="h-4 w-4" />
            </button>
            <Link
              to={`/experts?projectId=${project.id}`}
              className="inline-flex items-center gap-2 rounded-lg border border-secondary-300 px-5 py-3 font-semibold text-secondary-700"
            >
              <Briefcase className="h-4 w-4" />
              전문가 목록에서 견적 보내기
            </Link>
          </div>
        </section>

        <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {project.matchResults.map((result) => {
            const hasProposal = proposals.some(
              (proposal) =>
                proposal.projectId === project.id && proposal.developerId === result.developer.id,
            );

            return (
              <article
                key={result.developer.id}
                className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-secondary-100"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-body-xs font-semibold uppercase tracking-wide text-primary-600">
                      Match Score
                    </p>
                    <h2 className="mt-2 text-heading-sm font-bold text-secondary-900">
                      {result.developer.displayName}
                    </h2>
                    <p className="mt-2 text-body-sm text-secondary-600">{result.developer.headline}</p>
                  </div>

                  <div className="rounded-full bg-primary-50 px-3 py-1 text-body-sm font-bold text-primary-700">
                    {Math.round(result.score)}점
                  </div>
                </div>

                <p className="mt-4 text-body-sm text-secondary-700">{result.summary}</p>

                <ul className="mt-4 space-y-2 text-body-sm text-secondary-600">
                  {result.reasons.map((reason) => (
                    <li key={`${result.developer.id}-${reason.label}`} className="flex gap-2">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 text-success-600" />
                      <span>{reason.description}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-6 flex items-center justify-between border-t border-secondary-200 pt-4">
                  <div className="text-body-sm text-secondary-500">
                    응답 속도 약 {result.developer.avgResponseHours}시간
                  </div>
                  {hasProposal ? (
                    <span className="inline-flex items-center gap-2 rounded-full bg-success-100 px-3 py-1 text-body-xs font-semibold text-success-700">
                      <FileText className="h-3.5 w-3.5" />
                      제안 도착
                    </span>
                  ) : (
                    <span className="text-body-xs font-medium text-secondary-400">제안 대기 중</span>
                  )}
                </div>
              </article>
            );
          })}
        </section>

        <section className="rounded-2xl border border-primary-100 bg-primary-50 p-6 text-body-sm text-primary-900">
          현재 제안 수는 <strong>{submittedProposalCount}건</strong>입니다. 전문가 페이지에서 매칭된
          프로젝트를 열면 바로 견적을 남길 수 있습니다.
        </section>
      </div>
    </div>
  );
}
