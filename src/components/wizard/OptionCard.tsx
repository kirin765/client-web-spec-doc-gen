// =============================================================================
// OptionCard — 선택 가능한 옵션 타일
// =============================================================================
//
// TODO 구현 사항:
// 1. props: option (QuestionOption), selected (boolean), onSelect 콜백
// 2. 카드형 UI:
//    - 아이콘 (option.icon → Lucide 아이콘 동적 렌더링)
//    - 레이블 (option.labelKey → i18n 번역)
//    - 설명 (option.descriptionKey, optional)
// 3. 선택 상태 시각화:
//    - 미선택: border-gray-200, bg-white
//    - 선택됨: border-primary-500, bg-primary-50, 체크마크 표시
// 4. 호버 효과: shadow-md, border-primary-300
// 5. 클릭 시 onSelect(option.id) 호출
// 6. 접근성: role="option", aria-selected
// =============================================================================

import type { QuestionOption } from '@/types';

interface OptionCardProps {
  option: QuestionOption;
  selected: boolean;
  onSelect: (optionId: string) => void;
}

export function OptionCard({ option: _option, selected: _selected, onSelect: _onSelect }: OptionCardProps) {
  // TODO: 구현
  return (
    <div>
      {/* TODO: 아이콘 + 레이블 + 설명 + 선택 표시 */}
    </div>
  );
}
