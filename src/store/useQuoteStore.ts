// useQuoteStore — Zustand 전역 상태 (currentStep, answers, 네비게이션 액션).

import { create } from 'zustand';
import { persist, type PersistStorage } from 'zustand/middleware';
import type { QuoteStore } from '@/types';
import { questionCategories } from '@/data/questions';

const MAX_STEP = questionCategories.length - 1;
const STORE_KEY = 'quote-store';

const storage: PersistStorage<QuoteStore> = {
  getItem: (key) => {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  },
  setItem: (key, value) => {
    localStorage.setItem(key, JSON.stringify(value));
  },
  removeItem: (key) => {
    localStorage.removeItem(key);
  },
};

export const useQuoteStore = create<QuoteStore>()(
  persist(
    (set) => ({
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
    }),
    {
      name: STORE_KEY,
      storage,
    }
  )
);
