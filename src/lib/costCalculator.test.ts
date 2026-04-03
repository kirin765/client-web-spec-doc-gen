import { describe, expect, it } from 'vitest';
import { calculateCost } from './costCalculator';

describe('calculateCost', () => {
  it('returns the landing base tier by default', () => {
    const result = calculateCost({});

    expect(result.baseTier.id).toBe('landing');
    expect(result.totalMin).toBe(1500000);
    expect(result.totalMax).toBe(3000000);
  });

  it('adds feature, content, integration, and extra page costs before multipliers', () => {
    const result = calculateCost({
      siteType: 'landing',
      expectedPages: 5,
      coreFeatures: ['search', 'payment'],
      contentDelivery: 'needCopywriting',
      externalIntegrations: ['googleAnalytics'],
    });

    expect(result.totalMin).toBe(5700000);
    expect(result.totalMax).toBe(12500000);
    expect(result.breakdown.map((item) => item.label)).toEqual(
      expect.arrayContaining([
        '추가 페이지 (2개)',
        '검색 기능',
        '결제 기능',
        '카피라이팅 필요',
        'Google Analytics',
      ]),
    );
  });

  it('applies design and timeline multipliers and rounds to 100000 KRW', () => {
    const result = calculateCost({
      siteType: 'brochure',
      designComplexity: 'premium',
      desiredTimeline: 'rush',
    });

    expect(result.designMultiplier).toBe(1.6);
    expect(result.timelineMultiplier).toBe(1.6);
    expect(result.totalMin).toBe(7600000);
    expect(result.totalMax).toBe(20500000);
  });
});
