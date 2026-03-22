// =============================================================================
// ResultPage — 결과 페이지 (비용 견적 + 요구사항 문서)
// =============================================================================
//
// TODO 구현 사항:
// 1. 페이지 진입 시:
//    - useQuoteStore에서 answers 읽기
//    - answers가 비어있으면 /wizard로 리다이렉트
//    - calculateCost(answers)로 비용 계산
//    - generateDocument(answers, costEstimate)로 문서 생성
//
// 2. 상단: 완료 메시지
//    - "견적이 준비되었습니다!" 제목
//    - 프로젝트명 표시
//
// 3. 탭 또는 섹션 구성:
//    a. 비용 요약 탭:
//       - <CostSummary estimate={costEstimate} />
//    b. 요구사항 명세서 탭:
//       - <RequirementsPreview document={reqDocument} />
//
// 4. 액션 버튼:
//    - "PDF 다운로드" → downloadPdf(reqDocument) 호출
//    - "새 견적 시작" → resetQuote() + /wizard로 navigate
//    - "수정하기" → /wizard로 navigate (answers 유지)
//
// 5. 레이아웃: max-w-5xl 중앙 정렬, Header + 콘텐츠 + Footer
// =============================================================================

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuoteStore } from '@/store/useQuoteStore';
import { calculateCost } from '@/lib/costCalculator';
import { generateDocument } from '@/lib/documentGenerator';
import { downloadPdf } from '@/components/result/PdfDocument';
import { CostSummary } from '@/components/result/CostSummary';
import { RequirementsPreview } from '@/components/result/RequirementsPreview';
import { FileDown, Plus, Edit } from 'lucide-react';

export function ResultPage() {
  const navigate = useNavigate();
  const { answers, resetQuote } = useQuoteStore();
  const [activeTab, setActiveTab] = useState<'cost' | 'document'>('cost');

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

  const costEstimate = calculateCost(answers);
  const reqDocument = generateDocument(answers, costEstimate);

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
          <h1 className="text-4xl font-bold text-gray-900">견적이 준비되었습니다!</h1>
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
              비용 요약
            </button>
            <button
              onClick={() => setActiveTab('document')}
              className={`border-b-2 py-4 font-semibold transition-colors ${
                activeTab === 'document'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              명세서 미리보기
            </button>
          </div>
        </div>
      </section>

      {/* 콘텐츠 */}
      <section className="px-6 py-12">
        <div className="mx-auto max-w-5xl">
          {activeTab === 'cost' && <CostSummary estimate={costEstimate} />}
          {activeTab === 'document' && <RequirementsPreview document={reqDocument} />}
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
              PDF 다운로드
            </button>
            <button
              onClick={handleEdit}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-6 py-3 font-semibold text-gray-700 transition-colors hover:bg-gray-50"
            >
              <Edit className="h-5 w-5" />
              수정하기
            </button>
            <button
              onClick={handleNewQuote}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-6 py-3 font-semibold text-gray-700 transition-colors hover:bg-gray-50"
            >
              <Plus className="h-5 w-5" />
              새 견적 시작
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
