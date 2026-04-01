// Header — 구글 계정 메뉴 스타일의 상단 바.

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ChevronDown,
  FileText,
  LayoutGrid,
  LogOut,
  PlusCircle,
  Shield,
  UserCircle2,
} from 'lucide-react';
import { useQuoteStore } from '@/store/useQuoteStore';
import { useAuthStore } from '@/store/useAuthStore';
import { AuthControls } from '@/components/auth/AuthControls';
import { Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Header() {
  const { t } = useTranslation('common');
  const navigate = useNavigate();
  const location = useLocation();
  const { resetQuote } = useQuoteStore();
  const user = useAuthStore((state) => state.user);
  const activeMode = useAuthStore((state) => state.activeMode);
  const setActiveMode = useAuthStore((state) => state.setActiveMode);
  const clearSession = useAuthStore((state) => state.clearSession);
  const isExpertMode = activeMode === 'expert';
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const redirectTo =
    typeof location.state === 'object' &&
    location.state !== null &&
    'from' in location.state &&
    typeof (location.state as { from?: unknown }).from === 'string'
      ? (location.state as { from: string }).from
      : '/mypage';

  useEffect(() => {
    if (!menuOpen) return;

    const onDocumentClick = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', onDocumentClick);
    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.removeEventListener('mousedown', onDocumentClick);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [menuOpen]);

  const go = (path: string) => {
    setMenuOpen(false);
    navigate(path);
  };

  const handleStart = () => {
    setMenuOpen(false);
    if (activeMode === 'expert') {
      navigate('/mypage');
      return;
    }

    resetQuote();
    navigate('/wizard');
  };

  const avatarLabel = user?.email?.slice(0, 1).toUpperCase() || 'G';

  return (
    <header
      className={cn(
        'sticky top-0 z-40 border-b backdrop-blur-sm transition-colors',
        location.pathname === '/'
          ? 'border-white/10 bg-navy-950/95'
          : 'border-slate-200 bg-white/95',
      )}
    >
      <div className="mx-auto max-w-7xl px-6 py-4">
        <div className="flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2">
            <Zap
              className={cn(
                'h-6 w-6',
                location.pathname === '/' ? 'text-blue-400' : 'text-blue-600',
              )}
            />
            <h1
              className={cn(
                'text-lg font-bold',
                location.pathname === '/' ? 'text-white' : 'text-gray-900',
              )}
            >
              {t('app.title')}
            </h1>
          </Link>

          <div className="flex items-center gap-3">
            {user ? (
              <div ref={menuRef} className="relative">
                <button
                  type="button"
                  onClick={() => setMenuOpen((value) => !value)}
                  className={cn(
                    'flex items-center gap-3 rounded-full border border-slate-200 bg-white px-2 py-1.5 shadow-sm transition-shadow hover:shadow-md',
                    menuOpen && 'ring-2 ring-blue-200',
                  )}
                >
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-slate-900 text-sm font-semibold text-white">
                    {avatarLabel}
                  </span>
                  <span className="hidden max-w-[220px] flex-col items-start text-left md:flex">
                    <span className="truncate text-sm font-semibold text-slate-900">{user.email}</span>
                    <span className="text-xs text-slate-500">
                      {activeMode === 'expert' ? '전문가 모드' : '고객 모드'}
                    </span>
                  </span>
                  <ChevronDown className="mr-1 h-4 w-4 text-slate-500" />
                </button>

                {menuOpen ? (
                  <div className="absolute right-0 mt-3 w-[340px] overflow-hidden rounded-[28px] border border-slate-200 bg-white p-3 shadow-[0_30px_60px_rgba(15,23,42,0.12)]">
                    <div className="rounded-[22px] bg-slate-950 px-4 py-4 text-white">
                      <div className="flex items-center gap-3">
                        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-sm font-semibold">
                          {avatarLabel}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold">{user.email}</p>
                          <p className="mt-1 text-xs text-slate-300">
                            {activeMode === 'expert' ? '전문가' : '고객'}로 사용 중
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setActiveMode('customer')}
                          className={cn(
                            'rounded-2xl px-3 py-3 text-left transition-colors',
                            activeMode === 'customer'
                              ? 'bg-white text-slate-950'
                              : 'bg-white/10 text-white hover:bg-white/15',
                          )}
                        >
                          <p className="text-sm font-semibold">고객</p>
                          <p className="mt-1 text-xs opacity-80">견적 요청과 리뷰 작성</p>
                        </button>
                        <button
                          type="button"
                          onClick={() => setActiveMode('expert')}
                          className={cn(
                            'rounded-2xl px-3 py-3 text-left transition-colors',
                            activeMode === 'expert'
                              ? 'bg-white text-slate-950'
                              : 'bg-white/10 text-white hover:bg-white/15',
                          )}
                        >
                          <p className="text-sm font-semibold">전문가</p>
                          <p className="mt-1 text-xs opacity-80">프로필, FAQ, 포트폴리오</p>
                        </button>
                      </div>
                    </div>

                    <div className="mt-3 space-y-1">
                      {!isExpertMode ? (
                        <MenuItem
                          icon={<LayoutGrid className="h-4 w-4" />}
                          label="전문가 목록"
                          onClick={() => go('/experts')}
                        />
                      ) : null}
                      {!isExpertMode ? (
                        <MenuItem
                          icon={<FileText className="h-4 w-4" />}
                          label="내 견적서"
                          onClick={() => go('/quotes')}
                        />
                      ) : null}
                      <MenuItem
                        icon={<UserCircle2 className="h-4 w-4" />}
                        label={isExpertMode ? '전문가 마이페이지' : '고객 마이페이지'}
                        onClick={() => go('/mypage')}
                      />
                      {!isExpertMode ? (
                        <MenuItem
                          icon={<PlusCircle className="h-4 w-4" />}
                          label="견적 작성 시작"
                          onClick={handleStart}
                        />
                      ) : null}
                      {user.role === 'admin' ? (
                        <MenuItem
                          icon={<Shield className="h-4 w-4" />}
                          label="관리자"
                          onClick={() => go('/admin')}
                        />
                      ) : null}
                    </div>

                    <div className="mt-3 border-t border-slate-200 pt-3">
                      <button
                        type="button"
                        onClick={() => {
                          setMenuOpen(false);
                          clearSession();
                        }}
                        className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100"
                      >
                        <LogOut className="h-4 w-4" />
                        로그아웃
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>
            ) : (
              <AuthControls redirectTo={redirectTo} />
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

function MenuItem({
  icon,
  label,
  onClick,
}: {
  icon: ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100"
    >
      <span className="text-slate-500">{icon}</span>
      <span>{label}</span>
    </button>
  );
}
