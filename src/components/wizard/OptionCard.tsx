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
import { useTranslation } from 'react-i18next';
import {
  CheckCircle2,
  Zap,
  FileText,
  ShoppingCart,
  Cpu,
  BookOpen,
  Square,
  Palette,
  Sparkles,
  Smartphone,
  Tablet,
  Monitor,
  Calendar,
  AlertCircle,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

const optionIcons: Record<string, LucideIcon> = {
  Zap,
  FileText,
  ShoppingCart,
  Cpu,
  BookOpen,
  Square,
  Palette,
  Sparkles,
  Smartphone,
  Tablet,
  Monitor,
  Calendar,
  AlertCircle,
};
import { cn } from '@/lib/utils';

interface OptionCardProps {
  option: QuestionOption;
  selected: boolean;
  onSelect: (optionId: string) => void;
}

export function OptionCard({ option, selected, onSelect }: OptionCardProps) {
  const { t } = useTranslation('questions');

  const IconComponent = option.icon ? optionIcons[option.icon] : null;

  return (
    <button
      onClick={() => onSelect(option.id)}
      role="option"
      aria-selected={selected}
      className={cn(
        'rounded-lg border-2 p-4 text-left transition-all duration-200',
        'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500',
        selected
          ? 'border-blue-500 bg-blue-50 shadow-md'
          : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-md'
      )}
    >
      <div className="flex gap-3">
        <div className="flex-shrink-0">
          {IconComponent && <IconComponent className="h-5 w-5 text-blue-600" />}
        </div>
        <div className="flex-1">
          <div className="font-semibold text-gray-900">{t(option.labelKey)}</div>
          {option.descriptionKey && (
            <div className="mt-1 text-sm text-gray-600">{t(option.descriptionKey)}</div>
          )}
        </div>
        {selected && <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-blue-600" />}
      </div>
    </button>
  );
}
