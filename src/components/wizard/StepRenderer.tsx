// =============================================================================
// StepRenderer — 현재 스텝의 질문들을 렌더링
// =============================================================================
//
// TODO 구현 사항:
// 1. props로 현재 QuestionCategory를 받음
// 2. category.questions를 순회하며 각 질문을 <QuestionCard />로 렌더링
// 3. 조건부 질문 처리:
//    - question.conditionalOn이 있으면 answers에서 해당 조건 확인
//    - 조건 불충족 시 렌더링 스킵
// 4. 각 QuestionCard 사이 적절한 간격 (space-y-6)
// 5. 카테고리 제목 + 설명을 상단에 표시
// =============================================================================

import type { QuestionCategory } from '@/types';

interface StepRendererProps {
  category: QuestionCategory;
}

export function StepRenderer({ category: _category }: StepRendererProps) {
  // TODO: 구현
  // - useQuoteStore에서 answers 읽기
  // - 각 question에 대해 conditionalOn 체크
  // - QuestionCard 렌더링
  return (
    <div>
      {/* TODO: 카테고리 제목 */}
      {/* TODO: 질문 목록 (QuestionCard 반복) */}
    </div>
  );
}
