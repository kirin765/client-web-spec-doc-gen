// =============================================================================
// QuestionCard — 단일 질문을 렌더링하는 카드 컴포넌트
// =============================================================================
//
// TODO 구현 사항:
// 1. question.type에 따라 다른 입력 UI 렌더링:
//
//    'single-select':
//    - question.options를 OptionCard 그리드로 표시
//    - 하나만 선택 가능, 선택 시 useQuoteStore.setAnswer 호출
//    - 2~3열 그리드 (반응형)
//
//    'multi-select':
//    - question.options를 OptionCard 그리드로 표시
//    - 복수 선택 가능, 선택/해제 토글
//    - setAnswer로 string[] 저장
//
//    'range-slider':
//    - shadcn/ui Slider 또는 HTML input[type=range]
//    - 현재 값 표시, min/max 라벨
//    - setAnswer로 number 저장
//
//    'text-input':
//    - shadcn/ui Input 또는 Textarea
//    - setAnswer로 string 저장
//
// 2. 질문 제목 (labelKey → i18n 번역)
// 3. 질문 설명 (descriptionKey, optional)
// 4. 필수 여부 표시 (* 마크)
// =============================================================================

import type { Question } from '@/types';
import { useTranslation } from 'react-i18next';
import { useQuoteStore } from '@/store/useQuoteStore';
import { OptionCard } from './OptionCard';
import { cn } from '@/lib/utils';

interface QuestionCardProps {
  question: Question;
}

export function QuestionCard({ question }: QuestionCardProps) {
  const { t } = useTranslation('questions');
  const { answers, setAnswer } = useQuoteStore();

  const currentValue = answers[question.id];
  const isRequired = question.validation?.required;

  const renderSingleSelect = () => {
    return (
      <div className="space-y-3">
        {question.options?.map((option) => (
          <OptionCard
            key={option.id}
            option={option}
            selected={currentValue === option.id}
            onSelect={(optionId) => setAnswer(question.id, optionId)}
          />
        ))}
      </div>
    );
  };

  const renderMultiSelect = () => {
    const selectedIds = Array.isArray(currentValue) ? currentValue : [];
    return (
      <div className="space-y-3">
        {question.options?.map((option) => (
          <OptionCard
            key={option.id}
            option={option}
            selected={selectedIds.includes(option.id)}
            onSelect={(optionId) => {
              if (selectedIds.includes(optionId)) {
                setAnswer(question.id, selectedIds.filter((id) => id !== optionId));
              } else {
                setAnswer(question.id, [...selectedIds, optionId]);
              }
            }}
          />
        ))}
      </div>
    );
  };

  const renderRangeSlider = () => {
    const value = typeof currentValue === 'number' ? currentValue : question.validation?.min || 1;
    const min = question.validation?.min || 1;
    const max = question.validation?.max || 100;

    return (
      <div className="space-y-4">
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={(e) => setAnswer(question.id, parseInt(e.target.value, 10))}
          className="w-full"
        />
        <div className="flex justify-between text-sm text-gray-600">
          <span>{min}</span>
          <span className="font-semibold text-blue-600">{value}</span>
          <span>{max}</span>
        </div>
      </div>
    );
  };

  const renderTextInput = () => {
    const value = typeof currentValue === 'string' ? currentValue : '';
    const isTextArea = question.id?.includes('notes') || question.id?.includes('description');

    const baseProps = {
      value,
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
        setAnswer(question.id, e.target.value),
      placeholder: t(`${question.id}.placeholder`) || '',
      className: cn(
        'w-full rounded-lg border border-gray-300 px-4 py-2',
        'focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20'
      ),
    };

    return isTextArea ? (
      <textarea {...baseProps} rows={4} />
    ) : (
      <input type="text" {...baseProps} />
    );
  };

  const renderContent = () => {
    switch (question.type) {
      case 'single-select':
        return renderSingleSelect();
      case 'multi-select':
        return renderMultiSelect();
      case 'range-slider':
        return renderRangeSlider();
      case 'text-input':
        return renderTextInput();
      default:
        return null;
    }
  };

  return (
    <div className="rounded-lg bg-white p-6 shadow-sm">
      <div className="mb-4">
        <label className="flex items-baseline gap-1">
          <span className="text-lg font-semibold text-gray-900">{t(question.labelKey)}</span>
          {isRequired && <span className="text-red-500">*</span>}
        </label>
        {question.descriptionKey && (
          <p className="mt-2 text-sm text-gray-600">{t(question.descriptionKey)}</p>
        )}
      </div>
      <div>{renderContent()}</div>
    </div>
  );
}
