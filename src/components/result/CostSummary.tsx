// CostSummary — 비용 요약 + 항목별 분해표 + 면책 조항. i18n 키 사용.

import type { CostEstimate } from '@/types';
import { useTranslation } from 'react-i18next';
import { formatRange } from '@/lib/utils';

interface CostSummaryProps {
  estimate: CostEstimate;
}

export function CostSummary({ estimate }: CostSummaryProps) {
  const { t } = useTranslation(['common', 'questions']);

  return (
    <div className="space-y-6">
      {/* 총 비용 범위 */}
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-6">
        <div className="text-sm font-semibold text-blue-900 uppercase">{t('result.costTitle')}</div>
        <div className="mt-2 text-3xl font-bold text-blue-600">
          {formatRange(estimate.totalMin, estimate.totalMax)}
        </div>
        <div className="mt-2 text-sm text-blue-800">
          {t('result.designMultiplier')}: ×{estimate.designMultiplier} | {t('result.timelineMultiplier')}: ×{estimate.timelineMultiplier}
        </div>
      </div>

      {/* 항목별 분해표 */}
      <div className="overflow-hidden rounded-lg border">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="border-b px-4 py-3 text-left text-sm font-semibold text-gray-900">
                {t('result.tableCategory')}
              </th>
              <th className="border-b px-4 py-3 text-left text-sm font-semibold text-gray-900">
                {t('result.tableItem')}
              </th>
              <th className="border-b px-4 py-3 text-right text-sm font-semibold text-gray-900">
                {t('result.tableCost')}
              </th>
            </tr>
          </thead>
          <tbody>
            {estimate.breakdown.map((item, idx) => (
              <tr key={idx} className="border-b hover:bg-gray-50">
                <td className="px-4 py-3 text-sm text-gray-600">{item.category}</td>
                <td className="px-4 py-3 text-sm text-gray-900">
                  {item.label.startsWith('pricing.')
                    ? t(item.label, { ns: 'common' })
                    : item.label}
                </td>
                <td className="px-4 py-3 text-right text-sm font-medium text-gray-900">
                  {formatRange(item.minAmount, item.maxAmount)}
                </td>
              </tr>
            ))}

            {/* 카테고리별 소계 */}
            <tr className="border-t-2 bg-gray-50 font-semibold">
              <td colSpan={2} className="px-4 py-3 text-sm text-gray-900">
                {t('result.subtotal')}
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
                {t('result.totalCost')}
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
