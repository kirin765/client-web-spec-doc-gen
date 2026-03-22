// =============================================================================
// QuestionCard — 단일 질문을 렌더링하는 카드 컴포넌트
// =============================================================================
//
// TODO 구현 사항:
// 1. question.type에 따라 다른 입력 UI 렌더링:
//
//    'single-select':
//    - question.options를 OptionCard 그리드로 표시
//    - 하나만 선택 가능, 선택 시 useQuoteStore.setAnswer 호출
//    - 2~3열 그리드 (반응형)
//
//    'multi-select':
//    - question.options를 OptionCard 그리드로 표시
//    - 복수 선택 가능, 선택/해제 토글
//    - setAnswer로 string[] 저장
//
//    'range-slider':
//    - shadcn/ui Slider 또는 HTML input[type=range]
//    - 현재 값 표시, min/max 라벨
//    - setAnswer로 number 저장
//
//    'text-input':
//    - shadcn/ui Input 또는 Textarea
//    - setAnswer로 string 저장
//
// 2. 질문 제목 (labelKey → i18n 번역)
// 3. 질문 설명 (descriptionKey, optional)
// 4. 필수 여부 표시 (* 마크)
// =============================================================================

import type { Question } from '@/types';

interface QuestionCardProps {
  question: Question;
}

export function QuestionCard({ question: _question }: QuestionCardProps) {
  // TODO: 구현
  // - useQuoteStore에서 현재 답변값 읽기
  // - question.type에 따라 분기 렌더링
  // - useTranslation()으로 i18n 텍스트 변환
  return (
    <div>
      {/* TODO: 질문 제목 */}
      {/* TODO: 질문 유형별 입력 UI */}
    </div>
  );
}
