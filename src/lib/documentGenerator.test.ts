import { describe, expect, it, vi } from 'vitest';
import { generateDocument } from './documentGenerator';
import type { CostEstimate } from '@/types';

describe('generateDocument', () => {
  it('maps answers into a requirements document with localized sections', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-04-02T00:00:00.000Z'));

    const costEstimate: CostEstimate = {
      baseTier: {
        id: 'landing',
        labelKey: 'pricing.tiers.landing',
        minCost: 1500000,
        maxCost: 3000000,
      },
      featureAdditions: [],
      designMultiplier: 1,
      timelineMultiplier: 1,
      totalMin: 1500000,
      totalMax: 3000000,
      breakdown: [],
    };

    const document = generateDocument(
      {
        siteType: 'landing',
        projectName: '런칭 캠페인',
        targetAudience: '스타트업 창업자',
        requiredPages: ['home', 'contact'],
        coreFeatures: ['contactForm'],
        designComplexity: 'template',
        designStyle: 'minimal',
        responsiveTargets: ['mobile', 'desktop'],
        externalIntegrations: ['googleAnalytics'],
        desiredTimeline: 'standard',
        additionalNotes: '빠른 런칭이 필요합니다.',
      },
      costEstimate,
    );

    expect(document.clientInfo.projectName).toBe('런칭 캠페인');
    expect(document.projectOverview.siteType).toBe('랜딩 페이지');
    expect(document.scopeOfWork.pages).toEqual([
      expect.objectContaining({ name: 'Home' }),
      expect.objectContaining({ name: 'Contact' }),
    ]);
    expect(document.scopeOfWork.features).toEqual([
      expect.objectContaining({ name: 'ContactForm' }),
    ]);
    expect(document.designRequirements).toEqual({
      complexity: '템플릿 기반',
      style: '미니멀',
      responsiveTargets: ['mobile', 'desktop'],
    });
    expect(document.timeline.estimatedWeeks).toEqual({ min: 4, max: 8 });
    expect(document.additionalNotes).toBe('빠른 런칭이 필요합니다.');

    vi.useRealTimers();
  });
});
