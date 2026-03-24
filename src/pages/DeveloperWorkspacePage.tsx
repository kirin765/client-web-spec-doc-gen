import { useEffect, useMemo, useState } from 'react';
import { Send, UserRoundPlus } from 'lucide-react';
import { useMarketplaceStore } from '@/store/useMarketplaceStore';
import type { DeveloperDraftInput } from '@/types/marketplace';
import { formatRange } from '@/lib/utils';

function splitCsv(value: string) {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function buildDraftFromDeveloper(developer?: DeveloperDraftInput | null): DeveloperDraftInput {
  return {
    id: developer?.id,
    displayName: developer?.displayName ?? '',
    headline: developer?.headline ?? '',
    introduction: developer?.introduction ?? '',
    type: developer?.type ?? 'freelancer',
    skills: developer?.skills ?? [],
    specialties: developer?.specialties ?? [],
    supportedProjectTypes: developer?.supportedProjectTypes ?? [],
    supportedCoreFeatures: developer?.supportedCoreFeatures ?? [],
    supportedEcommerceFeatures: developer?.supportedEcommerceFeatures ?? [],
    supportedDesignStyles: developer?.supportedDesignStyles ?? [],
    supportedDesignComplexities: developer?.supportedDesignComplexities ?? [],
    supportedTimelines: developer?.supportedTimelines ?? [],
    budgetMin: developer?.budgetMin ?? 1_000_000,
    budgetMax: developer?.budgetMax ?? 5_000_000,
    avgResponseHours: developer?.avgResponseHours ?? 24,
    availabilityStatus: developer?.availabilityStatus ?? 'available',
    portfolioLinks: developer?.portfolioLinks ?? [],
    regions: developer?.regions ?? ['KR'],
    languages: developer?.languages ?? ['ko'],
  };
}

export function DeveloperWorkspacePage() {
  const {
    developers,
    projects,
    proposals,
    selectedDeveloperId,
    selectDeveloper,
    upsertDeveloper,
    submitProposal,
  } = useMarketplaceStore();

  const selectedDeveloper = useMemo(
    () => developers.find((developer) => developer.id === selectedDeveloperId) ?? null,
    [developers, selectedDeveloperId],
  );

  const [developerForm, setDeveloperForm] = useState<DeveloperDraftInput>(
    buildDraftFromDeveloper(selectedDeveloper),
  );

  const [proposalForms, setProposalForms] = useState<Record<string, string>>({});

  useEffect(() => {
    setDeveloperForm(buildDraftFromDeveloper(selectedDeveloper));
  }, [selectedDeveloper]);

  const matchedProjects = useMemo(() => {
    if (!selectedDeveloper) {
      return [];
    }

    return projects
      .map((project) => ({
        project,
        match: project.matchResults.find(
          (result) => result.developer.id === selectedDeveloper.id,
        ),
        proposal: proposals.find(
          (proposal) =>
            proposal.projectId === project.id && proposal.developerId === selectedDeveloper.id,
        ),
      }))
      .filter((item) => Boolean(item.match));
  }, [projects, proposals, selectedDeveloper]);

  const handleDeveloperSave = () => {
    const developerId = upsertDeveloper(developerForm);
    selectDeveloper(developerId);
  };

  return (
    <div className="bg-gray-50 px-6 py-10">
      <div className="mx-auto max-w-7xl space-y-8">
        <section className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-gray-100">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-blue-600">전문가 워크스페이스</p>
              <h1 className="mt-2 text-3xl font-bold text-gray-900">
                전문가 등록, 매칭 확인, 제안 제출
              </h1>
              <p className="mt-3 text-gray-600">
                관리자가 승인한 전문가만 실제로 제안을 보낼 수 있습니다.
              </p>
            </div>

            <button
              onClick={() => {
                setDeveloperForm(buildDraftFromDeveloper(null));
                selectDeveloper(null);
              }}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 font-semibold text-gray-700"
            >
              <UserRoundPlus className="h-4 w-4" />
              새 전문가 등록
            </button>
          </div>
        </section>

        <div className="grid gap-8 xl:grid-cols-[320px_minmax(0,1fr)]">
          <aside className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
            <h2 className="text-lg font-bold text-gray-900">등록된 전문가</h2>
            <div className="mt-4 space-y-3">
              {developers.map((developer) => (
                <button
                  key={developer.id}
                  onClick={() => selectDeveloper(developer.id)}
                  className={`w-full rounded-xl border px-4 py-3 text-left ${
                    selectedDeveloperId === developer.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-gray-900">{developer.displayName}</p>
                      <p className="mt-1 text-sm text-gray-500">{developer.headline}</p>
                    </div>
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                        developer.active
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-amber-50 text-amber-700'
                      }`}
                    >
                      {developer.active ? 'active' : 'pending'}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </aside>

          <div className="space-y-8">
            <section className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-gray-100">
              <h2 className="text-xl font-bold text-gray-900">
                {selectedDeveloper ? '프로필 수정' : '전문가 등록'}
              </h2>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <input
                  value={developerForm.displayName}
                  onChange={(event) =>
                    setDeveloperForm((current) => ({
                      ...current,
                      displayName: event.target.value,
                    }))
                  }
                  placeholder="이름 또는 회사명"
                  className="rounded-xl border border-gray-300 px-4 py-3"
                />
                <input
                  value={developerForm.headline}
                  onChange={(event) =>
                    setDeveloperForm((current) => ({
                      ...current,
                      headline: event.target.value,
                    }))
                  }
                  placeholder="한 줄 소개"
                  className="rounded-xl border border-gray-300 px-4 py-3"
                />
                <select
                  value={developerForm.type}
                  onChange={(event) =>
                    setDeveloperForm((current) => ({
                      ...current,
                      type: event.target.value as DeveloperDraftInput['type'],
                    }))
                  }
                  className="rounded-xl border border-gray-300 px-4 py-3"
                >
                  <option value="freelancer">프리랜서</option>
                  <option value="agency">에이전시</option>
                </select>
                <select
                  value={developerForm.availabilityStatus}
                  onChange={(event) =>
                    setDeveloperForm((current) => ({
                      ...current,
                      availabilityStatus: event.target.value as DeveloperDraftInput['availabilityStatus'],
                    }))
                  }
                  className="rounded-xl border border-gray-300 px-4 py-3"
                >
                  <option value="available">가능</option>
                  <option value="limited">부분 가능</option>
                  <option value="busy">바쁨</option>
                </select>
                <textarea
                  value={developerForm.introduction}
                  onChange={(event) =>
                    setDeveloperForm((current) => ({
                      ...current,
                      introduction: event.target.value,
                    }))
                  }
                  placeholder="소개"
                  className="md:col-span-2 rounded-xl border border-gray-300 px-4 py-3"
                  rows={4}
                />
                <input
                  defaultValue={developerForm.skills.join(', ')}
                  onBlur={(event) =>
                    setDeveloperForm((current) => ({
                      ...current,
                      skills: splitCsv(event.target.value),
                    }))
                  }
                  placeholder="기술 스택 (쉼표 구분)"
                  className="rounded-xl border border-gray-300 px-4 py-3"
                />
                <input
                  defaultValue={developerForm.specialties.join(', ')}
                  onBlur={(event) =>
                    setDeveloperForm((current) => ({
                      ...current,
                      specialties: splitCsv(event.target.value),
                    }))
                  }
                  placeholder="전문 분야 (쉼표 구분)"
                  className="rounded-xl border border-gray-300 px-4 py-3"
                />
                <input
                  defaultValue={developerForm.supportedProjectTypes.join(', ')}
                  onBlur={(event) =>
                    setDeveloperForm((current) => ({
                      ...current,
                      supportedProjectTypes: splitCsv(event.target.value),
                    }))
                  }
                  placeholder="가능 프로젝트 유형"
                  className="rounded-xl border border-gray-300 px-4 py-3"
                />
                <input
                  defaultValue={developerForm.supportedCoreFeatures.join(', ')}
                  onBlur={(event) =>
                    setDeveloperForm((current) => ({
                      ...current,
                      supportedCoreFeatures: splitCsv(event.target.value),
                    }))
                  }
                  placeholder="주요 기능 경험"
                  className="rounded-xl border border-gray-300 px-4 py-3"
                />
                <input
                  type="number"
                  value={developerForm.budgetMin}
                  onChange={(event) =>
                    setDeveloperForm((current) => ({
                      ...current,
                      budgetMin: Number(event.target.value),
                    }))
                  }
                  placeholder="최소 예산"
                  className="rounded-xl border border-gray-300 px-4 py-3"
                />
                <input
                  type="number"
                  value={developerForm.budgetMax}
                  onChange={(event) =>
                    setDeveloperForm((current) => ({
                      ...current,
                      budgetMax: Number(event.target.value),
                    }))
                  }
                  placeholder="최대 예산"
                  className="rounded-xl border border-gray-300 px-4 py-3"
                />
                <input
                  defaultValue={developerForm.portfolioLinks.join(', ')}
                  onBlur={(event) =>
                    setDeveloperForm((current) => ({
                      ...current,
                      portfolioLinks: splitCsv(event.target.value),
                    }))
                  }
                  placeholder="포트폴리오 링크"
                  className="md:col-span-2 rounded-xl border border-gray-300 px-4 py-3"
                />
              </div>

              <div className="mt-6">
                <button
                  onClick={handleDeveloperSave}
                  className="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white"
                >
                  저장하고 사용하기
                </button>
              </div>
            </section>

            <section className="space-y-5">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">매칭된 의뢰</h2>
                {selectedDeveloper && !selectedDeveloper.active ? (
                  <span className="rounded-full bg-amber-50 px-3 py-1 text-sm font-semibold text-amber-700">
                    승인 대기 중
                  </span>
                ) : null}
              </div>

              {selectedDeveloper && matchedProjects.length > 0 ? (
                matchedProjects.map(({ project, match, proposal }) => (
                  <article
                    key={project.id}
                    className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">{project.projectName}</h3>
                        <p className="mt-2 text-gray-600">{project.summary}</p>
                      </div>
                      <div className="rounded-full bg-blue-50 px-3 py-1 text-sm font-bold text-blue-700">
                        {Math.round(match?.score ?? 0)}점
                      </div>
                    </div>

                    <div className="mt-4 grid gap-3 md:grid-cols-3 text-sm text-gray-600">
                      <div>예산: {formatRange(project.costEstimate.totalMin, project.costEstimate.totalMax)}</div>
                      <div>상태: {project.status}</div>
                      <div>기존 제안: {proposal ? '있음' : '없음'}</div>
                    </div>

                    <div className="mt-6 grid gap-3 md:grid-cols-2">
                      <input
                        type="number"
                        defaultValue={proposal?.priceMin ?? project.costEstimate.totalMin}
                        onBlur={(event) =>
                          setProposalForms((current) => ({
                            ...current,
                            [`${project.id}-min`]: event.target.value,
                          }))
                        }
                        placeholder="최소 금액"
                        className="rounded-xl border border-gray-300 px-4 py-3"
                      />
                      <input
                        type="number"
                        defaultValue={proposal?.priceMax ?? project.costEstimate.totalMax}
                        onBlur={(event) =>
                          setProposalForms((current) => ({
                            ...current,
                            [`${project.id}-max`]: event.target.value,
                          }))
                        }
                        placeholder="최대 금액"
                        className="rounded-xl border border-gray-300 px-4 py-3"
                      />
                      <input
                        defaultValue={proposal?.durationText ?? '4~6주'}
                        onBlur={(event) =>
                          setProposalForms((current) => ({
                            ...current,
                            [`${project.id}-duration`]: event.target.value,
                          }))
                        }
                        placeholder="예상 기간"
                        className="rounded-xl border border-gray-300 px-4 py-3"
                      />
                      <input
                        defaultValue={proposal?.portfolioLinks.join(', ') ?? ''}
                        onBlur={(event) =>
                          setProposalForms((current) => ({
                            ...current,
                            [`${project.id}-portfolio`]: event.target.value,
                          }))
                        }
                        placeholder="포트폴리오 링크"
                        className="rounded-xl border border-gray-300 px-4 py-3"
                      />
                      <textarea
                        defaultValue={proposal?.message ?? ''}
                        onBlur={(event) =>
                          setProposalForms((current) => ({
                            ...current,
                            [`${project.id}-message`]: event.target.value,
                          }))
                        }
                        placeholder="고객에게 전달할 메시지"
                        className="md:col-span-2 rounded-xl border border-gray-300 px-4 py-3"
                        rows={4}
                      />
                    </div>

                    <div className="mt-5">
                      <button
                        disabled={!selectedDeveloper.active}
                        onClick={() =>
                          submitProposal({
                            projectId: project.id,
                            developerId: selectedDeveloper.id,
                            priceMin: Number(
                              proposalForms[`${project.id}-min`] ?? proposal?.priceMin ?? project.costEstimate.totalMin,
                            ),
                            priceMax: Number(
                              proposalForms[`${project.id}-max`] ?? proposal?.priceMax ?? project.costEstimate.totalMax,
                            ),
                            durationText:
                              proposalForms[`${project.id}-duration`] ?? proposal?.durationText ?? '4~6주',
                            message:
                              proposalForms[`${project.id}-message`] ??
                              proposal?.message ??
                              `${project.projectName}에 맞춰 MVP 범위를 빠르게 제안드립니다.`,
                            portfolioLinks: splitCsv(
                              proposalForms[`${project.id}-portfolio`] ??
                                proposal?.portfolioLinks.join(', ') ??
                                '',
                            ),
                          })
                        }
                        className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:bg-gray-300"
                      >
                        <Send className="h-4 w-4" />
                        제안 제출
                      </button>
                    </div>
                  </article>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center text-gray-600">
                  {selectedDeveloper
                    ? '현재 선택한 전문가에게 매칭된 의뢰가 없습니다.'
                    : '왼쪽에서 전문가를 선택하거나 새로 등록해 주세요.'}
                </div>
              )}
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
