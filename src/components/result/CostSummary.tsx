// =============================================================================
// CostSummary — 비용 요약 + 항목별 분해표
// =============================================================================
//
// TODO 구현 사항:
// 1. props로 CostEstimate를 받음
//
// 2. 상단: 총 비용 범위 대형 표시
//    - "예상 비용" 제목
//    - formatRange(totalMin, totalMax) → "8,500,000원 ~ 15,200,000원"
//    - 강조 스타일 (text-3xl, font-bold, text-primary-600)
//
// 3. 중앙: 항목별 분해표 (테이블)
//    - 카테고리 | 항목 | 예상 비용
//    - breakdown 배열을 순회하며 행 생성
//    - 카테고리별 소계 표시
//    - 승수 행: 디자인 승수 (×1.3), 일정 승수 (×1.6) 등
//
// 4. 하단: 면책 조항
//    - "본 견적은 자동 산출된 예상 범위이며, 실제 비용은 상세 상담 후 확정됩니다."
//
// 5. 스타일: Card 컴포넌트 내부, 깔끔한 테이블
// =============================================================================

import type { CostEstimate } from '@/types';

interface CostSummaryProps {
  estimate: CostEstimate;
}

export function CostSummary({ estimate: _estimate }: CostSummaryProps) {
  // TODO: 구현
  return (
    <div>
      {/* TODO: 총 비용 범위 */}
      {/* TODO: 항목별 분해표 */}
      {/* TODO: 면책 조항 */}
    </div>
  );
}
