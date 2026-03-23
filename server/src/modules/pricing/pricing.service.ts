// PricingService — 기본 가격 규칙, 비용 계산, 버전 캐싱 구현.
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../common/db/prisma.service';
import { calculateCostFromRules } from '../../common/utils/cost-calculator';
import type { CostEstimate } from '../../types/cost-estimate';
import type { PricingRuleSet, PricingRuleVersion } from '../../types/pricing-rule';

const DEFAULT_PRICING_RULES: PricingRuleSet = {
  baseTiers: [
    { id: 'landing', labelKey: 'landing', minCost: 500000, maxCost: 2000000, defaultPageCount: 5 },
    { id: 'ecommerce', labelKey: 'ecommerce', minCost: 2000000, maxCost: 8000000, defaultPageCount: 10 },
    { id: 'corporate', labelKey: 'corporate', minCost: 1500000, maxCost: 5000000, defaultPageCount: 10 },
    { id: 'portal', labelKey: 'portal', minCost: 3000000, maxCost: 10000000, defaultPageCount: 15 },
  ],
  featureCosts: {
    authentication: { min: 300000, max: 800000 },
    admin_cms: { min: 500000, max: 1500000 },
    payment: { min: 400000, max: 1200000 },
    search: { min: 200000, max: 600000 },
    analytics: { min: 100000, max: 400000 },
    notification: { min: 200000, max: 600000 },
    api: { min: 300000, max: 1000000 },
    mobile_app: { min: 2000000, max: 5000000 },
  },
  designMultipliers: {
    template: 1.0,
    custom: 1.3,
    premium: 1.6,
  },
  timelineMultipliers: {
    urgent: 1.5,
    high: 1.2,
    medium: 1.0,
    low: 0.9,
  },
  perPageCost: { min: 50000, max: 200000 },
  contentCosts: {
    basic: { min: 100000, max: 500000 },
    advanced: { min: 500000, max: 2000000 },
  },
  integrationCosts: {
    stripe: { min: 200000, max: 500000 },
    sendgrid: { min: 100000, max: 300000 },
    slack: { min: 100000, max: 300000 },
    google_analytics: { min: 50000, max: 200000 },
  },
};

@Injectable()
export class PricingService {
  private readonly logger = new Logger(PricingService.name);
  private currentRulesCache: { rules: PricingRuleSet; version: string; expiresAt: number } | null = null;
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {
    this.initializeDefaultRules();
  }

  private async initializeDefaultRules(): Promise<void> {
    try {
      const existing = await this.prisma.pricingRuleVersion.findUnique({
        where: { version: 'v1.0.0' },
      });

      if (!existing) {
        await this.prisma.pricingRuleVersion.create({
          data: {
            version: 'v1.0.0',
            rules: DEFAULT_PRICING_RULES as any,
            effectiveFrom: new Date(),
            createdBy: 'system',
          },
        });
        this.logger.log('Default pricing rules initialized');
      }
    } catch (error) {
      this.logger.error('Failed to initialize pricing rules', error);
    }
  }

  async getCurrentRules(): Promise<{ rules: PricingRuleSet; version: string }> {
    // Check cache
    if (this.currentRulesCache && this.currentRulesCache.expiresAt > Date.now()) {
      return {
        rules: this.currentRulesCache.rules,
        version: this.currentRulesCache.version,
      };
    }

    // Query from database
    const now = new Date();
    const versionRecord = await this.prisma.pricingRuleVersion.findFirst({
      where: {
        effectiveFrom: {
          lte: now,
        },
      },
      orderBy: {
        effectiveFrom: 'desc',
      },
    });

    if (!versionRecord) {
      return {
        rules: DEFAULT_PRICING_RULES,
        version: 'v1.0.0',
      };
    }

    const rules = versionRecord.rules as unknown as PricingRuleSet;
    this.currentRulesCache = {
      rules,
      version: versionRecord.version,
      expiresAt: Date.now() + this.CACHE_TTL,
    };

    return { rules, version: versionRecord.version };
  }

  async getRuleVersion(versionId: string): Promise<PricingRuleVersion | null> {
    const record = await this.prisma.pricingRuleVersion.findUnique({
      where: { id: versionId },
    });

    if (!record) {
      return null;
    }

    return {
      id: record.id,
      version: record.version,
      rules: record.rules as unknown as PricingRuleSet,
      effectiveFrom: record.effectiveFrom.toISOString(),
      createdAt: record.createdAt.toISOString(),
      createdBy: record.createdBy || undefined,
    };
  }

  async createNewVersion(
    rules: PricingRuleSet,
    effectiveFrom: Date,
    createdBy?: string,
  ): Promise<PricingRuleVersion> {
    const versionNumber = `v${Date.now()}`;

    const record = await this.prisma.pricingRuleVersion.create({
      data: {
        version: versionNumber,
        rules: rules as any,
        effectiveFrom,
        createdBy,
      },
    });

    // Invalidate cache
    this.currentRulesCache = null;

    return {
      id: record.id,
      version: record.version,
      rules: record.rules as unknown as PricingRuleSet,
      effectiveFrom: record.effectiveFrom.toISOString(),
      createdAt: record.createdAt.toISOString(),
      createdBy: record.createdBy || undefined,
    };
  }

  async calculateCost(
    normalizedSpec: any,
    versionId?: string,
  ): Promise<CostEstimate & { pricingVersion: string }> {
    let rules: PricingRuleSet;
    let version: string;

    if (versionId) {
      const versionRecord = await this.getRuleVersion(versionId);
      if (!versionRecord) {
        throw new Error(`Pricing version not found: ${versionId}`);
      }
      rules = versionRecord.rules;
      version = versionRecord.version;
    } else {
      const current = await this.getCurrentRules();
      rules = current.rules;
      version = current.version;
    }

    const costEstimate = calculateCostFromRules(normalizedSpec, rules);

    return {
      ...costEstimate,
      pricingVersion: version,
    };
  }

  async getAllVersions(): Promise<PricingRuleVersion[]> {
    const records = await this.prisma.pricingRuleVersion.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return records.map((r) => ({
      id: r.id,
      version: r.version,
      rules: r.rules as unknown as PricingRuleSet,
      effectiveFrom: r.effectiveFrom.toISOString(),
      createdAt: r.createdAt.toISOString(),
      createdBy: r.createdBy || undefined,
    }));
  }
}
