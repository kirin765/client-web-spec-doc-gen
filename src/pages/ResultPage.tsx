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

  if (!answers || Object.keys(answers).length === 0) {
    return null;
  }

  const costEstimate = useMemo(() => calculateCost(answers), [answers]);
  const reqDocument = useMemo(() => generateDocument(answers, costEstimate), [answers, costEstimate]);
  const matchingInput = useMemo(() => buildMatchingInput(answers, costEstimate), [answers, costEstimate]);
  const matchResults = useMemo(() => matchDevelopers(matchingInput, developerProfiles), [matchingInput]);

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
