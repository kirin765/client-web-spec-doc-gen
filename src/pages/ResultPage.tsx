// =============================================================================
// ResultPage — 결과 페이지 (비용 견적 + 요구사항 문서 + 개발자 매칭)
// =============================================================================
// 페이지 기능:
// 1. 페이지 진입 시 useQuoteStore에서 answers 읽기, 비어있으면 /wizard로 리다이렉트
// 2. 상단: 완료 메시지 ("견적이 준비되었습니다!" + 프로젝트명)
// 3. 탭 구성:
//    - 비용 요약 탭: <CostSummary estimate={costEstimate} />
//    - 요구사항 명세서 탭: <RequirementsPreview document={reqDocument} />
//    - 개발자 매칭 탭: <DeveloperMatchSection results={matchResults} />
// 4. 액션 버튼: PDF 다운로드 / 수정하기 / 새 견적 시작
// 5. 레이아웃: max-w-5xl 중앙 정렬, Header + 콘텐츠 + Footer
// 
// 개발자 매칭 구현:
// - matchingInput은 costEstimate 준비 후 buildMatchingInput()으로 생성
// - matchResults는 matchDevelopers(matchingInput, developerProfiles)로 계산
// - 결과는 ResultPage 탭에서만 노출, PDF/HTML 문서에는 미포함
// =============================================================================

