// QuestionCard — 질문 유형별(single-select, multi-select, range-slider, text-input) 입력 렌더링.

import { useEffect } from 'react';
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

  // 범위 슬라이더의 초기값을 스토어에 저장
  useEffect(() => {
    if (question.type === 'range-slider' && currentValue === undefined) {
      setAnswer(question.id, question.validation?.min || 1);
    }
  }, [question.id, question.type, question.validation?.min, currentValue, setAnswer]);

  const renderSingleSelect = () => {
    return (
      <div className="space-y-4">
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
      <div className="space-y-4">
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
    const min = question.validation?.min || 1;
    const max = question.validation?.max || 100;
    const value = typeof currentValue === 'number' ? currentValue : min;

    return (
      <div className="space-y-6">
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={(e) => setAnswer(question.id, parseInt(e.target.value, 10))}
          className="w-full accent-primary-600 cursor-pointer h-2 rounded-lg appearance-none bg-secondary-200"
        />
        <div className="flex justify-between items-center">
          <span className="text-body-sm text-secondary-600">{min}</span>
          <span className="text-heading-md font-semibold text-primary-600">{value}</span>
          <span className="text-body-sm text-secondary-600">{max}</span>
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
      className: cn('input w-full'),
    };

    return isTextArea ? (
      <textarea {...baseProps} rows={5} />
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
    <div className="card p-6">
      <div className="mb-6">
        <label className="flex items-baseline gap-2">
          <span className="heading-lg text-secondary-900">{t(question.labelKey)}</span>
          {isRequired && <span className="text-error-600 text-lg font-bold">*</span>}
        </label>
        {question.descriptionKey && (
          <p className="mt-3 text-body-md text-secondary-600">{t(question.descriptionKey)}</p>
        )}
      </div>
      <div>{renderContent()}</div>
    </div>
  );
}
