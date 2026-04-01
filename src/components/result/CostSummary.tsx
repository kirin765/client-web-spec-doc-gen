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
      <div className="rounded-lg border border-primary-200 bg-primary-50 p-6">
        <div className="text-caption-md text-primary-900 uppercase tracking-wider">{t('result.costTitle')}</div>
        <div className="mt-3 text-display-md font-bold text-primary-600">
          {formatRange(estimate.totalMin, estimate.totalMax)}
        </div>
        <div className="mt-3 text-body-sm text-primary-800">
          {t('result.designMultiplier')}: ×{estimate.designMultiplier} | {t('result.timelineMultiplier')}: ×{estimate.timelineMultiplier}
        </div>
      </div>

      {/* 항목별 분해표 */}
      <div className="overflow-hidden rounded-lg border border-secondary-200 shadow-sm">
        <table className="w-full">
          <thead className="bg-secondary-50">
            <tr>
              <th className="border-b border-secondary-200 px-6 py-4 text-left text-body-sm font-semibold text-secondary-900">
                {t('result.tableCategory')}
              </th>
              <th className="border-b border-secondary-200 px-6 py-4 text-left text-body-sm font-semibold text-secondary-900">
                {t('result.tableItem')}
              </th>
              <th className="border-b border-secondary-200 px-6 py-4 text-right text-body-sm font-semibold text-secondary-900">
                {t('result.tableCost')}
              </th>
            </tr>
          </thead>
          <tbody>
            {estimate.breakdown.map((item, idx) => (
              <tr key={idx} className="border-b border-secondary-200 hover:bg-secondary-50 transition-colors duration-base">
                <td className="px-6 py-4 text-body-sm text-secondary-600">{item.category}</td>
                <td className="px-6 py-4 text-body-sm text-secondary-900">
                  {item.label.startsWith('pricing.')
                    ? t(item.label, { ns: 'common' })
                    : item.label}
                </td>
                <td className="px-6 py-4 text-right text-body-sm font-medium text-secondary-900">
                  {formatRange(item.minAmount, item.maxAmount)}
                </td>
              </tr>
            ))}

            {/* 카테고리별 소계 */}
            <tr className="border-t-2 border-secondary-300 bg-secondary-50">
              <td colSpan={2} className="px-6 py-4 text-body-sm font-semibold text-secondary-900">
                {t('result.subtotal')}
              </td>
              <td className="px-6 py-4 text-right text-body-sm font-semibold text-secondary-900">
                {formatRange(
                  estimate.breakdown.reduce((sum, item) => sum + item.minAmount, 0),
                  estimate.breakdown.reduce((sum, item) => sum + item.maxAmount, 0)
                )}
              </td>
            </tr>

            {/* 최종 합계 */}
            <tr className="bg-primary-50">
              <td colSpan={2} className="px-6 py-4 text-body-sm font-bold text-primary-900">
                {t('result.totalCost')}
              </td>
              <td className="px-6 py-4 text-right text-body-sm font-bold text-primary-700">
                {formatRange(estimate.totalMin, estimate.totalMax)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* 면책 조항 */}
      <div className="rounded-lg border border-warning-200 bg-warning-50 p-4">
        <p className="text-body-sm text-warning-900">{t('result.disclaimer')}</p>
      </div>
    </div>
  );
}
