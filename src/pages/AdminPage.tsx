import { useMemo, useState } from 'react';
import { loadPricingOverrides, savePricingOverrides, getPricingConfig } from '@/data/pricing';
import { useMarketplaceStore } from '@/store/useMarketplaceStore';
import { formatRange } from '@/lib/utils';

export function AdminPage() {
  const { projects, developers, approveDeveloper } = useMarketplaceStore();
  const pricingConfig = getPricingConfig();
  const initialOverrides = loadPricingOverrides();
  const [designTemplate, setDesignTemplate] = useState(
    initialOverrides.designMultipliers?.template ?? pricingConfig.designMultipliers.template,
  );
  const [designCustom, setDesignCustom] = useState(
    initialOverrides.designMultipliers?.custom ?? pricingConfig.designMultipliers.custom,
  );
  const [designPremium, setDesignPremium] = useState(
    initialOverrides.designMultipliers?.premium ?? pricingConfig.designMultipliers.premium,
  );
  const [timelineUrgent, setTimelineUrgent] = useState(
    initialOverrides.timelineMultipliers?.urgent ?? pricingConfig.timelineMultipliers.urgent,
  );
  const [timelineRush, setTimelineRush] = useState(
    initialOverrides.timelineMultipliers?.rush ?? pricingConfig.timelineMultipliers.rush,
  );

  const pendingDevelopers = useMemo(
    () => developers.filter((developer) => !developer.active),
    [developers],
  );

  const handleSavePricing = () => {
    savePricingOverrides({
      designMultipliers: {
        template: designTemplate,
        custom: designCustom,
        premium: designPremium,
      },
      timelineMultipliers: {
        flexible: pricingConfig.timelineMultipliers.flexible,
        standard: pricingConfig.timelineMultipliers.standard,
        urgent: timelineUrgent,
        rush: timelineRush,
      },
    });
  };

  return (
    <div className="bg-gray-50 px-6 py-10">
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
              <p className="mt-2 text-3xl font-bold text-gray-900">
                {projects.filter((project) => project.status !== 'submitted').length}
              </p>
            </div>
          </div>
        </section>

        <section className="grid gap-8 xl:grid-cols-2">
          <article className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-gray-100">
            <h2 className="text-xl font-bold text-gray-900">전문가 승인</h2>
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
                    </div>
                    <button
                      onClick={() => approveDeveloper(developer.id)}
                      className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white"
                    >
                      승인
                    </button>
                  </div>
                ))
              )}
            </div>
          </article>

          <article className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-gray-100">
            <h2 className="text-xl font-bold text-gray-900">가격 룰 관리</h2>
            <p className="mt-2 text-sm text-gray-600">저장 후 새 견적 계산부터 반영됩니다.</p>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <label className="space-y-2">
                <span className="text-sm font-medium text-gray-700">템플릿 디자인</span>
                <input
                  type="number"
                  step="0.1"
                  value={designTemplate}
                  onChange={(event) => setDesignTemplate(Number(event.target.value))}
                  className="w-full rounded-xl border border-gray-300 px-4 py-3"
                />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium text-gray-700">커스텀 디자인</span>
                <input
                  type="number"
                  step="0.1"
                  value={designCustom}
                  onChange={(event) => setDesignCustom(Number(event.target.value))}
                  className="w-full rounded-xl border border-gray-300 px-4 py-3"
                />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium text-gray-700">프리미엄 디자인</span>
                <input
                  type="number"
                  step="0.1"
                  value={designPremium}
                  onChange={(event) => setDesignPremium(Number(event.target.value))}
                  className="w-full rounded-xl border border-gray-300 px-4 py-3"
                />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium text-gray-700">긴급 일정</span>
                <input
                  type="number"
                  step="0.1"
                  value={timelineUrgent}
                  onChange={(event) => setTimelineUrgent(Number(event.target.value))}
                  className="w-full rounded-xl border border-gray-300 px-4 py-3"
                />
              </label>
              <label className="space-y-2 md:col-span-2">
                <span className="text-sm font-medium text-gray-700">초긴급 일정</span>
                <input
                  type="number"
                  step="0.1"
                  value={timelineRush}
                  onChange={(event) => setTimelineRush(Number(event.target.value))}
                  className="w-full rounded-xl border border-gray-300 px-4 py-3"
                />
              </label>
            </div>

            <button
              onClick={handleSavePricing}
              className="mt-6 rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white"
            >
              가격 룰 저장
            </button>
          </article>
        </section>

        <section className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-gray-100">
          <h2 className="text-xl font-bold text-gray-900">프로젝트 목록</h2>
          <div className="mt-6 space-y-4">
            {projects.map((project) => (
              <div
                key={project.id}
                className="grid gap-3 rounded-xl border border-gray-200 p-4 md:grid-cols-[1.4fr_1fr_0.8fr]"
              >
                <div>
                  <p className="font-semibold text-gray-900">{project.projectName}</p>
                  <p className="mt-1 text-sm text-gray-500">{project.summary}</p>
                </div>
                <div className="text-sm text-gray-600">
                  {formatRange(project.costEstimate.totalMin, project.costEstimate.totalMax)}
                </div>
                <div className="text-sm font-semibold uppercase text-gray-700">{project.status}</div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
