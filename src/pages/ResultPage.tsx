// ResultPage — 비용 견적 + 요구사항 문서 + 개발자 매칭 결과 페이지.
// 3탭 구성(cost/document/matching), PDF 다운로드, 수정, 새 견적 액션.
// useMemo로 costEstimate, reqDocument, matchResults 메모이제이션.

import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuoteStore } from '@/store/useQuoteStore';
import { calculateCost } from '@/lib/costCalculator';
import { generateDocument } from '@/lib/documentGenerator';
import { buildMatchingInput, matchDevelopers } from '@/lib/developerMatcher';
import { downloadPdf } from '@/lib/downloadPdf';
import { CostSummary } from '@/components/result/CostSummary';
import { RequirementsPreview } from '@/components/result/RequirementsPreview';
import { DeveloperMatchSection } from '@/components/result/DeveloperMatchSection';
import { developerProfiles } from '@/data/developerProfiles';
import { FileDown, Plus, Edit } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { Answers } from '@/types';

const EMPTY_ANSWERS: Answers = {};

export function ResultPage() {
  const navigate = useNavigate();
  const { answers, resetQuote } = useQuoteStore();
  const [activeTab, setActiveTab] = useState<'cost' | 'document' | 'matching'>('cost');
  const { t } = useTranslation('common');

  // answers가 비어있으면 wizard로 리다이렉트
  useEffect(() => {
    if (!answers || Object.keys(answers).length === 0) {
      navigate('/wizard');
      return;
    }
    document.title = '웹사이트 견적 생성기 - 결과';
  }, [answers, navigate]);

  const hasAnswers = Boolean(answers && Object.keys(answers).length > 0);
  const effectiveAnswers = useMemo<Answers>(
    () => (hasAnswers ? answers : EMPTY_ANSWERS),
    [answers, hasAnswers],
  );

  const costEstimate = useMemo(() => calculateCost(effectiveAnswers), [effectiveAnswers]);
  const reqDocument = useMemo(
    () => generateDocument(effectiveAnswers, costEstimate),
    [effectiveAnswers, costEstimate],
  );
  const matchingInput = useMemo(
    () => buildMatchingInput(effectiveAnswers, costEstimate),
    [effectiveAnswers, costEstimate],
  );
  const matchResults = useMemo(() => matchDevelopers(matchingInput, developerProfiles), [matchingInput]);

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

  return (
    <div className="min-h-screen bg-gray-50">
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
            <button
              onClick={() => downloadPdf(reqDocument)}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-blue-700"
            >
              <FileDown className="h-5 w-5" />
              {t('result.pdfDownload')}
            </button>
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
          </div>
        </div>
      </section>
    </div>
  );
}
