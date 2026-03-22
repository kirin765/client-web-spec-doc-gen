// =============================================================================
// StepNavigation — 이전/다음 버튼
// =============================================================================
//
// TODO 구현 사항:
// 1. "이전" 버튼: prevStep() 호출, 첫 스텝에서는 숨김 또는 비활성화
// 2. "다음" 버튼: nextStep() 호출
//    - 현재 스텝의 필수 질문이 모두 답변되지 않으면 비활성화
//    - 마지막 스텝에서는 "결과 보기" 텍스트 + /result로 navigate
// 3. 버튼 스타일:
//    - 이전: variant="outline"
//    - 다음: variant="default" (primary 색상)
// 4. 레이아웃: flex justify-between, 하단 고정
// =============================================================================

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
    <div className="border-t bg-white px-6 py-4">
      <div className="flex items-center justify-between gap-4">
        {/* 이전 버튼 */}
        <button
          onClick={prevStep}
          disabled={isFirstStep}
          className={cn(
            'flex items-center gap-2 rounded-lg px-6 py-2 font-medium transition-colors',
            isFirstStep
              ? 'cursor-not-allowed text-gray-400'
              : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
          )}
        >
          <ArrowLeft className="h-4 w-4" />
          {t('nav.back')}
        </button>

        {/* 진행상황 표시 */}
        <div className="text-sm text-gray-600">
          {currentStep + 1} / {questionCategories.length}
        </div>

        {/* 다음/결과보기 버튼 */}
        <button
          onClick={handleNext}
          disabled={!isStepComplete()}
          className={cn(
            'flex items-center gap-2 rounded-lg px-6 py-2 font-medium transition-colors',
            isStepComplete()
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'cursor-not-allowed bg-gray-300 text-gray-500'
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
