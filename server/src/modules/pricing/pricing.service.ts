// [수정필요 H15] 생성자에서 async initializeDefaultRules()를 await 없이 호출함.
//   OnModuleInit 인터페이스를 구현하고 초기화 로직을 onModuleInit()으로 이동해야 함.
// [수정필요 M13] 기본 가격 규칙의 siteType ID(landing/ecommerce/corporate/portal)가
//   클라이언트 siteType ID(landing/brochure/ecommerce/webapp/blog)와 불일치. 정렬 필요.
// [수정필요 M14] 기본 가격 규칙의 feature ID(authentication/admin_cms/...)가
//   클라이언트 feature ID(auth/adminPanel/...)와 불일치. 정렬 필요.
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../../common/db/prisma.service';
import { calculateCostFromRules } from '../../common/utils/cost-calculator';
import type { CostEstimate } from '../../types/cost-estimate';
import type { PricingRuleSet, PricingRuleVersion } from '../../types/pricing-rule';
import type { NormalizedSpec } from '../../types/answers';

const DEFAULT_PRICING_RULES: PricingRuleSet = {
  baseTiers: [
    { id: 'landing', labelKey: 'pricing.tiers.landing', minCost: 1500000, maxCost: 3000000, defaultPageCount: 3 },
    { id: 'brochure', labelKey: 'pricing.tiers.brochure', minCost: 3000000, maxCost: 8000000, defaultPageCount: 7 },
    { id: 'ecommerce', labelKey: 'pricing.tiers.ecommerce', minCost: 8000000, maxCost: 20000000, defaultPageCount: 15 },
    { id: 'webapp', labelKey: 'pricing.tiers.webapp', minCost: 10000000, maxCost: 30000000, defaultPageCount: 10 },
    { id: 'blog', labelKey: 'pricing.tiers.blog', minCost: 2000000, maxCost: 5000000, defaultPageCount: 5 },
  ],
  featureCosts: {
    contactForm: { min: 0, max: 0 },
    search: { min: 500000, max: 1000000 },
    auth: { min: 1000000, max: 2000000 },
    payment: { min: 2000000, max: 4000000 },
    adminPanel: { min: 2000000, max: 5000000 },
    fileUpload: { min: 500000, max: 1000000 },
    chat: { min: 1500000, max: 3000000 },
    socialIntegration: { min: 300000, max: 500000 },
    multiLanguage: { min: 1000000, max: 2000000 },
    analyticsDashboard: { min: 1000000, max: 2000000 },
    booking: { min: 2000000, max: 4000000 },
    mapIntegration: { min: 300000, max: 500000 },
    productManagement: { min: 1000000, max: 2000000 },
    inventory: { min: 1000000, max: 2000000 },
    orderTracking: { min: 1000000, max: 2000000 },
    couponSystem: { min: 500000, max: 1000000 },
    reviewSystem: { min: 500000, max: 1000000 },
  },
  designMultipliers: {
    template: 1.0,
    custom: 1.3,
    premium: 1.6,
  },
  timelineMultipliers: {
    flexible: 1.0,
    standard: 1.0,
    urgent: 1.3,
    rush: 1.6,
  },
  perPageCost: { min: 200000, max: 500000 },
  contentCosts: {
    clientProvides: { min: 0, max: 0 },
    needCopywriting: { min: 1000000, max: 3000000 },
    needMediaProduction: { min: 2000000, max: 5000000 },
  },
  integrationCosts: {
    googleAnalytics: { min: 300000, max: 500000 },
    metaPixel: { min: 300000, max: 500000 },
    kakaoPay: { min: 300000, max: 500000 },
    tossPay: { min: 300000, max: 500000 },
    naverPay: { min: 300000, max: 500000 },
    crmIntegration: { min: 300000, max: 500000 },
    externalApi: { min: 300000, max: 500000 },
  },
};

@Injectable()
export class PricingService implements OnModuleInit {
  private readonly logger = new Logger(PricingService.name);
  private currentRulesCache: { rules: PricingRuleSet; version: string; expiresAt: number } | null = null;
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  constructor(
    private prisma: PrismaService,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.initializeDefaultRules();
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
      throw error;
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
    normalizedSpec: NormalizedSpec,
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
