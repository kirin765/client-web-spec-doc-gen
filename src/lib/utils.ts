// =============================================================================
// 유틸리티 함수
// =============================================================================
//
// TODO 구현 사항:
// 1. cn(): clsx + tailwind-merge 조합 (shadcn/ui 패턴)
// 2. formatKRW(): 숫자 → "1,500,000원" 형식 포맷팅
// 3. formatRange(): min/max → "1,500,000원 ~ 3,000,000원" 형식
// =============================================================================

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Tailwind CSS 클래스명 병합 (조건부 클래스 지원) */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** KRW 금액 포맷팅: 1500000 → "1,500,000원" */
export function formatKRW(_amount: number): string {
  // TODO: Intl.NumberFormat('ko-KR') 사용
  return '';
}

/** 비용 범위 포맷팅: "1,500,000원 ~ 3,000,000원" */
export function formatRange(_min: number, _max: number): string {
  // TODO: formatKRW(min) + ' ~ ' + formatKRW(max)
  return '';
}
