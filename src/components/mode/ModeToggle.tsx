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
        'inline-flex rounded-2xl border border-slate-200 bg-white p-1 shadow-sm',
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
              'rounded-xl px-4 py-2 text-left transition-colors',
              selected
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
            )}
          >
            <p className="text-sm font-semibold">{option.label}</p>
            <p className={cn('text-xs', selected ? 'text-slate-200' : 'text-slate-500')}>
              {option.description}
            </p>
          </button>
        );
      })}
    </div>
  );
}
