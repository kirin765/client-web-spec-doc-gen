// 서버 타입: QuestionType, PricingImpact, QuestionOption, Question, QuestionCategory.

/** 질문 유형 */
export type QuestionType = 'single-select' | 'multi-select' | 'range-slider' | 'text-input';

/** 가격 영향도 */
export interface PricingImpact {
  type: 'base' | 'add' | 'multiply';
  value: number;
  category: string;
}

/** 질문의 개별 선택지 */
export interface QuestionOption {
  id: string;
  labelKey: string;
  descriptionKey?: string;
  icon?: string;
  pricingImpact: PricingImpact;
}

/** 개별 질문 정의 */
export interface Question {
  id: string;
  categoryId: string;
  type: QuestionType;
  labelKey: string;
  descriptionKey?: string;
  options?: QuestionOption[];
  validation?: {
    required?: boolean;
    min?: number;
    max?: number;
  };
  conditionalOn?: {
    questionId: string;
    values: string[];
  };
  pricingImpact?: PricingImpact;
}

/** 질문 카테고리 = 위저드의 한 스텝 */
export interface QuestionCategory {
  id: string;
  labelKey: string;
  icon: string;
  questions: Question[];
}
