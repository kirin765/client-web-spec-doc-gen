// StepNavigation — 이전/다음 버튼 및 스텝 진행 관리.

import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuoteStore } from '@/store/useQuoteStore';
import { questionCategories } from '@/data/questions';
import { cn } from '@/lib/utils';
import { ArrowLeft, ArrowRight } from 'lucide-react';

export function StepNavigation() {
  const { t } = useTranslation('common');
  const navigate = useNavigate();
  const { currentStep, answers, prevStep, nextStep } = useQuoteStore();

  const currentCategory = questionCategories[currentStep];
  const isLastStep = currentStep === questionCategories.length - 1;
  const isFirstStep = currentStep === 0;

  // 현재 스텝의 필수 질문 검증
  const isStepComplete = () => {
    if (!currentCategory) return false;

    const requiredQuestions = currentCategory.questions.filter(
      (q) => q.validation?.required === true
    );

    return requiredQuestions.every((q) => {
      const answer = answers[q.id];
      return answer !== undefined && answer !== '' && (!Array.isArray(answer) || answer.length > 0);
    });
  };

  const handleNext = () => {
    if (isLastStep) {
      navigate('/result');
    } else {
      nextStep();
    }
  };

  return (
    <div className="border-t border-secondary-200 bg-white px-6 py-6">
      <div className="flex items-center justify-between gap-4">
        {/* 이전 버튼 */}
        <button
          onClick={prevStep}
          disabled={isFirstStep}
          className={cn(
            'btn btn-outline flex items-center gap-2',
            isFirstStep && 'opacity-50 cursor-not-allowed hover:border-secondary-300'
          )}
        >
          <ArrowLeft className="h-4 w-4" />
          {t('nav.back')}
        </button>

        {/* 진행상황 표시 */}
        <div className="text-body-sm text-secondary-600 font-medium">
          <span className="text-primary-600 font-semibold">{currentStep + 1}</span>
          {' / '}
          <span>{questionCategories.length}</span>
        </div>

        {/* 다음/결과보기 버튼 */}
        <button
          onClick={handleNext}
          disabled={!isStepComplete()}
          className={cn(
            'btn flex items-center gap-2',
            isStepComplete()
              ? 'btn-primary'
              : 'bg-secondary-200 text-secondary-400 cursor-not-allowed hover:bg-secondary-200'
          )}
        >
          {isLastStep ? (
            <>
              {t('nav.viewResult')}
              <ArrowRight className="h-4 w-4" />
            </>
          ) : (
            <>
              {t('nav.next')}
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
