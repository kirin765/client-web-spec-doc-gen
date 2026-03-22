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
import { useTranslation } from 'react-i18next';
import { formatRange } from '@/lib/utils';

interface CostSummaryProps {
  estimate: CostEstimate;
}

export function CostSummary({ estimate }: CostSummaryProps) {
  const { t } = useTranslation('common');

  return (
    <div className="space-y-6">
      {/* 총 비용 범위 */}
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-6">
        <div className="text-sm font-semibold text-blue-900 uppercase">{t('result.costTitle')}</div>
        <div className="mt-2 text-3xl font-bold text-blue-600">
          {formatRange(estimate.totalMin, estimate.totalMax)}
        </div>
        <div className="mt-2 text-sm text-blue-800">
          디자인 복잡도: ×{estimate.designMultiplier} | 일정 승수: ×{estimate.timelineMultiplier}
        </div>
      </div>

      {/* 항목별 분해표 */}
      <div className="overflow-hidden rounded-lg border">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="border-b px-4 py-3 text-left text-sm font-semibold text-gray-900">
                카테고리
              </th>
              <th className="border-b px-4 py-3 text-left text-sm font-semibold text-gray-900">
                항목
              </th>
              <th className="border-b px-4 py-3 text-right text-sm font-semibold text-gray-900">
                예상 비용
              </th>
            </tr>
          </thead>
          <tbody>
            {estimate.breakdown.map((item, idx) => (
              <tr key={idx} className="border-b hover:bg-gray-50">
                <td className="px-4 py-3 text-sm text-gray-600">{item.category}</td>
                <td className="px-4 py-3 text-sm text-gray-900">{item.label}</td>
                <td className="px-4 py-3 text-right text-sm font-medium text-gray-900">
                  {formatRange(item.minAmount, item.maxAmount)}
                </td>
              </tr>
            ))}

            {/* 카테고리별 소계 */}
            <tr className="border-t-2 bg-gray-50 font-semibold">
              <td colSpan={2} className="px-4 py-3 text-sm text-gray-900">
                소계
              </td>
              <td className="px-4 py-3 text-right text-sm text-gray-900">
                {formatRange(
                  estimate.breakdown.reduce((sum, item) => sum + item.minAmount, 0),
                  estimate.breakdown.reduce((sum, item) => sum + item.maxAmount, 0)
                )}
              </td>
            </tr>

            {/* 최종 합계 */}
            <tr className="bg-blue-50">
              <td colSpan={2} className="px-4 py-3 text-sm font-bold text-blue-900">
                최종 예상 비용
              </td>
              <td className="px-4 py-3 text-right text-sm font-bold text-blue-600">
                {formatRange(estimate.totalMin, estimate.totalMax)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* 면책 조항 */}
      <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
        <p className="text-sm text-yellow-900">{t('result.disclaimer')}</p>
      </div>
    </div>
  );
}
