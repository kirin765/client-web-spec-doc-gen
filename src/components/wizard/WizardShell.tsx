// WizardShell — 위저드 전체 컨테이너.
// 상단 프로그레스 바 (6스텝), 중앙 StepRenderer, 우측 실시간 비용 미리보기, 하단 StepNavigation.
// calculateCost()를 useMemo로 메모이제이션.

import { useMemo } from 'react';
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
  const costEstimate = useMemo(() => calculateCost(answers), [answers]);

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
    <div className="flex min-h-screen flex-col bg-secondary-50">
      {/* 진행 바 */}
      <div className="border-b border-secondary-200 bg-white px-6 py-6">
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
                  className="flex flex-col items-center gap-2 rounded-lg p-2 transition-colors duration-base disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-lg transition-all duration-base ${
                      isActive
                        ? 'bg-primary-600 text-white shadow-sm'
                        : isComplete
                          ? 'bg-primary-100 text-primary-600'
                          : 'bg-secondary-100 text-secondary-400'
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
                  <span className="text-body-xs font-semibold text-secondary-700">{t(`steps.${category.id}`)}</span>
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
        <div className="hidden w-80 border-l border-secondary-200 bg-white p-6 shadow-sm lg:block">
          <h3 className="heading-lg mb-6 text-secondary-900">{t('wizard.estimatedCost')}</h3>

          <div className="space-y-4">
            {/* 기본 가격 */}
            <div className="rounded-lg bg-primary-900 p-5 text-white">
              <div className="text-caption-sm uppercase text-primary-200">{t('wizard.baseFee')}</div>
              <div className="mt-2 text-heading-lg font-bold">
                {formatRange(costEstimate.baseTier.minCost, costEstimate.baseTier.maxCost)}
              </div>
            </div>

            {/* 추가 비용 항목 */}
            {costEstimate.breakdown.slice(1).length > 0 && (
              <div className="border-t border-secondary-200 pt-4">
                <div className="text-caption-sm uppercase text-secondary-600">{t('wizard.additionalItems')}</div>
                <div className="mt-3 space-y-2">
                  {costEstimate.breakdown.slice(1).map((item, idx) => (
                    <div key={idx} className="flex justify-between text-body-sm">
                      <span className="text-secondary-700">{item.category}</span>
                      <span className="font-semibold text-secondary-900">
                        +{formatRange(item.minAmount, item.maxAmount)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 승수 적용 */}
            {(costEstimate.designMultiplier > 1 || costEstimate.timelineMultiplier > 1) && (
              <div className="border-t border-secondary-200 pt-4">
                <div className="text-caption-sm uppercase text-secondary-600">{t('wizard.multipliers')}</div>
                <div className="mt-3 space-y-1 text-body-sm text-secondary-700">
                  {costEstimate.designMultiplier > 1 && (
                    <div>{t('wizard.designMultiplier')}: ×{costEstimate.designMultiplier}</div>
                  )}
                  {costEstimate.timelineMultiplier > 1 && (
                    <div>{t('wizard.timelineMultiplier')}: ×{costEstimate.timelineMultiplier}</div>
                  )}
                </div>
              </div>
            )}

            {/* 최종 예상 비용 */}
            <div className="border-t border-secondary-200 pt-4">
              <div className="text-caption-sm uppercase text-secondary-600">{t('wizard.finalEstimate')}</div>
              <div className="mt-2 text-display-sm font-bold text-primary-600">
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
