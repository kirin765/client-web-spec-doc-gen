// =============================================================================
// Zustand 전역 상태 스토어
// =============================================================================
//
// TODO 구현 사항:
// 1. create()로 QuoteStore 생성
// 2. 초기 상태: currentStep = 0, answers = {}
// 3. setCurrentStep: 특정 스텝으로 직접 이동
// 4. nextStep: 현재 스텝 + 1 (최대 스텝 수 체크)
// 5. prevStep: 현재 스텝 - 1 (0 이하 방지)
// 6. setAnswer: questionId에 대한 답변 저장
//    - single-select: string
//    - multi-select: string[]
//    - range-slider: number
//    - text-input: string
// 7. resetQuote: 전체 상태 초기화 (새 견적 시작 시)
//
// 파생 상태 (selector로 구현):
// - getCostEstimate: answers를 costCalculator에 전달하여 실시간 비용 계산
// - getProgress: currentStep / totalSteps 비율
// - isStepComplete: 현재 스텝의 필수 질문이 모두 답변되었는지 검증
// =============================================================================

import { create } from 'zustand';
import type { QuoteStore } from '@/types';
import { questionCategories } from '@/data/questions';

const MAX_STEP = questionCategories.length - 1;

export const useQuoteStore = create<QuoteStore>((set) => ({
  currentStep: 0,
  answers: {},

  setCurrentStep: (step) => {
    set({ currentStep: Math.min(Math.max(step, 0), MAX_STEP) });
  },
  nextStep: () => {
    set((state) => ({ currentStep: Math.min(state.currentStep + 1, MAX_STEP) }));
  },
  prevStep: () => {
    set((state) => ({ currentStep: Math.max(state.currentStep - 1, 0) }));
  },
  setAnswer: (questionId, value) => {
    set((state) => ({ answers: { ...state.answers, [questionId]: value } }));
  },
  resetQuote: () => {
    set({ currentStep: 0, answers: {} });
  },
}));
