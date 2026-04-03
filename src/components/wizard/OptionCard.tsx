// OptionCard — 선택 가능한 옵션 타일 (아이콘, 레이블, 선택 상태 시각화).

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
        'rounded-lg border-2 p-5 text-left transition-all duration-base',
        'focus-ring',
        selected
          ? 'border-primary-600 bg-primary-50 shadow-card-hover'
          : 'border-secondary-200 bg-white hover:border-primary-300 hover:shadow-card',
      )}
    >
      <div className="flex gap-4">
        <div className="flex-shrink-0">
          {IconComponent && (
            <IconComponent className={cn(
              'h-6 w-6 transition-colors duration-base',
              selected ? 'text-primary-600' : 'text-primary-500'
            )} />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="heading-sm text-secondary-900">{t(option.labelKey)}</div>
          {option.descriptionKey && (
            <div className="mt-1.5 text-body-sm text-secondary-600">{t(option.descriptionKey)}</div>
          )}
        </div>
        {selected && <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-primary-600" />}
      </div>
    </button>
  );
}
