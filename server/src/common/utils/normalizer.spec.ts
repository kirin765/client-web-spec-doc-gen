import { normalizeAnswers, validateNormalizedSpec } from './normalizer';

describe('normalizer', () => {
  it('normalizes alias fields into a shared spec shape', () => {
    const spec = normalizeAnswers({
      siteType: 'webapp',
      expectedPages: '7',
      coreFeatures: ['auth', 'payment'],
      designComplexity: 'custom',
      designStyle: 'minimal',
      externalIntegrations: ['googleAnalytics'],
      contentDelivery: 'clientProvides',
      desiredTimeline: 'urgent',
      budget: { min: '1000000', max: '5000000' },
    });

    expect(spec.projectType).toBe('webapp');
    expect(spec.scope.pageCount).toBe(7);
    expect(spec.scope.featureSet).toEqual(['auth', 'payment']);
    expect(spec.scope.designTier).toBe('custom');
    expect(spec.scope.integrations).toEqual(['googleAnalytics']);
    expect(spec.delivery.timelineWeeks).toEqual({ min: 2, max: 4 });
    expect(spec.budget).toEqual({ min: 1000000, max: 5000000 });
  });

  it('fails validation for invalid budget ranges', () => {
    const result = validateNormalizedSpec({
      projectType: 'landing',
      scope: {
        pageCount: 1,
        featureSet: [],
        ecommerceFeatureSet: [],
        designTier: 'template',
        designStyle: 'minimal',
        integrations: [],
        contentProvision: 'clientProvides',
      },
      delivery: {
        urgency: 'standard',
        timelineWeeks: { min: 4, max: 8 },
      },
      budget: {
        min: 3000000,
        max: 1000000,
      },
    });

    expect(result.valid).toBe(false);
    expect(result.errors).toContain('budget.min cannot be greater than budget.max');
  });
});
