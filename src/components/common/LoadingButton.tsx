import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  loading: boolean;
  loadingLabel: string;
  children: ReactNode;
}

export function LoadingButton({
  loading,
  loadingLabel,
  children,
  disabled,
  className,
  ...props
}: LoadingButtonProps) {
  const isDisabled = Boolean(disabled || loading);

  return (
    <button
      {...props}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      className={className}
    >
      {loading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          {loadingLabel}
        </>
      ) : (
        children
      )}
    </button>
  );
}
