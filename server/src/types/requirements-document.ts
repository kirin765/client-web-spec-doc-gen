// 서버 타입: PageSpec, FeatureSpec, RequirementsDocument.

import type { CostEstimate } from './cost-estimate';

export interface PageSpec {
  name: string;
  description: string;
}

export interface FeatureSpec {
  name: string;
  description: string;
}

export interface RequirementsDocument {
  generatedAt: string;

  clientInfo: {
    projectName: string;
    contactName?: string;
    contactEmail?: string;
  };

  projectOverview: {
    siteType: string;
    description: string;
    targetAudience: string;
  };

  scopeOfWork: {
    pages: PageSpec[];
    features: FeatureSpec[];
    integrations: string[];
  };

  designRequirements: {
    complexity: string;
    style: string;
    responsiveTargets: string[];
  };

  timeline: {
    urgency: string;
    estimatedWeeks: { min: number; max: number };
  };

  costEstimate: CostEstimate;
  additionalNotes: string;
}
