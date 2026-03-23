// =============================================================================
// DeveloperMatchCard — 개발자 매칭 결과 카드
// =============================================================================

import type { DeveloperMatchResult } from '@/types/matching';
import { Award, Clock, DollarSign, Zap } from 'lucide-react';
import { formatKRW } from '@/lib/utils';

interface DeveloperMatchCardProps {
  result: DeveloperMatchResult;
}

export function DeveloperMatchCard({ result }: DeveloperMatchCardProps) {
  const { developer, score, reasons } = result;

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
      {/* 헤더 */}
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h3 className="text-lg font-bold text-gray-900">{developer.displayName}</h3>
          <p className="text-sm text-gray-600">{developer.headline}</p>
        </div>
        <div className="flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1">
          <Award className="h-4 w-4 text-blue-600" />
          <span className="font-bold text-blue-600">{Math.round(score)}점</span>
        </div>
      </div>

      {/* 전문 분야 */}
      <div className="mb-4">
        <p className="mb-2 text-xs font-semibold text-gray-700 uppercase">전문 분야</p>
        <div className="flex flex-wrap gap-2">
          {developer.specialties.slice(0, 3).map((specialty) => (
            <span key={specialty} className="inline-block rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-700">
              {specialty}
            </span>
          ))}
        </div>
      </div>

      {/* 매칭 사유 */}
      {reasons.length > 0 && (
        <div className="mb-4">
          <p className="mb-2 text-xs font-semibold text-gray-700 uppercase">추천 사유</p>
          <ul className="space-y-2">
            {reasons.map((reason) => (
              <li key={reason.type} className="flex items-start gap-2 text-sm">
                <span className="mt-0.5 inline-block h-1.5 w-1.5 rounded-full bg-blue-500" />
                <div>
                  <p className="font-medium text-gray-700">{reason.label}</p>
                  <p className="text-xs text-gray-500">{reason.description}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 운영 조건 */}
      <div className="border-t pt-4">
        <div className="grid grid-cols-3 gap-4">
          {/* 대응 속도 */}
          <div>
            <div className="mb-1 flex items-center gap-1">
              <Zap className="h-4 w-4 text-orange-500" />
              <p className="text-xs font-semibold text-gray-700">대응 속도</p>
            </div>
            <p className="text-sm font-bold text-gray-900">{developer.avgResponseHours}시간</p>
          </div>

          {/* 예산 범위 */}
          <div>
            <div className="mb-1 flex items-center gap-1">
              <DollarSign className="h-4 w-4 text-green-500" />
              <p className="text-xs font-semibold text-gray-700">예산</p>
            </div>
            <p className="text-sm font-bold text-gray-900">
              {formatKRW(developer.budgetMin / 1_000_000)}M~
            </p>
          </div>

          {/* 가용성 */}
          <div>
            <div className="mb-1 flex items-center gap-1">
              <Clock className="h-4 w-4 text-purple-500" />
              <p className="text-xs font-semibold text-gray-700">상태</p>
            </div>
            <p className={`text-sm font-bold ${
              developer.availabilityStatus === 'available' ? 'text-green-600' : 
              developer.availabilityStatus === 'busy' ? 'text-orange-600' : 
              'text-gray-600'
            }`}>
              {developer.availabilityStatus === 'available' ? '가능' :
               developer.availabilityStatus === 'busy' ? '곧' : '제한'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
