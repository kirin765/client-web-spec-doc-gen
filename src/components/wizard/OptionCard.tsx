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
        'rounded-lg border-2 p-4 text-left transition-all duration-200',
        'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500',
        selected
          ? 'border-slate-900 bg-slate-900/5 shadow-md'
          : 'border-gray-200 bg-white hover:border-slate-400 hover:shadow-md'
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
        {selected && <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-slate-900" />}
      </div>
    </button>
  );
}
