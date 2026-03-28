import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Briefcase, Mail, RefreshCw } from 'lucide-react';
import { Seo } from '@/components/seo/Seo';
import { LoadingButton } from '@/components/common/LoadingButton';
import { listDevelopers } from '@/lib/api';
import type { DeveloperProfileApi } from '@/types/api';
import { formatRange } from '@/lib/utils';
import { useAuthStore } from '@/store/useAuthStore';

export function ExpertDirectoryPage() {
  const user = useAuthStore((state) => state.user);
  const [developers, setDevelopers] = useState<DeveloperProfileApi[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadDevelopers = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const list = await listDevelopers();
      setDevelopers(list);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : '전문가 목록을 불러오지 못했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadDevelopers();
  }, []);

  return (
    <div className="bg-gray-50 px-6 py-10">
      <Seo
        title="전문가 리스트 | 웹사이트 견적 자동 생성기"
        description="등록된 전문가를 조회하고 상세 페이지에서 견적서를 보낼 수 있습니다."
        noIndex
      />
      <div className="mx-auto max-w-7xl space-y-8">
        <section className="rounded-2xl bg-slate-900 px-8 py-10 text-white shadow-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-200">
            전문가 조회
          </p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight">
            전문가를 선택하고
            <br />
            내 견적서 1건을 보낼 수 있습니다.
          </h1>
          <p className="mt-4 max-w-2xl text-slate-300">
            로그인한 Gmail이 사용자의 유일한 연락처이며, 전문가도 자신의 Google Gmail만 연락처로
            사용합니다.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            {user ? (
              <Link
                to="/quotes"
                className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-slate-900"
              >
                내 견적서
                <ArrowRight className="h-4 w-4" />
              </Link>
            ) : (
              <span className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-3 text-sm font-semibold text-white">
                <Mail className="h-4 w-4" />
                로그인 후 발송 가능
              </span>
            )}
            {user?.hasExpertProfile ? (
              <Link
                to="/mypage"
                className="inline-flex items-center gap-2 rounded-xl border border-white/25 px-4 py-3 text-sm font-semibold text-white"
              >
                전문가 마이페이지
              </Link>
            ) : null}
          </div>
        </section>

        <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-bold text-gray-900">전문가 목록</h2>
            <LoadingButton
              loading={isRefreshing}
              loadingLabel="새로고침 중..."
              onClick={async () => {
                setIsRefreshing(true);
                try {
                  await loadDevelopers();
                } finally {
                  setIsRefreshing(false);
                }
              }}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700"
            >
              <RefreshCw className="h-4 w-4" />
              새로고침
            </LoadingButton>
          </div>

          {isLoading ? (
            <p className="mt-6 text-gray-600">불러오는 중...</p>
          ) : errorMessage ? (
            <p className="mt-6 text-rose-600">{errorMessage}</p>
          ) : developers.length === 0 ? (
            <div className="mt-6 rounded-xl border border-dashed border-gray-300 p-10 text-center text-gray-600">
              조회 가능한 전문가가 없습니다.
            </div>
          ) : (
            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {developers.map((developer) => (
                <article key={developer.id} className="rounded-2xl border border-gray-200 p-5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{developer.displayName}</h3>
                      <p className="mt-1 text-sm text-gray-600">{developer.headline}</p>
                    </div>
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                        developer.active
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-amber-50 text-amber-700'
                      }`}
                    >
                      {developer.active ? '활성' : '승인대기'}
                    </span>
                  </div>

                  <p className="mt-3 text-sm leading-6 text-gray-700">
                    {developer.introduction || '소개가 등록되지 않았습니다.'}
                  </p>

                  <div className="mt-4 text-sm text-gray-600">
                    <p>유형: {developer.type === 'agency' ? '에이전시' : '프리랜서'}</p>
                    <p className="mt-1">예산: {formatRange(developer.budgetMin, developer.budgetMax)}</p>
                    <p className="mt-1">활동 지역: {developer.region?.name || '미설정'}</p>
                    <p className="mt-1">
                      리뷰 {developer.reviewCount}개 · 평균 {developer.reviewAverage.toFixed(1)}점
                    </p>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {developer.specialties.slice(0, 3).map((specialty) => (
                      <span key={specialty} className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
                        {specialty}
                      </span>
                    ))}
                  </div>

                  <div className="mt-5">
                    <Link
                      to={`/experts/${developer.id}`}
                      className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white"
                    >
                      <Briefcase className="h-4 w-4" />
                      상세 보기
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
