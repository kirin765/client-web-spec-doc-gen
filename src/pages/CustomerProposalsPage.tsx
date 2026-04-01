import { useMemo } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { Eye, Hourglass, Link2, Trophy } from 'lucide-react';
import { useMarketplaceStore } from '@/store/useMarketplaceStore';
import { formatRange } from '@/lib/utils';
import { Seo } from '@/components/seo/Seo';

export function CustomerProposalsPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const { projects, proposals, developers, markProposalViewed, updateProposalDecision } =
    useMarketplaceStore();

  const project = useMemo(
    () => projects.find((item) => item.id === projectId),
    [projectId, projects],
  );

  const projectProposals = useMemo(() => {
    return proposals
      .filter((proposal) => proposal.projectId === projectId)
      .map((proposal) => ({
        ...proposal,
        developer: developers.find((developer) => developer.id === proposal.developerId),
      }))
      .sort((a, b) => a.priceMin - b.priceMin);
  }, [developers, projectId, proposals]);

  if (!projectId) {
    return <Navigate to="/" replace />;
  }

  if (!project) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="bg-slate-50 px-6 py-10">
      <Seo
        title={`${project.projectName} 제안 비교 | 웹사이트 견적 자동 생성기`}
        description="전문가가 제출한 가격 범위, 기간, 메시지, 포트폴리오를 비교해 최적의 제안을 선택하세요."
        noIndex
      />
      <div className="mx-auto max-w-6xl space-y-8">
        <section className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-gray-100">
          <p className="text-sm font-semibold text-blue-600">고객 제안 비교</p>
          <h1 className="mt-2 text-3xl font-bold text-gray-900">{project.projectName}</h1>
          <p className="mt-3 text-gray-600">{project.summary}</p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to={`/projects/${project.id}/matches`}
              className="rounded-lg border border-gray-300 px-4 py-2 font-semibold text-gray-700"
            >
              매칭 결과로 돌아가기
            </Link>
            <Link
              to="/mypage"
              className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white"
            >
              전문가 마이페이지
            </Link>
          </div>
        </section>

        {projectProposals.length === 0 ? (
          <section className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center">
            <h2 className="text-2xl font-bold text-gray-900">아직 도착한 제안이 없습니다</h2>
            <p className="mt-3 text-gray-600">
              전문가 워크스페이스에서 이 프로젝트에 대한 첫 견적을 제출해 보세요.
            </p>
          </section>
        ) : (
          <>
            <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {projectProposals.map((proposal, index) => {
                const isBestPrice = index === 0;
                const developer = proposal.developer;

                return (
                  <article
                    key={proposal.id}
                    className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h2 className="text-xl font-bold text-gray-900">
                          {developer?.displayName ?? '알 수 없는 전문가'}
                        </h2>
                        <p className="mt-2 text-sm text-gray-600">
                          {developer?.headline ?? '프로필 정보 없음'}
                        </p>
                      </div>

                      {isBestPrice ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                          <Trophy className="h-3.5 w-3.5" />
                          최저가
                        </span>
                      ) : null}
                    </div>

                    <div className="mt-6 space-y-4 text-sm text-gray-700">
                      <div>
                        <p className="text-gray-500">가격 범위</p>
                        <p className="mt-1 text-lg font-bold text-blue-700">
                          {formatRange(proposal.priceMin, proposal.priceMax)}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <Hourglass className="h-4 w-4 text-gray-400" />
                        <span>{proposal.durationText}</span>
                      </div>

                      <div>
                        <p className="text-gray-500">메시지</p>
                        <p className="mt-1 leading-6">{proposal.message}</p>
                      </div>

                      {proposal.portfolioLinks.length > 0 ? (
                        <div>
                          <p className="text-gray-500">포트폴리오</p>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {proposal.portfolioLinks.map((link) => (
                              <a
                                key={link}
                                href={link}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700"
                              >
                                <Link2 className="h-3.5 w-3.5" />
                                링크
                              </a>
                            ))}
                          </div>
                        </div>
                      ) : null}
                    </div>

                    <div className="mt-6 flex flex-wrap gap-2 border-t pt-4">
                      {proposal.status === 'submitted' ? (
                        <button
                          onClick={() => markProposalViewed(proposal.id)}
                          className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700"
                        >
                          <Eye className="h-4 w-4" />
                          열람 처리
                        </button>
                      ) : null}
                      <button
                        onClick={() => updateProposalDecision(proposal.id, 'accepted')}
                        className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white"
                      >
                        수락
                      </button>
                      <button
                        onClick={() => updateProposalDecision(proposal.id, 'rejected')}
                        className="rounded-lg border border-rose-200 px-4 py-2 text-sm font-semibold text-rose-700"
                      >
                        거절
                      </button>
                    </div>

                    <div className="mt-3 text-xs font-medium text-gray-500">
                      현재 상태: <span className="uppercase">{proposal.status}</span>
                    </div>
                  </article>
                );
              })}
            </section>

            <section className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-100">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">전문가</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">가격</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">기간</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">상태</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {projectProposals.map((proposal) => (
                    <tr key={`compare-${proposal.id}`}>
                      <td className="px-4 py-3">{proposal.developer?.displayName ?? '-'}</td>
                      <td className="px-4 py-3">
                        {formatRange(proposal.priceMin, proposal.priceMax)}
                      </td>
                      <td className="px-4 py-3">{proposal.durationText}</td>
                      <td className="px-4 py-3 uppercase">{proposal.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          </>
        )}
      </div>
    </div>
  );
}
