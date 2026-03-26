import { useCallback, useEffect, useState } from 'react';
import { CheckCircle2, Mail, RefreshCw, Save, XCircle } from 'lucide-react';
import { Seo } from '@/components/seo/Seo';
import {
  ApiError,
  approveQuoteShareByDeveloper,
  cancelQuoteShareByDeveloper,
  getMyDeveloperProfile,
  getQuoteShareDetail,
  listInboxQuoteShares,
  upsertMyDeveloperProfile,
} from '@/lib/api';
import type { QuoteShareItem, UpsertDeveloperProfilePayload } from '@/types/api';
import { useAuthStore } from '@/store/useAuthStore';

function splitCsv(value: string) {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

type DeveloperFormState = {
  displayName: string;
  type: 'freelancer' | 'agency';
  headline: string;
  introduction: string;
  skills: string;
  specialties: string;
  supportedProjectTypes: string;
  budgetMin: string;
  budgetMax: string;
  availabilityStatus: 'available' | 'busy' | 'limited';
  avgResponseHours: string;
  portfolioLinks: string;
  regions: string;
  languages: string;
};

const INITIAL_FORM: DeveloperFormState = {
  displayName: '',
  type: 'freelancer',
  headline: '',
  introduction: '',
  skills: '',
  specialties: '',
  supportedProjectTypes: '',
  budgetMin: '1000000',
  budgetMax: '5000000',
  availabilityStatus: 'available',
  avgResponseHours: '24',
  portfolioLinks: '',
  regions: 'KR',
  languages: 'ko',
};

export function MyPage() {
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const updateUser = useAuthStore((state) => state.updateUser);
  const [form, setForm] = useState<DeveloperFormState>(INITIAL_FORM);
  const [inbox, setInbox] = useState<QuoteShareItem[]>([]);
  const [selectedDetail, setSelectedDetail] = useState<QuoteShareItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const [profile, inboxItems] = await Promise.all([
        getMyDeveloperProfile(token).catch((error) => {
          if (error instanceof ApiError && error.status === 404) {
            return null;
          }
          throw error;
        }),
        listInboxQuoteShares(token).catch((error) => {
          if (error instanceof ApiError && error.status === 404) {
            return [];
          }
          throw error;
        }),
      ]);

      if (profile) {
        setForm({
          displayName: profile.displayName,
          type: profile.type,
          headline: profile.headline,
          introduction: profile.introduction || '',
          skills: profile.skills.join(', '),
          specialties: profile.specialties.join(', '),
          supportedProjectTypes: profile.supportedProjectTypes.join(', '),
          budgetMin: String(profile.budgetMin),
          budgetMax: String(profile.budgetMax),
          availabilityStatus: profile.availabilityStatus,
          avgResponseHours: String(profile.avgResponseHours),
          portfolioLinks: profile.portfolioLinks.join(', '),
          regions: profile.regions.join(', '),
          languages: profile.languages.join(', '),
        });
        updateUser({
          hasDeveloperProfile: true,
          developerProfileId: profile.id,
        });
      }

      setInbox(inboxItems);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : '마이페이지를 불러오지 못했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, [token, updateUser]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  if (!token || !user) return null;

  const payload: UpsertDeveloperProfilePayload = {
    displayName: form.displayName,
    type: form.type,
    headline: form.headline,
    introduction: form.introduction,
    skills: splitCsv(form.skills),
    specialties: splitCsv(form.specialties),
    supportedProjectTypes: splitCsv(form.supportedProjectTypes),
    budgetMin: Number(form.budgetMin || 0),
    budgetMax: Number(form.budgetMax || 0),
    availabilityStatus: form.availabilityStatus,
    avgResponseHours: Number(form.avgResponseHours || 24),
    portfolioLinks: splitCsv(form.portfolioLinks),
    regions: splitCsv(form.regions),
    languages: splitCsv(form.languages),
  };

  return (
    <div className="bg-gray-50 px-6 py-10">
      <Seo
        title="전문가 마이페이지 | 웹사이트 견적 자동 생성기"
        description="전문가 프로필을 관리하고 나에게 온 견적서를 처리합니다."
        noIndex
      />
      <div className="mx-auto max-w-6xl space-y-8">
        <section className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-gray-100">
          <p className="text-sm font-semibold text-blue-600">전문가 마이페이지</p>
          <h1 className="mt-2 text-3xl font-bold text-gray-900">프로필 및 받은 견적서 관리</h1>
          <p className="mt-3 text-gray-600">
            연락처는 Google 로그인 Gmail만 사용되며, 별도 연락처 입력은 지원하지 않습니다.
          </p>
        </section>

        <section className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-gray-100">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-xl font-bold text-gray-900">전문가 등록 폼</h2>
            <button
              onClick={() => void loadData()}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700"
            >
              <RefreshCw className="h-4 w-4" />
              새로고침
            </button>
          </div>
          <p className="mt-3 text-sm text-gray-600">연락 Gmail: {user.email}</p>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <input
              value={form.displayName}
              onChange={(event) => setForm((prev) => ({ ...prev, displayName: event.target.value }))}
              placeholder="이름 또는 회사명"
              className="rounded-xl border border-gray-300 px-4 py-3"
            />
            <input
              value={form.headline}
              onChange={(event) => setForm((prev) => ({ ...prev, headline: event.target.value }))}
              placeholder="한 줄 소개"
              className="rounded-xl border border-gray-300 px-4 py-3"
            />
            <select
              value={form.type}
              onChange={(event) => setForm((prev) => ({ ...prev, type: event.target.value as 'freelancer' | 'agency' }))}
              className="rounded-xl border border-gray-300 px-4 py-3"
            >
              <option value="freelancer">프리랜서</option>
              <option value="agency">에이전시</option>
            </select>
            <select
              value={form.availabilityStatus}
              onChange={(event) => setForm((prev) => ({ ...prev, availabilityStatus: event.target.value as 'available' | 'busy' | 'limited' }))}
              className="rounded-xl border border-gray-300 px-4 py-3"
            >
              <option value="available">가능</option>
              <option value="limited">부분 가능</option>
              <option value="busy">바쁨</option>
            </select>
            <textarea
              value={form.introduction}
              onChange={(event) => setForm((prev) => ({ ...prev, introduction: event.target.value }))}
              placeholder="소개"
              rows={4}
              className="md:col-span-2 rounded-xl border border-gray-300 px-4 py-3"
            />
            <input
              value={form.skills}
              onChange={(event) => setForm((prev) => ({ ...prev, skills: event.target.value }))}
              placeholder="기술 스택 (쉼표 구분)"
              className="rounded-xl border border-gray-300 px-4 py-3"
            />
            <input
              value={form.specialties}
              onChange={(event) => setForm((prev) => ({ ...prev, specialties: event.target.value }))}
              placeholder="전문 분야 (쉼표 구분)"
              className="rounded-xl border border-gray-300 px-4 py-3"
            />
            <input
              value={form.supportedProjectTypes}
              onChange={(event) => setForm((prev) => ({ ...prev, supportedProjectTypes: event.target.value }))}
              placeholder="가능 프로젝트 유형 (쉼표)"
              className="rounded-xl border border-gray-300 px-4 py-3"
            />
            <input
              value={form.avgResponseHours}
              onChange={(event) => setForm((prev) => ({ ...prev, avgResponseHours: event.target.value }))}
              placeholder="평균 응답시간(시간)"
              className="rounded-xl border border-gray-300 px-4 py-3"
            />
            <input
              value={form.budgetMin}
              onChange={(event) => setForm((prev) => ({ ...prev, budgetMin: event.target.value }))}
              placeholder="최소 예산"
              className="rounded-xl border border-gray-300 px-4 py-3"
            />
            <input
              value={form.budgetMax}
              onChange={(event) => setForm((prev) => ({ ...prev, budgetMax: event.target.value }))}
              placeholder="최대 예산"
              className="rounded-xl border border-gray-300 px-4 py-3"
            />
            <input
              value={form.portfolioLinks}
              onChange={(event) => setForm((prev) => ({ ...prev, portfolioLinks: event.target.value }))}
              placeholder="포트폴리오 링크 (쉼표)"
              className="rounded-xl border border-gray-300 px-4 py-3"
            />
            <input
              value={form.regions}
              onChange={(event) => setForm((prev) => ({ ...prev, regions: event.target.value }))}
              placeholder="활동 지역 (쉼표)"
              className="rounded-xl border border-gray-300 px-4 py-3"
            />
            <input
              value={form.languages}
              onChange={(event) => setForm((prev) => ({ ...prev, languages: event.target.value }))}
              placeholder="가능 언어 (쉼표)"
              className="rounded-xl border border-gray-300 px-4 py-3"
            />
          </div>

          <div className="mt-6">
            <button
              disabled={isSaving}
              onClick={async () => {
                if (!token) return;
                setIsSaving(true);
                setErrorMessage(null);
                setSuccessMessage(null);
                try {
                  const profile = await upsertMyDeveloperProfile(token, payload);
                  updateUser({
                    hasDeveloperProfile: true,
                    developerProfileId: profile.id,
                  });
                  setSuccessMessage('프로필이 저장되었습니다. 관리자 승인 후 활성화됩니다.');
                } catch (error) {
                  setErrorMessage(error instanceof Error ? error.message : '저장 실패');
                } finally {
                  setIsSaving(false);
                }
              }}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:bg-gray-300"
            >
              <Save className="h-4 w-4" />
              저장
            </button>
          </div>
        </section>

        <section className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-gray-100">
          <h2 className="text-xl font-bold text-gray-900">나에게 온 견적서</h2>
          {isLoading ? <p className="mt-4 text-gray-600">불러오는 중...</p> : null}
          {!isLoading && inbox.length === 0 ? (
            <div className="mt-4 rounded-xl border border-dashed border-gray-300 p-8 text-center text-gray-600">
              도착한 견적서가 없습니다.
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              {inbox.map((share) => (
                <article key={share.id} className="rounded-xl border border-gray-200 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-gray-900">
                        {share.projectRequest?.projectName || '견적서'}
                      </p>
                      <p className="mt-1 text-sm text-gray-500">
                        상태: {share.status === 'approved' ? '승인됨' : '대기중'}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={async () => {
                          if (!token) return;
                          const detail = await getQuoteShareDetail(token, share.id);
                          setSelectedDetail(detail);
                        }}
                        className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-700"
                      >
                        상세
                      </button>
                      {share.status === 'sent' ? (
                        <>
                          <button
                            onClick={async () => {
                              if (!token) return;
                              await approveQuoteShareByDeveloper(token, share.id);
                              await loadData();
                            }}
                            className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white"
                          >
                            <CheckCircle2 className="h-4 w-4" />
                            승인
                          </button>
                          <button
                            onClick={async () => {
                              if (!token) return;
                              await cancelQuoteShareByDeveloper(token, share.id);
                              await loadData();
                            }}
                            className="inline-flex items-center gap-1 rounded-lg border border-rose-200 px-3 py-2 text-sm font-semibold text-rose-700"
                          >
                            <XCircle className="h-4 w-4" />
                            취소
                          </button>
                        </>
                      ) : null}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}

          {selectedDetail ? (
            <div className="mt-6 rounded-xl bg-gray-50 p-4 text-sm text-gray-700">
              <p>선택 견적 상태: {selectedDetail.status}</p>
              {selectedDetail.counterpartyEmail ? (
                <p className="mt-2 inline-flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-emerald-700">
                  <Mail className="h-4 w-4" />
                  사용자 Gmail: {selectedDetail.counterpartyEmail}
                </p>
              ) : (
                <p className="mt-2 text-gray-500">승인된 견적서에서만 사용자 Gmail이 노출됩니다.</p>
              )}
            </div>
          ) : null}
        </section>

        {errorMessage ? (
          <section className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-rose-700">
            {errorMessage}
          </section>
        ) : null}
        {successMessage ? (
          <section className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-emerald-700">
            {successMessage}
          </section>
        ) : null}
      </div>
    </div>
  );
}
