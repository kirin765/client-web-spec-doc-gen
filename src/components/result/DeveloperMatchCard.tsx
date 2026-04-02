// =============================================================================
// DeveloperMatchCard — 개발자 매칭 결과 카드
// =============================================================================

import type { DeveloperMatchResult } from '@/types/matching';
import { Award, Clock, DollarSign, Zap } from 'lucide-react';
import { formatKRW } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface DeveloperMatchCardProps {
  result: DeveloperMatchResult;
}

export function DeveloperMatchCard({ result }: DeveloperMatchCardProps) {
  const { developer, score, reasons } = result;

  return (
    <div className="card card-interactive p-6">
      {/* 헤더 */}
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h3 className="heading-lg text-secondary-900">{developer.displayName}</h3>
          <p className="mt-1 text-body-sm text-secondary-600">{developer.headline}</p>
        </div>
        <div className="flex items-center gap-2 rounded-full bg-primary-100 px-3 py-1.5 whitespace-nowrap">
          <Award className="h-4 w-4 text-primary-600" />
          <span className="text-body-sm font-bold text-primary-700">{Math.round(score)}점</span>
        </div>
      </div>

      {/* 전문 분야 */}
      <div className="mb-6">
        <p className="mb-3 text-caption-sm text-secondary-700 uppercase tracking-wide">전문 분야</p>
        <div className="flex flex-wrap gap-2">
          {developer.specialties.slice(0, 3).map((specialty) => (
            <span key={specialty} className="badge badge-secondary text-body-xs">
              {specialty}
            </span>
          ))}
        </div>
      </div>

      {/* 매칭 사유 */}
      {reasons.length > 0 && (
        <div className="mb-6">
          <p className="mb-3 text-caption-sm text-secondary-700 uppercase tracking-wide">추천 사유</p>
          <ul className="space-y-3">
            {reasons.map((reason) => (
              <li key={reason.type} className="flex items-start gap-3">
                <span className="mt-2 inline-block h-2 w-2 rounded-full bg-primary-500 flex-shrink-0" />
                <div>
                  <p className="text-body-sm font-semibold text-secondary-900">{reason.label}</p>
                  <p className="mt-0.5 text-body-xs text-secondary-600">{reason.description}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 운영 조건 */}
      <div className="border-t border-secondary-200 pt-6">
        <div className="grid grid-cols-3 gap-4">
          {/* 대응 속도 */}
          <div>
            <div className="mb-2 flex items-center gap-2">
              <Zap className="h-4 w-4 text-warning-500" />
              <p className="text-caption-sm text-secondary-700">대응 속도</p>
            </div>
            <p className="text-body-sm font-bold text-secondary-900">{developer.avgResponseHours}시간</p>
          </div>

          {/* 예산 범위 */}
          <div>
            <div className="mb-2 flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-success-500" />
              <p className="text-caption-sm text-secondary-700">예산</p>
            </div>
            <p className="text-body-sm font-bold text-secondary-900">
              {formatKRW(developer.budgetMin / 1_000_000)}M~
            </p>
          </div>

          {/* 가용성 */}
          <div>
            <div className="mb-2 flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary-500" />
              <p className="text-caption-sm text-secondary-700">상태</p>
            </div>
            <p className={cn(
              'text-body-sm font-bold',
              developer.availabilityStatus === 'available' ? 'text-success-600' :
              developer.availabilityStatus === 'busy' ? 'text-warning-600' :
              'text-secondary-600'
            )}>
              {developer.availabilityStatus === 'available' ? '가능' :
               developer.availabilityStatus === 'busy' ? '곧' : '제한'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
