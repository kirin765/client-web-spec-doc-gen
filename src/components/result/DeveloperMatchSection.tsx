// =============================================================================
// DeveloperMatchSection — 결과 페이지용 개발자 매칭 섹션
// =============================================================================

import type { DeveloperMatchResult } from '@/types/matching';
import { DeveloperMatchCard } from './DeveloperMatchCard';
import { AlertCircle, Edit } from 'lucide-react';

interface DeveloperMatchSectionProps {
  results: DeveloperMatchResult[];
  summary?: string;
  emptyMessage?: string;
}

export function DeveloperMatchSection({
  results,
  summary = '프로젝트 조건에 맞는 추천 개발자',
  emptyMessage = '현재 조건에 맞는 추천 개발자가 없습니다.',
}: DeveloperMatchSectionProps) {
  const displayResults = results.slice(0, 3);
  const isEmpty = displayResults.length === 0;

  if (isEmpty) {
    return (
      <div className="rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-12 text-center">
        <AlertCircle className="mx-auto mb-4 h-12 w-12 text-gray-400" />
        <h3 className="mb-2 text-lg font-semibold text-gray-700">{emptyMessage}</h3>
        <p className="mb-6 text-sm text-gray-600">
          프로젝트 요구사항을 수정하여 다른 개발자를 찾아보세요.
        </p>
        <a
          href="/wizard"
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-blue-700"
        >
          <Edit className="h-5 w-5" />
          수정하기
        </a>
      </div>
    );
  }

  return (
    <div>
      {/* 요약 */}
      <div className="mb-8">
        <h2 className="mb-2 text-2xl font-bold text-gray-900">{summary}</h2>
        <p className="text-gray-600">
          프로젝트의 비용, 기능, 일정 조건을 바탕으로 최적의 개발자를 추천했습니다.
        </p>
      </div>

      {/* 개발자 카드 목록 */}
      <div className="grid gap-6">
        {displayResults.map((result) => (
          <DeveloperMatchCard key={result.developer.id} result={result} />
        ))}
      </div>

      {/* 보조 안내 */}
      <div className="mt-8 rounded-lg bg-blue-50 p-4">
        <p className="text-sm text-blue-900">
          <span className="font-semibold">📌 안내:</span> 위 추천 결과는 자동으로 계산된 참고 자료입니다.
          실제 프로젝트 진행 전에 선택된 개발자와 상담을 통해 상세 내용을 확인해주시기 바랍니다.
        </p>
      </div>
    </div>
  );
}
