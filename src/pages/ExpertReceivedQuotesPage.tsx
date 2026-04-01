import { useMemo } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { Clock3, ExternalLink, MailOpen, Quote, Sparkles } from 'lucide-react';
import { useMarketplaceStore } from '@/store/useMarketplaceStore';
import { formatRange } from '@/lib/utils';
import { Seo } from '@/components/seo/Seo';

export function ExpertReceivedQuotesPage() {
  const { developerId } = useParams<{ developerId: string }>();
  const { developers, projects, proposals } = useMarketplaceStore();

  const developer = useMemo(
    () => developers.find((item) => item.id === developerId),
    [developerId, developers],
  );

  const receivedQuotes = useMemo(() => {
    if (!developerId) {
      return [];
    }

    return proposals
      .filter((proposal) => proposal.developerId === developerId)
      .map((proposal) => ({
        proposal,
        project: projects.find((project) => project.id === proposal.projectId),
      }))
      .sort((a, b) => (b.proposal.updatedAt || '').localeCompare(a.proposal.updatedAt || ''));
  }, [developerId, projects, proposals]);

  const stats = useMemo(
    () => ({
      total: receivedQuotes.length,
      viewed: receivedQuotes.filter(({ proposal }) => proposal.status === 'viewed').length,
      accepted: receivedQuotes.filter(({ proposal }) => proposal.status === 'accepted').length,
    }),
    [receivedQuotes],
  );

  if (!developerId) {
    return <Navigate to="/experts" replace />;
  }

  if (!developer) {
    return <Navigate to="/experts" replace />;
  }

  return (
    <div className="bg-secondary-50 px-6 py-10">
      <Seo
        title={`${developer.displayName} 받은 견적 | 웹사이트 견적 자동 생성기`}
        description="선택한 전문가에게 도착한 견적서를 확인합니다."
        noIndex
      />

      <div className="mx-auto max-w-6xl space-y-8">
        <section className="overflow-hidden rounded-[2rem] bg-secondary-900 text-white shadow-2xl">
          <div className="grid gap-8 px-8 py-10 lg:grid-cols-[1.3fr_0.7fr] lg:px-12">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-caption-sm font-semibold uppercase tracking-[0.18em] text-secondary-200">
                <MailOpen className="h-3.5 w-3.5" />
                받은 견적
              </p>
              <h1 className="mt-4 text-heading-lg font-bold tracking-tight sm:text-display-md">
                {developer.displayName}
              </h1>
              <p className="mt-3 max-w-2xl text-secondary-300">{developer.headline}</p>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  to="/experts"
                  className="rounded-xl bg-white px-4 py-3 text-body-sm font-semibold text-secondary-900"
                >
                  전문가 목록
                </Link>
                <Link
                  to="/developers/workspace"
                  className="rounded-xl border border-white/20 px-4 py-3 text-body-sm font-semibold text-white"
                >
                  등록 폼 열기
                </Link>
              </div>
            </div>

            <div className="grid gap-4 rounded-[1.5rem] bg-white/5 p-6 ring-1 ring-white/10">
              <div className="rounded-2xl bg-white/10 p-4">
                <p className="text-body-sm text-secondary-300">총 견적</p>
                <p className="mt-1 text-heading-lg font-bold">{stats.total}</p>
              </div>
              <div className="grid grid-cols-2 gap-4 text-body-sm">
                <div className="rounded-2xl bg-white/10 p-4">
                  <p className="text-secondary-300">열람</p>
                  <p className="mt-1 text-heading-md font-bold">{stats.viewed}</p>
                </div>
                <div className="rounded-2xl bg-white/10 p-4">
                  <p className="text-secondary-300">수락</p>
                  <p className="mt-1 text-heading-md font-bold">{stats.accepted}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-secondary-100">
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <p className="text-body-sm font-semibold text-secondary-500">유형</p>
              <p className="mt-2 text-body-lg font-bold text-secondary-900">{developer.type === 'agency' ? '에이전시' : '프리랜서'}</p>
            </div>
            <div>
              <p className="text-body-sm font-semibold text-secondary-500">예산 범위</p>
              <p className="mt-2 text-body-lg font-bold text-secondary-900">
                {formatRange(developer.budgetMin, developer.budgetMax)}
              </p>
            </div>
            <div>
              <p className="text-body-sm font-semibold text-secondary-500">응답 속도</p>
              <p className="mt-2 text-body-lg font-bold text-secondary-900">{developer.avgResponseHours}시간 이내</p>
            </div>
          </div>
        </section>

        {receivedQuotes.length === 0 ? (
          <section className="rounded-[2rem] border border-dashed border-secondary-300 bg-white p-12 text-center">
            <Quote className="mx-auto h-10 w-10 text-secondary-400" />
            <h2 className="mt-4 text-heading-md font-bold text-secondary-900">아직 도착한 견적이 없습니다</h2>
            <p className="mt-3 text-secondary-600">전문가 목록에서 고객이 견적을 보내면 이 화면에 쌓입니다.</p>
          </section>
        ) : (
          <section className="space-y-4">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-body-sm font-semibold text-primary-600">견적 목록</p>
                <h2 className="mt-1 text-heading-md font-bold text-secondary-900">도착한 견적서</h2>
              </div>
              <p className="text-body-sm text-secondary-600">
                최신 견적이 위로 오도록 정렬했습니다.
              </p>
            </div>

            <div className="grid gap-4">
              {receivedQuotes.map(({ proposal, project }) => (
                <article
                  key={proposal.id}
                  className="rounded-[1.5rem] bg-white p-6 shadow-sm ring-1 ring-secondary-100"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="text-caption-sm font-semibold uppercase tracking-[0.18em] text-primary-600">
                        {project?.projectName ?? '프로젝트 정보 없음'}
                      </p>
                      <h3 className="mt-2 text-heading-sm font-bold text-secondary-900">
                        {project?.summary ?? '프로젝트 설명이 없습니다.'}
                      </h3>
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-caption-sm font-semibold ${
                        proposal.status === 'accepted'
                          ? 'bg-emerald-50 text-emerald-700'
                          : proposal.status === 'rejected'
                            ? 'bg-rose-50 text-rose-700'
                            : proposal.status === 'viewed'
                              ? 'bg-sky-50 text-sky-700'
                              : 'bg-secondary-100 text-secondary-700'
                      }`}
                    >
                      {proposal.status}
                    </span>
                  </div>

                  <div className="mt-5 grid gap-4 md:grid-cols-3">
                    <div>
                      <p className="text-body-sm text-secondary-500">견적 범위</p>
                      <p className="mt-1 text-body-lg font-bold text-secondary-900">
                        {formatRange(proposal.priceMin, proposal.priceMax)}
                      </p>
                    </div>
                    <div>
                      <p className="text-body-sm text-secondary-500">예상 기간</p>
                      <p className="mt-1 text-body-lg font-bold text-secondary-900">{proposal.durationText}</p>
                    </div>
                    <div>
                      <p className="text-body-sm text-secondary-500">작성 시각</p>
                      <p className="mt-1 text-body-lg font-bold text-secondary-900">
                        <span className="inline-flex items-center gap-2">
                          <Clock3 className="h-4 w-4 text-secondary-400" />
                          {new Date(proposal.createdAt).toLocaleString('ko-KR', {
                            dateStyle: 'medium',
                            timeStyle: 'short',
                          })}
                        </span>
                      </p>
                    </div>
                  </div>

                  <p className="mt-5 rounded-2xl bg-secondary-50 p-4 leading-7 text-secondary-700">
                    {proposal.message}
                  </p>

                  <div className="mt-5 flex flex-wrap gap-2">
                    {proposal.portfolioLinks.length > 0 ? (
                      proposal.portfolioLinks.map((link) => (
                        <a
                          key={link}
                          href={link}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 rounded-full bg-secondary-100 px-3 py-1 text-caption-sm font-medium text-secondary-700"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                          포트폴리오
                        </a>
                      ))
                    ) : (
                      <span className="text-body-sm text-secondary-500">포트폴리오 링크 없음</span>
                    )}
                  </div>

                  <div className="mt-5 flex items-center justify-between border-t border-secondary-100 pt-4 text-body-sm text-secondary-500">
                    <span className="inline-flex items-center gap-2">
                      <Sparkles className="h-4 w-4" />
                      업데이트 {new Date(proposal.updatedAt).toLocaleString('ko-KR', {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })}
                    </span>
                    {project ? (
                      <Link
                        to={`/projects/${project.id}/proposals`}
                        className="font-semibold text-primary-600"
                      >
                        프로젝트 제안 비교 보기
                      </Link>
                    ) : null}
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
