// =============================================================================
// WizardShell — 위저드 전체 컨테이너
// =============================================================================
//
// TODO 구현 사항:
// 1. 상단 프로그레스 바
//    - 6개 스텝 표시 (각 카테고리의 labelKey + icon)
//    - 현재 스텝 하이라이트, 완료 스텝 체크마크
//    - 클릭으로 이전 스텝 이동 가능 (미래 스텝은 불가)
//
// 2. 중앙 콘텐츠 영역
//    - <StepRenderer />로 현재 스텝의 질문들을 렌더링
//    - 스텝 전환 시 fade/slide 애니메이션 (CSS transition)
//
// 3. 하단 네비게이션
//    - <StepNavigation />으로 이전/다음 버튼
//
// 4. 우측 사이드바 (데스크톱) / 하단 시트 (모바일)
//    - 실시간 비용 미리보기
//    - useQuoteStore의 answers를 costCalculator에 전달하여 계산
//    - 금액 변동 시 하이라이트 애니메이션
//
// 5. 레이아웃: max-w-4xl 중앙 정렬, 패딩
// =============================================================================

import { useTranslation } from 'react-i18next';
import { useQuoteStore } from '@/store/useQuoteStore';
import { questionCategories } from '@/data/questions';
import { calculateCost } from '@/lib/costCalculator';
import { formatRange } from '@/lib/utils';
import { StepRenderer } from './StepRenderer';
import { StepNavigation } from './StepNavigation';
import {
  CheckCircle2,
  Circle,
  FileText,
  Layers,
  Puzzle,
  Palette,
  Link,
  Clock,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

const categoryIcons: Record<string, LucideIcon> = {
  FileText,
  Layers,
  Puzzle,
  Palette,
  Link,
  Clock,
};

export function WizardShell() {
  const { t } = useTranslation(['common']);
  const { currentStep, answers } = useQuoteStore();

  const currentCategory = questionCategories[currentStep];
  const costEstimate = calculateCost(answers);

  // 스텝 완료 여부 확인
  const isStepComplete = (step: number) => {
    const category = questionCategories[step];
    const requiredQuestions = category.questions.filter((q) => q.validation?.required === true);

    return requiredQuestions.every((q) => {
      const answer = answers[q.id];
      return answer !== undefined && answer !== '' && (!Array.isArray(answer) || answer.length > 0);
    });
  };

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      {/* 진행 바 */}
      <div className="border-b bg-white px-6 py-6">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-6 gap-2">
            {questionCategories.map((category, idx) => {
              const IconComponent = category.icon ? categoryIcons[category.icon] : null;
              const isComplete = isStepComplete(idx);
              const isActive = idx === currentStep;

              return (
                <button
                  key={category.id}
                  onClick={() => {
                    if (idx <= currentStep) {
                      useQuoteStore.getState().setCurrentStep(idx);
                      window.scrollTo(0, 0);
                    }
                  }}
                  disabled={idx > currentStep}
                  className="flex flex-col items-center gap-1 rounded-lg p-2 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full transition-colors ${
                      isActive
                        ? 'bg-blue-600 text-white'
                        : isComplete
                          ? 'bg-green-100 text-green-600'
                          : 'bg-gray-200 text-gray-400'
                    }`}
                  >
                    {isComplete ? (
                      <CheckCircle2 className="h-5 w-5" />
                    ) : IconComponent ? (
                      <IconComponent className="h-5 w-5" />
                    ) : (
                      <Circle className="h-5 w-5" />
                    )}
                  </div>
                  <span className="text-xs font-medium text-gray-700">{t(`steps.${category.id}`)}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="flex flex-1 overflow-hidden">
        {/* 좌측: 질문 콘텐츠 */}
        <div className="flex-1 overflow-auto">
          <div className="mx-auto max-w-4xl px-6 py-8">
            {currentCategory && <StepRenderer category={currentCategory} />}
          </div>
        </div>

        {/* 우측: 비용 미리보기 (데스크톱) */}
        <div className="hidden w-80 border-l bg-white p-6 shadow-sm lg:block">
          <h3 className="mb-4 text-lg font-bold text-gray-900">예상 비용</h3>

          <div className="space-y-4">
            {/* 기본 가격 */}
            <div className="rounded-lg bg-blue-50 p-3">
              <div className="text-xs font-semibold text-gray-600 uppercase">기본 요금</div>
              <div className="mt-1 text-lg font-bold text-blue-600">
                {formatRange(costEstimate.baseTier.minCost, costEstimate.baseTier.maxCost)}
              </div>
            </div>

            {/* 추가 비용 항목 */}
            {costEstimate.breakdown.slice(1).length > 0 && (
              <div className="border-t pt-4">
                <div className="text-xs font-semibold text-gray-600 uppercase">추가 항목</div>
                <div className="mt-2 space-y-2">
                  {costEstimate.breakdown.slice(1).map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span className="text-gray-700">{item.category}</span>
                      <span className="font-medium text-gray-900">
                        +{formatRange(item.minAmount, item.maxAmount)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 승수 적용 */}
            {(costEstimate.designMultiplier > 1 || costEstimate.timelineMultiplier > 1) && (
              <div className="border-t pt-4">
                <div className="text-xs font-semibold text-gray-600 uppercase">승수</div>
                <div className="mt-2 space-y-1 text-sm">
                  {costEstimate.designMultiplier > 1 && (
                    <div>디자인: ×{costEstimate.designMultiplier}</div>
                  )}
                  {costEstimate.timelineMultiplier > 1 && (
                    <div>일정: ×{costEstimate.timelineMultiplier}</div>
                  )}
                </div>
              </div>
            )}

            {/* 최종 예상 비용 */}
            <div className="border-t pt-4">
              <div className="text-xs font-semibold text-gray-600 uppercase">최종 예상</div>
              <div className="mt-2 text-xl font-bold text-gray-900">
                {formatRange(costEstimate.totalMin, costEstimate.totalMax)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 하단 네비게이션 */}
      <StepNavigation />
    </div>
  );
}
