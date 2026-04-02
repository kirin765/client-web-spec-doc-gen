import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useQuoteStore } from './useQuoteStore';

describe('useQuoteStore', () => {
  beforeEach(() => {
    Object.defineProperty(globalThis, 'localStorage', {
      value: {
        getItem: vi.fn(() => null),
        setItem: vi.fn(),
        removeItem: vi.fn(),
      },
      configurable: true,
    });
    useQuoteStore.getState().resetQuote();
  });

  it('stores answers and advances through steps within bounds', () => {
    useQuoteStore.getState().setAnswer('siteType', 'landing');
    useQuoteStore.getState().nextStep();

    expect(useQuoteStore.getState().answers.siteType).toBe('landing');
    expect(useQuoteStore.getState().currentStep).toBe(1);
  });

  it('does not move below step 0 and resets state', () => {
    useQuoteStore.getState().prevStep();
    expect(useQuoteStore.getState().currentStep).toBe(0);

    useQuoteStore.getState().setAnswer('projectName', 'Reset Test');
    useQuoteStore.getState().nextStep();
    useQuoteStore.getState().resetQuote();

    expect(useQuoteStore.getState().currentStep).toBe(0);
    expect(useQuoteStore.getState().answers).toEqual({});
  });
});