import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuoteStore } from '@/store/useQuoteStore';
import { useAuthStore } from '@/store/useAuthStore';
import { calculateCost } from '@/lib/costCalculator';
import { generateDocument } from '@/lib/documentGenerator';
import { buildMatchingInput, matchDevelopers } from '@/lib/developerMatcher';
import { downloadPdf } from '@/lib/downloadPdf';
import { createDraftProjectRequest, submitProjectRequest } from '@/lib/api';
import { CostSummary } from '@/components/result/CostSummary';
import { RequirementsPreview } from '@/components/result/RequirementsPreview';
import { DeveloperMatchSection } from '@/components/result/DeveloperMatchSection';
import { Seo } from '@/components/seo/Seo';
import { LoadingButton } from '@/components/common/LoadingButton';
import { developerProfiles } from '@/data/developerProfiles';
import { FileDown, Plus, Edit, Save, CheckCircle2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export function ResultPage() {
  const navigate = useNavigate();
  const { answers, resetQuote } = useQuoteStore();
  const token = useAuthStore((state) => state.token);
  const [activeTab, setActiveTab] = useState<'cost' | 'document' | 'matching'>('cost');
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [isSavingToServer, setIsSavingToServer] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const { t } = useTranslation('common');
  const hasAnswers = Boolean(answers && Object.keys(answers).length > 0);

  const costEstimate = useMemo(() => calculateCost(answers), [answers]);
  const reqDocument = useMemo(() => generateDocument(answers, costEstimate), [answers, costEstimate]);
  const matchingInput = useMemo(() => buildMatchingInput(answers, costEstimate), [answers, costEstimate]);
  const matchResults = useMemo(() => matchDevelopers(matchingInput, developerProfiles), [matchingInput]);

  // answers가 비어있으면 wizard로 리다이렉트
  useEffect(() => {
    if (!hasAnswers) {
      navigate('/wizard');
      return;
    }
  }, [hasAnswers, navigate]);

  if (!hasAnswers) {
    return null;
  }

  const handleNewQuote = () => {
    resetQuote();
    navigate('/wizard');
  };

  const handleEdit = () => {
    navigate('/wizard');
  };

  const handleSaveMyQuote = async () => {
    if (!token) {
      setSaveError('로그인 후 저장할 수 있습니다.');
      return;
    }

    setIsSavingToServer(true);
    setSaveMessage(null);
    setSaveError(null);

    try {
      const projectName = String(reqDocument.clientInfo.projectName || '새 견적서');
      const siteType = String(answers.siteType || 'landing');
      const draft = await createDraftProjectRequest(token, {
        projectName,
        siteType,
      });

      await submitProjectRequest(token, draft.id, {
        ...answers,
        projectName,
        siteType,
        budgetMin: costEstimate.totalMin,
        budgetMax: costEstimate.totalMax,
      });

      setSaveMessage('내 견적서 목록에 저장되었습니다.');
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : '견적서 저장에 실패했습니다.');
    } finally {
      setIsSavingToServer(false);
    }
  };

  const handleDownloadPdf = async () => {
    setIsDownloadingPdf(true);
    try {
      await downloadPdf(reqDocument);
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Seo
        title={`결과 확인 | ${reqDocument.clientInfo.projectName || '프로젝트'} | 웹사이트 견적 자동 생성기`}
        description="요구사항 문서, 예상 비용 범위, 개발자 매칭 결과를 한 화면에서 확인하고 PDF로 다운로드하세요."
        noIndex
      />
      {/* 완료 메시지 */}
      <section className="border-b bg-white px-6 py-12">
        <div className="mx-auto max-w-5xl">
          <h1 className="text-4xl font-bold text-gray-900">{t('result.title')}</h1>
          <p className="mt-2 text-lg text-gray-600">"{reqDocument.clientInfo.projectName}"</p>
        </div>
      </section>

      {/* 탭 */}
      <section className="border-b bg-white">
        <div className="mx-auto max-w-5xl px-6">
          <div className="flex gap-8">
            <button
              onClick={() => setActiveTab('cost')}
              className={`border-b-2 py-4 font-semibold transition-colors ${
                activeTab === 'cost'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              {t('result.tabCost')}
            </button>
            <button
              onClick={() => setActiveTab('document')}
              className={`border-b-2 py-4 font-semibold transition-colors ${
                activeTab === 'document'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              {t('result.tabDocument')}
            </button>
            <button
              onClick={() => setActiveTab('matching')}
              className={`border-b-2 py-4 font-semibold transition-colors ${
                activeTab === 'matching'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              {t('result.tabMatching')}
            </button>
          </div>
        </div>
      </section>

      {/* 콘텐츠 */}
      <section className="px-6 py-12">
        <div className="mx-auto max-w-5xl">
          {activeTab === 'cost' && <CostSummary estimate={costEstimate} />}
          {activeTab === 'document' && <RequirementsPreview document={reqDocument} />}
          {activeTab === 'matching' && <DeveloperMatchSection results={matchResults} />}
        </div>
      </section>

      {/* 액션 버튼 */}
      <section className="border-t bg-white px-6 py-8">
        <div className="mx-auto max-w-5xl">
          <div className="flex flex-wrap gap-4 justify-center sm:justify-start">
            <LoadingButton
              loading={isDownloadingPdf}
              loadingLabel="PDF 생성 중..."
              onClick={() => void handleDownloadPdf()}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400"
            >
              <FileDown className="h-5 w-5" />
              {t('result.pdfDownload')}
            </LoadingButton>
            <button
              onClick={handleEdit}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-6 py-3 font-semibold text-gray-700 transition-colors hover:bg-gray-50"
            >
              <Edit className="h-5 w-5" />
              {t('result.edit')}
            </button>
            <button
              onClick={handleNewQuote}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-6 py-3 font-semibold text-gray-700 transition-colors hover:bg-gray-50"
            >
              <Plus className="h-5 w-5" />
              {t('result.newQuote')}
            </button>
            <LoadingButton
              onClick={() => void handleSaveMyQuote()}
              loading={isSavingToServer}
              loadingLabel="저장 중..."
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-gray-300"
            >
              <Save className="h-5 w-5" />
              내 견적서에 저장
            </LoadingButton>
            {token ? (
              <Link
                to="/quotes"
                className="inline-flex items-center gap-2 rounded-lg border border-emerald-200 px-6 py-3 font-semibold text-emerald-700 transition-colors hover:bg-emerald-50"
              >
                <CheckCircle2 className="h-5 w-5" />
                내 견적서 보기
              </Link>
            ) : null}
          </div>
          {saveMessage ? <p className="mt-4 text-sm font-semibold text-emerald-700">{saveMessage}</p> : null}
          {saveError ? <p className="mt-4 text-sm font-semibold text-rose-700">{saveError}</p> : null}
        </div>
      </section>
    </div>
  );
}
