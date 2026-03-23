// StepRenderer — 현재 스텝의 질문들을 조건부 렌더링.

import type { QuestionCategory } from '@/types';
import { useTranslation } from 'react-i18next';
import { useQuoteStore } from '@/store/useQuoteStore';
import { QuestionCard } from './QuestionCard';
import * as Icons from 'lucide-react';

interface StepRendererProps {
  category: QuestionCategory;
}

export function StepRenderer({ category }: StepRendererProps) {
  const { t } = useTranslation('common');
  const { answers } = useQuoteStore();

  const IconComponent = category.icon ? (Icons[category.icon as keyof typeof Icons] as any) : null;

  // 질문이 조건부 표시여야 하는지 확인
  const shouldShowQuestion = (question: typeof category.questions[0]) => {
    if (!question.conditionalOn) return true;

    const conditionValue = answers[question.conditionalOn.questionId];
    const conditionValues = Array.isArray(conditionValue) ? conditionValue : [conditionValue];

    return question.conditionalOn.values.some((v) => conditionValues.includes(v));
  };

  const visibleQuestions = category.questions.filter(shouldShowQuestion);

  return (
    <div className="space-y-8">
      {/* 카테고리 헤더 */}
      <div className="flex items-center gap-3 border-b pb-4">
        {IconComponent && <IconComponent className="h-6 w-6 text-blue-600" />}
        <h2 className="text-2xl font-bold text-gray-900">{t(`steps.${category.id}`)}</h2>
      </div>

      {/* 질문 목록 */}
      <div className="space-y-6">
        {visibleQuestions.map((question) => (
          <QuestionCard key={question.id} question={question} />
        ))}
      </div>
    </div>
  );
}
