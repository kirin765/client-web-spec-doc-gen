import type { UserMode } from '@/types/api';
import { cn } from '@/lib/utils';

interface ModeToggleProps {
  value: UserMode;
  onChange: (mode: UserMode) => void;
  className?: string;
}

const OPTIONS: Array<{ value: UserMode; label: string; description: string }> = [
  {
    value: 'customer',
    label: '고객',
    description: '견적 요청과 리뷰 작성',
  },
  {
    value: 'expert',
    label: '전문가',
    description: '프로필, FAQ, 포트폴리오 관리',
  },
];

export function ModeToggle({ value, onChange, className }: ModeToggleProps) {
  return (
    <div
      className={cn(
        'inline-flex rounded-xl border border-secondary-200 bg-white p-1 shadow-sm',
        className,
      )}
    >
      {OPTIONS.map((option) => {
        const selected = option.value === value;

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={cn(
              'rounded-lg px-4 py-2.5 text-left transition-all duration-base',
              selected
                ? 'bg-secondary-900 text-white shadow-sm'
                : 'text-secondary-600 hover:bg-secondary-100 hover:text-secondary-900',
            )}
          >
            <p className="text-body-sm font-semibold">{option.label}</p>
            <p className={cn('text-body-xs mt-1', selected ? 'text-secondary-300' : 'text-secondary-500')}>
              {option.description}
            </p>
          </button>
        );
      })}
    </div>
  );
}
