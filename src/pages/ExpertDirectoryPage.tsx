import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowRight, Send, ShieldCheck, Users } from 'lucide-react';
import { useMarketplaceStore } from '@/store/useMarketplaceStore';
import { formatRange } from '@/lib/utils';
import { Seo } from '@/components/seo/Seo';

type QuoteDraft = {
  priceMin: string;
  priceMax: string;
  durationText: string;
  message: string;
  portfolioLinks: string;
};

function splitCsv(value: string) {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function buildDraft(projectName: string, developerName: string, min: number, max: number): QuoteDraft {
  return {
    priceMin: String(min),
    priceMax: String(max),
    durationText: '4~6주',
    message: `${projectName}에 맞춰 ${developerName}님께 제안드립니다.`,
    portfolioLinks: '',
  };
}

export function ExpertDirectoryPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { developers, projects, proposals, submitProposal } = useMarketplaceStore();
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    searchParams.get('projectId'),
  );
  const [quoteDrafts, setQuoteDrafts] = useState<Record<string, QuoteDraft>>({});
  const [sentDeveloperId, setSentDeveloperId] = useState<string | null>(null);

  const activeProject = useMemo(() => {
    if (selectedProjectId) {
      return projects.find((project) => project.id === selectedProjectId) ?? null;
    }
    return projects[0] ?? null;
  }, [projects, selectedProjectId]);

  useEffect(() => {
    const projectIdFromQuery = searchParams.get('projectId');

    if (projectIdFromQuery && projects.some((project) => project.id === projectIdFromQuery)) {
      if (projectIdFromQuery !== selectedProjectId) {
        setSelectedProjectId(projectIdFromQuery);
      }
      return;
    }

    if (!selectedProjectId && projects[0]) {
      setSelectedProjectId(projects[0].id);
      setSearchParams({ projectId: projects[0].id }, { replace: true });
      return;
    }

    if (
      selectedProjectId &&
      projects.length > 0 &&
      !projects.some((project) => project.id === selectedProjectId)
    ) {
      setSelectedProjectId(projects[0].id);
      setSearchParams({ projectId: projects[0].id }, { replace: true });
    }
  }, [projects, searchParams, selectedProjectId, setSearchParams]);

  useEffect(() => {
    setQuoteDrafts({});
    setSentDeveloperId(null);
  }, [selectedProjectId]);

  const proposalCountByDeveloper = useMemo(() => {
    return proposals.reduce<Record<string, number>>((acc, proposal) => {
      acc[proposal.developerId] = (acc[proposal.developerId] ?? 0) + 1;
      return acc;
    }, {});
  }, [proposals]);

  const selectedProjectLabel = activeProject?.projectName ?? '프로젝트를 먼저 만들어 주세요';

  return (
    <div className="bg-gradient-to-b from-slate-50 via-white to-slate-50 px-6 py-10">
      <Seo
        title="전문가 리스트 | 웹사이트 견적 자동 생성기"
        description="전문가를 조회하고 선택한 프로젝트 기준으로 견적서를 바로 보낼 수 있습니다."
        noIndex
      />

      <div className="mx-auto max-w-7xl space-y-8">
        <section className="overflow-hidden rounded-[2rem] bg-slate-900 text-white shadow-2xl">
          <div className="grid gap-8 px-8 py-10 lg:grid-cols-[1.2fr_0.8fr] lg:px-12 lg:py-12">
            <div className="space-y-5">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-200">
                <Users className="h-3.5 w-3.5" />
                전문가 조회
              </span>
              <div className="max-w-2xl">
                <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
                  등록된 전문가를 보고, 선택한 프로젝트 견적을 바로 보냅니다.
                </h1>
                <p className="mt-4 max-w-xl text-base leading-7 text-slate-300">
                  고객은 전문가를 비교하면서 견적을 작성하고, 전문가 페이지에서는 도착한 견적
                  내역을 바로 확인할 수 있습니다.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link
                  to="/developers/workspace"
                  className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-slate-900"
                >
                  전문가 등록
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  to="/wizard"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/20 px-4 py-3 text-sm font-semibold text-white"
                >
                  새 프로젝트 만들기
                </Link>
              </div>
            </div>

            <div className="grid gap-4 rounded-[1.5rem] bg-white/5 p-6 ring-1 ring-white/10">
              <div className="rounded-2xl bg-white/10 p-5">
                <p className="text-sm text-slate-300">선택된 프로젝트</p>
                <p className="mt-2 text-xl font-bold">{selectedProjectLabel}</p>
              </div>
              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-300">프로젝트 선택</span>
                <select
                  value={activeProject?.id ?? ''}
                  onChange={(event) => {
                    const nextProjectId = event.target.value || null;
                    setSelectedProjectId(nextProjectId);
                    if (nextProjectId) {
                      setSearchParams({ projectId: nextProjectId }, { replace: true });
                    }
                  }}
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white outline-none ring-0"
                >
                  <option value="">프로젝트를 선택하세요</option>
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.projectName}
                    </option>
                  ))}
                </select>
              </label>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-2xl bg-white/10 p-4">
                  <p className="text-slate-300">전문가 수</p>
                  <p className="mt-1 text-2xl font-bold">{developers.length}</p>
                </div>
                <div className="rounded-2xl bg-white/10 p-4">
                  <p className="text-slate-300">도착한 견적</p>
                  <p className="mt-1 text-2xl font-bold">{proposals.length}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {!activeProject ? (
          <section className="rounded-[2rem] border border-dashed border-slate-300 bg-white p-10 text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-blue-600">안내</p>
            <h2 className="mt-3 text-2xl font-bold text-slate-900">먼저 프로젝트를 생성해 주세요</h2>
            <p className="mt-3 text-slate-600">
              전문가에게 보낼 견적서는 프로젝트 맥락이 있어야 작성할 수 있습니다.
            </p>
            <Link
              to="/wizard"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white"
            >
              프로젝트 작성하기
            </Link>
          </section>
        ) : null}

        <section className="space-y-5">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-blue-600">전문가 목록</p>
              <h2 className="mt-1 text-2xl font-bold text-slate-900">견적을 보낼 전문가를 선택하세요</h2>
            </div>
            <p className="text-sm text-slate-600">
              선택한 프로젝트 기준으로 각 전문가에게 동일한 견적서를 전달합니다.
            </p>
          </div>

          <div className="grid gap-5 xl:grid-cols-2">
            {developers.map((developer) => {
              const proposalCount = proposalCountByDeveloper[developer.id] ?? 0;
              const draft =
                quoteDrafts[developer.id] ??
                buildDraft(
                  activeProject?.projectName ?? '프로젝트',
                  developer.displayName,
                  activeProject?.costEstimate.totalMin ?? developer.budgetMin,
                  activeProject?.costEstimate.totalMax ?? developer.budgetMax,
                );

              const canSubmit = Boolean(activeProject);

              return (
                <article
                  key={developer.id}
                  className="rounded-[1.75rem] bg-white p-6 shadow-sm ring-1 ring-slate-100"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-xl font-bold text-slate-900">{developer.displayName}</h3>
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                            developer.active
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-amber-50 text-amber-700'
                          }`}
                        >
                          {developer.active ? '등록 완료' : '승인 대기'}
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-slate-600">{developer.headline}</p>
                    </div>
                    <Link
                      to={`/experts/${developer.id}/quotes`}
                      className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700"
                    >
                      받은 견적 {proposalCount}
                    </Link>
                  </div>

                  <p className="mt-4 text-sm leading-6 text-slate-700">
                    {developer.introduction ?? '소개가 등록되지 않았습니다.'}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {developer.specialties.slice(0, 3).map((specialty) => (
                      <span key={specialty} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                        {specialty}
                      </span>
                    ))}
                  </div>

                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    <label className="space-y-2">
                      <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        견적 최소
                      </span>
                      <input
                        type="number"
                        value={draft.priceMin}
                        onChange={(event) =>
                          setQuoteDrafts((current) => ({
                            ...current,
                            [developer.id]: {
                              ...draft,
                              priceMin: event.target.value,
                            },
                          }))
                        }
                        className="w-full rounded-2xl border border-slate-200 px-4 py-3"
                      />
                    </label>
                    <label className="space-y-2">
                      <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        견적 최대
                      </span>
                      <input
                        type="number"
                        value={draft.priceMax}
                        onChange={(event) =>
                          setQuoteDrafts((current) => ({
                            ...current,
                            [developer.id]: {
                              ...draft,
                              priceMax: event.target.value,
                            },
                          }))
                        }
                        className="w-full rounded-2xl border border-slate-200 px-4 py-3"
                      />
                    </label>
                    <label className="space-y-2">
                      <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        예상 기간
                      </span>
                      <input
                        value={draft.durationText}
                        onChange={(event) =>
                          setQuoteDrafts((current) => ({
                            ...current,
                            [developer.id]: {
                              ...draft,
                              durationText: event.target.value,
                            },
                          }))
                        }
                        className="w-full rounded-2xl border border-slate-200 px-4 py-3"
                      />
                    </label>
                    <label className="space-y-2">
                      <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        포트폴리오
                      </span>
                      <input
                        value={draft.portfolioLinks}
                        onChange={(event) =>
                          setQuoteDrafts((current) => ({
                            ...current,
                            [developer.id]: {
                              ...draft,
                              portfolioLinks: event.target.value,
                            },
                          }))
                        }
                        placeholder="쉼표로 구분"
                        className="w-full rounded-2xl border border-slate-200 px-4 py-3"
                      />
                    </label>
                    <label className="space-y-2 sm:col-span-2">
                      <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        전달 메시지
                      </span>
                      <textarea
                        rows={4}
                        value={draft.message}
                        onChange={(event) =>
                          setQuoteDrafts((current) => ({
                            ...current,
                            [developer.id]: {
                              ...draft,
                              message: event.target.value,
                            },
                          }))
                        }
                        className="w-full rounded-2xl border border-slate-200 px-4 py-3"
                      />
                    </label>
                  </div>

                  <div className="mt-5 flex flex-wrap items-center gap-3">
                    <button
                      disabled={!canSubmit}
                      onClick={() => {
                        submitProposal({
                          projectId: activeProject!.id,
                          developerId: developer.id,
                          priceMin: Number(draft.priceMin || 0),
                          priceMax: Number(draft.priceMax || 0),
                          durationText: draft.durationText,
                          message: draft.message,
                          portfolioLinks: splitCsv(draft.portfolioLinks),
                        });

                        setSentDeveloperId(developer.id);
                      }}
                      className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-300"
                    >
                      <Send className="h-4 w-4" />
                      견적 보내기
                    </button>

                    <Link
                      to={`/experts/${developer.id}/quotes`}
                      className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700"
                    >
                      받은 견적 보기
                    </Link>

                    {sentDeveloperId === developer.id ? (
                      <span className="text-sm font-medium text-emerald-700">
                        전송 완료
                      </span>
                    ) : null}
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4 text-sm text-slate-500">
                    <span>{formatRange(developer.budgetMin, developer.budgetMax)}</span>
                    <span className="inline-flex items-center gap-1">
                      <ShieldCheck className="h-4 w-4" />
                      응답 {developer.avgResponseHours}시간 내
                    </span>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
