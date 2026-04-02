import { describe, expect, it } from 'vitest';
import { buildMatchingInput, matchDevelopers } from './developerMatcher';
import type { CostEstimate } from '@/types';
import type { DeveloperProfile } from '@/types/matching';

const baseCostEstimate: CostEstimate = {
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

const developerA: DeveloperProfile = {
  id: 'dev-a',
  type: 'freelancer',
  displayName: 'Alpha Studio',
  headline: 'Landing page specialist',
  introduction: 'Builds marketing sites',
  skills: ['react'],
  specialties: ['landing'],
  supportedProjectTypes: ['landing'],
  supportedCoreFeatures: ['contactForm', 'search'],
  supportedEcommerceFeatures: [],
  supportedDesignStyles: ['minimal'],
  supportedDesignComplexities: ['template'],
  supportedTimelines: ['standard'],
  budgetMin: 1000000,
  budgetMax: 5000000,
  availabilityStatus: 'available',
  avgResponseHours: 12,
  portfolioLinks: [],
  regions: ['KR'],
  languages: ['ko'],
  active: true,
  createdAt: '2026-04-02T00:00:00.000Z',
  updatedAt: '2026-04-02T00:00:00.000Z',
};

const developerB: DeveloperProfile = {
  ...developerA,
  id: 'dev-b',
  displayName: 'Beta Agency',
  supportedCoreFeatures: ['contactForm'],
  supportedDesignStyles: ['corporate'],
  avgResponseHours: 36,
};

describe('developerMatcher', () => {
  it('builds matching input from answers and cost estimate', () => {
    const input = buildMatchingInput(
      {
        siteType: 'landing',
        coreFeatures: ['contactForm'],
        ecommerceFeatures: [],
        designComplexity: 'template',
        designStyle: 'minimal',
        desiredTimeline: 'standard',
      },
      baseCostEstimate,
    );

    expect(input).toEqual({
      siteType: 'landing',
      coreFeatures: ['contactForm'],
      ecommerceFeatures: [],
      designComplexity: 'template',
      designStyle: 'minimal',
      desiredTimeline: 'standard',
      budgetRange: {
        min: 1500000,
        max: 3000000,
      },
    });
  });

  it('sorts developers by score, feature overlap, and response time', () => {
    const results = matchDevelopers(
      {
        siteType: 'landing',
        coreFeatures: ['contactForm', 'search'],
        ecommerceFeatures: [],
        designComplexity: 'template',
        designStyle: 'minimal',
        desiredTimeline: 'standard',
        budgetRange: { min: 1500000, max: 3000000 },
      },
      [developerB, developerA],
    );

    expect(results[0].developer.id).toBe('dev-a');
    expect(results[0].score).toBeGreaterThan(results[1].score);
    expect(results[0].reasons[0].description).toContain('landing');
  });
});
