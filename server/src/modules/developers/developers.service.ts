import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/db/prisma.service';
import {
  normalizeEnumFromApi,
  normalizeEnumToApi,
} from '../../common/utils/enum-normalizer';
import { StorageService } from '../../common/storage/storage.service';
import { CreateDeveloperDto } from './dto/create-developer.dto';
import { UpdateDeveloperDto } from './dto/update-developer.dto';

function asArray(value: unknown): string[] {
  return Array.isArray(value) ? (value as string[]) : [];
}

function mapRegion(region: any) {
  if (!region) {
    return null;
  }

  return {
    code: region.code,
    name: region.name,
    depth: region.depth,
    parentCode: region.parentCode ?? null,
  };
}

function normalizeRegionCode(value: unknown) {
  if (typeof value !== 'string') {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

@Injectable()
export class DevelopersService {
  constructor(
    private prisma: PrismaService,
    private storageService: StorageService,
  ) {}

  private mapWriteData(data: Partial<CreateDeveloperDto | UpdateDeveloperDto>) {
    const next: Record<string, unknown> = { ...data };

    if (typeof data.type === 'string') {
      next.type = normalizeEnumFromApi(data.type) as any;
    }

    if (typeof data.availabilityStatus === 'string') {
      next.availabilityStatus = normalizeEnumFromApi(data.availabilityStatus) as any;
    }

    const normalizedRegionCode = normalizeRegionCode(data.regionCode);
    if (normalizedRegionCode) {
      next.regionCode = normalizedRegionCode;
      next.regions = [normalizedRegionCode];
    } else if (Array.isArray(data.regions) && data.regions.length > 0) {
      next.regionCode = data.regions[0];
      next.regions = [data.regions[0]];
    }

    return next;
  }

  private async signStorageUrls(urls: string[]) {
    return Promise.all(
      urls.map(async (storageUrl) => ({
        storageUrl,
        url: await this.storageService.getSignedUrlFromStorageUrl(storageUrl),
      })),
    );
  }

  private async mapPortfolioPreview(portfolios: any[]) {
    const preview = portfolios.slice(0, 3);

    return Promise.all(
      preview.map(async (portfolio) => {
        const imageUrls = asArray(portfolio.imageUrls);
        const signedImages = await this.signStorageUrls(imageUrls);

        return {
          id: portfolio.id,
          description: portfolio.description,
          imageCount: imageUrls.length,
          previewImage: signedImages[0] ?? null,
        };
      }),
    );
  }

  private async mapPortfolio(portfolio: any) {
    return {
      id: portfolio.id,
      developerId: portfolio.developerId,
      description: portfolio.description,
      imageUrls: await this.signStorageUrls(asArray(portfolio.imageUrls)),
      sortOrder: portfolio.sortOrder,
      createdAt: portfolio.createdAt.toISOString(),
      updatedAt: portfolio.updatedAt.toISOString(),
    };
  }

  private mapFaq(faq: any) {
    return {
      id: faq.id,
      developerId: faq.developerId,
      question: faq.question,
      answer: faq.answer,
      sortOrder: faq.sortOrder,
      createdAt: faq.createdAt.toISOString(),
      updatedAt: faq.updatedAt.toISOString(),
    };
  }

  private async mapDeveloper(developer: any, includeEmail = false) {
    const reviewRatings = Array.isArray(developer.reviews)
      ? developer.reviews.map((review: any) => review.rating)
      : [];
    const reviewCount = reviewRatings.length;
    const reviewAverage =
      reviewCount === 0
        ? 0
        : Number(
            (reviewRatings.reduce((sum: number, rating: number) => sum + rating, 0) / reviewCount).toFixed(1),
          );

    return {
      id: developer.id,
      type: normalizeEnumToApi(developer.type),
      displayName: developer.displayName,
      headline: developer.headline,
      introduction: developer.introduction,
      skills: asArray(developer.skills),
      specialties: asArray(developer.specialties),
      supportedProjectTypes: asArray(developer.supportedProjectTypes),
      supportedCoreFeatures: asArray(developer.supportedCoreFeatures),
      supportedEcommerceFeatures: asArray(developer.supportedEcommerceFeatures),
      supportedDesignStyles: asArray(developer.supportedDesignStyles),
      supportedDesignComplexities: asArray(developer.supportedDesignComplexities),
      supportedTimelines: asArray(developer.supportedTimelines),
      budgetMin: developer.budgetMin,
      budgetMax: developer.budgetMax,
      availabilityStatus: normalizeEnumToApi(developer.availabilityStatus),
      avgResponseHours: developer.avgResponseHours,
      portfolioLinks: asArray(developer.portfolioLinks),
      regionCode: developer.regionCode ?? null,
      region: mapRegion(developer.region),
      regions: asArray(developer.regions),
      languages: asArray(developer.languages),
      active: developer.active,
      faqCount: Array.isArray(developer.faqs) ? developer.faqs.length : 0,
      reviewCount,
      reviewAverage,
      portfolioPreview: await this.mapPortfolioPreview(
        Array.isArray(developer.portfolios) ? developer.portfolios : [],
      ),
      createdAt:
        developer.createdAt instanceof Date
          ? developer.createdAt.toISOString()
          : developer.createdAt,
      updatedAt:
        developer.updatedAt instanceof Date
          ? developer.updatedAt.toISOString()
          : developer.updatedAt,
      ...(includeEmail
        ? {
            contactEmail: developer.user?.email ?? null,
          }
        : {}),
    };
  }

  async create(data: CreateDeveloperDto) {
    return this.prisma.developer.create({
      data: {
        ...(this.mapWriteData(data) as any),
        active: false,
      },
    });
  }

  async update(id: string, data: UpdateDeveloperDto) {
    const updated = await this.prisma.developer.update({
      where: { id },
      data: this.mapWriteData(data) as any,
      include: {
        user: {
          select: { email: true },
        },
        region: true,
        faqs: {
          select: { id: true },
        },
        portfolios: {
          orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
          take: 3,
        },
        reviews: {
          select: { rating: true },
        },
      },
    });

    return this.mapDeveloper(updated, true);
  }

  async getById(id: string) {
    const developer = await this.prisma.developer.findUnique({
      where: { id },
      include: {
        user: {
          select: { email: true },
        },
        region: true,
        faqs: {
          select: { id: true },
        },
        portfolios: {
          orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
          take: 3,
        },
        reviews: {
          select: { rating: true },
        },
      },
    });

    if (!developer) {
      throw new NotFoundException('Developer not found');
    }

    return developer;
  }

  async getPublicById(id: string) {
    const developer = await this.prisma.developer.findUnique({
      where: { id },
      include: {
        user: {
          select: { email: true },
        },
        region: true,
        faqs: {
          select: { id: true },
        },
        portfolios: {
          orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
          take: 3,
        },
        reviews: {
          select: { rating: true },
        },
      },
    });

    if (!developer || !developer.active) {
      throw new NotFoundException('Developer not found');
    }

    return this.mapDeveloper(developer, false);
  }

  async getByUserId(userId: string) {
    const developer = await this.prisma.developer.findUnique({
      where: { userId },
      include: {
        user: {
          select: { email: true },
        },
        region: true,
        faqs: {
          select: { id: true },
        },
        portfolios: {
          orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
          take: 3,
        },
        reviews: {
          select: { rating: true },
        },
      },
    });

    if (!developer) {
      throw new NotFoundException('Developer profile not found');
    }

    return this.mapDeveloper(developer, true);
  }

  async upsertByUser(userId: string, data: CreateDeveloperDto) {
    const existing = await this.prisma.developer.findUnique({
      where: { userId },
      select: { id: true, active: true },
    });

    const developer = await this.prisma.developer.upsert({
      where: { userId },
      update: {
        ...(this.mapWriteData(data) as any),
        userId,
      },
      create: {
        ...(this.mapWriteData(data) as any),
        userId,
        active: false,
      },
      include: {
        user: {
          select: { email: true },
        },
        region: true,
        faqs: {
          select: { id: true },
        },
        portfolios: {
          orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
          take: 3,
        },
        reviews: {
          select: { rating: true },
        },
      },
    });

    if (existing?.active) {
      const refreshed = await this.prisma.developer.update({
        where: { id: developer.id },
        data: { active: true },
        include: {
          user: {
            select: { email: true },
          },
          region: true,
          faqs: {
            select: { id: true },
          },
          portfolios: {
            orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
            take: 3,
          },
          reviews: {
            select: { rating: true },
          },
        },
      });
      return this.mapDeveloper(refreshed, true);
    }

    return this.mapDeveloper(developer, true);
  }

  async patchByUser(userId: string, data: UpdateDeveloperDto) {
    const existing = await this.prisma.developer.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!existing) {
      throw new NotFoundException('Developer profile not found');
    }

    const updated = await this.prisma.developer.update({
      where: { id: existing.id },
      data: this.mapWriteData(data) as any,
      include: {
        user: {
          select: { email: true },
        },
        region: true,
        faqs: {
          select: { id: true },
        },
        portfolios: {
          orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
          take: 3,
        },
        reviews: {
          select: { rating: true },
        },
      },
    });

    return this.mapDeveloper(updated, true);
  }

  async getActiveDevelopers() {
    return this.prisma.developer.findMany({
      where: {
        active: true,
        availabilityStatus: {
          not: 'BUSY',
        },
      },
    });
  }

  async search(filters: any) {
    const activeDevelopers = await this.prisma.developer.findMany({
      where: { active: true },
      include: {
        user: {
          select: { email: true },
        },
        region: true,
        faqs: {
          select: { id: true },
        },
        portfolios: {
          orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
          take: 3,
        },
        reviews: {
          select: { rating: true },
        },
      },
    });

    const availabilityStatus = filters?.availabilityStatus
      ? normalizeEnumFromApi(filters.availabilityStatus)
      : undefined;

    const filtered = activeDevelopers.filter((developer) => {
      if (availabilityStatus && developer.availabilityStatus !== availabilityStatus) {
        return false;
      }

      if (
        typeof filters?.minBudget === 'number' &&
        Number.isFinite(filters.minBudget) &&
        developer.budgetMax < filters.minBudget
      ) {
        return false;
      }

      if (
        typeof filters?.maxBudget === 'number' &&
        Number.isFinite(filters.maxBudget) &&
        developer.budgetMin > filters.maxBudget
      ) {
        return false;
      }

      if (Array.isArray(filters?.skills) && filters.skills.length > 0) {
        const hasSkill = filters.skills.some((skill: string) =>
          asArray(developer.skills).includes(skill),
        );
        if (!hasSkill) return false;
      }

      if (
        Array.isArray(filters?.supportedProjectTypes) &&
        filters.supportedProjectTypes.length > 0
      ) {
        const hasProjectType = filters.supportedProjectTypes.some((projectType: string) =>
          asArray(developer.supportedProjectTypes).includes(projectType),
        );
        if (!hasProjectType) return false;
      }

      return true;
    });

    return Promise.all(filtered.map((developer) => this.mapDeveloper(developer, false)));
  }

  async updateAvailability(id: string, status: 'AVAILABLE' | 'BUSY' | 'LIMITED') {
    const updated = await this.prisma.developer.update({
      where: { id },
      data: { availabilityStatus: status },
      include: {
        user: {
          select: { email: true },
        },
        region: true,
        faqs: {
          select: { id: true },
        },
        portfolios: {
          orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
          take: 3,
        },
        reviews: {
          select: { rating: true },
        },
      },
    });

    return this.mapDeveloper(updated, true);
  }

  async getMatches(developerId: string) {
    const developer = await this.prisma.developer.findUnique({
      where: { id: developerId },
    });

    if (!developer) {
      throw new NotFoundException('Developer not found');
    }

    const matches = await this.prisma.matchResult.findMany({
      where: { developerId },
      include: {
        projectRequest: true,
      },
      orderBy: [{ score: 'desc' }, { createdAt: 'desc' }],
    });

    return matches.map((match) => ({
      id: match.id,
      projectRequestId: match.projectRequestId,
      score: match.score,
      reasons: match.reasons,
      status: normalizeEnumToApi(match.status),
      createdAt: match.createdAt.toISOString(),
      projectRequest: {
        id: match.projectRequest.id,
        projectName: match.projectRequest.projectName,
        siteType: match.projectRequest.siteType,
        status: normalizeEnumToApi(match.projectRequest.status),
        costEstimate: match.projectRequest.costEstimate,
        submittedAt: match.projectRequest.submittedAt?.toISOString() ?? null,
      },
    }));
  }

  private async getDeveloperIdByUserId(userId: string) {
    const developer = await this.prisma.developer.findUnique({
      where: { userId },
      select: { id: true, active: true },
    });

    if (!developer) {
      throw new NotFoundException('Developer profile not found');
    }

    return developer.id;
  }

  private async assertFaqOwner(userId: string, faqId: string) {
    const developerId = await this.getDeveloperIdByUserId(userId);
    const faq = await this.prisma.expertFaq.findUnique({
      where: { id: faqId },
      select: { id: true, developerId: true },
    });

    if (!faq) {
      throw new NotFoundException('FAQ not found');
    }

    if (faq.developerId !== developerId) {
      throw new ForbiddenException('Cannot modify another developer\'s FAQ');
    }

    return developerId;
  }

  private async assertPortfolioOwner(userId: string, portfolioId: string) {
    const developerId = await this.getDeveloperIdByUserId(userId);
    const portfolio = await this.prisma.expertPortfolio.findUnique({
      where: { id: portfolioId },
      select: { id: true, developerId: true },
    });

    if (!portfolio) {
      throw new NotFoundException('Portfolio not found');
    }

    if (portfolio.developerId !== developerId) {
      throw new ForbiddenException('Cannot modify another developer\'s portfolio');
    }

    return developerId;
  }

  async listPublicFaqs(developerId: string) {
    const developer = await this.prisma.developer.findUnique({
      where: { id: developerId },
      select: { active: true },
    });

    if (!developer || !developer.active) {
      throw new NotFoundException('Developer not found');
    }

    const faqs = await this.prisma.expertFaq.findMany({
      where: { developerId },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    });

    return faqs.map((faq) => this.mapFaq(faq));
  }

  async listMyFaqs(userId: string) {
    const developerId = await this.getDeveloperIdByUserId(userId);
    const faqs = await this.prisma.expertFaq.findMany({
      where: { developerId },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    });

    return faqs.map((faq) => this.mapFaq(faq));
  }

  async createFaq(userId: string, dto: { question: string; answer: string; sortOrder?: number }) {
    const developerId = await this.getDeveloperIdByUserId(userId);
    const faq = await this.prisma.expertFaq.create({
      data: {
        developerId,
        question: dto.question,
        answer: dto.answer,
        sortOrder: dto.sortOrder ?? 0,
      },
    });

    return this.mapFaq(faq);
  }

  async updateFaq(
    userId: string,
    faqId: string,
    dto: { question?: string; answer?: string; sortOrder?: number },
  ) {
    await this.assertFaqOwner(userId, faqId);
    const faq = await this.prisma.expertFaq.update({
      where: { id: faqId },
      data: {
        ...(dto.question !== undefined ? { question: dto.question } : {}),
        ...(dto.answer !== undefined ? { answer: dto.answer } : {}),
        ...(dto.sortOrder !== undefined ? { sortOrder: dto.sortOrder } : {}),
      },
    });

    return this.mapFaq(faq);
  }

  async deleteFaq(userId: string, faqId: string) {
    await this.assertFaqOwner(userId, faqId);
    await this.prisma.expertFaq.delete({
      where: { id: faqId },
    });

    return { success: true };
  }

  async listPublicPortfolios(developerId: string) {
    const developer = await this.prisma.developer.findUnique({
      where: { id: developerId },
      select: { active: true },
    });

    if (!developer || !developer.active) {
      throw new NotFoundException('Developer not found');
    }

    const portfolios = await this.prisma.expertPortfolio.findMany({
      where: { developerId },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
    });

    return Promise.all(portfolios.map((portfolio) => this.mapPortfolio(portfolio)));
  }

  async listMyPortfolios(userId: string) {
    const developerId = await this.getDeveloperIdByUserId(userId);
    const portfolios = await this.prisma.expertPortfolio.findMany({
      where: { developerId },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
    });

    return Promise.all(portfolios.map((portfolio) => this.mapPortfolio(portfolio)));
  }

  async createPortfolio(
    userId: string,
    dto: { description: string; imageUrls: string[]; sortOrder?: number },
  ) {
    const developerId = await this.getDeveloperIdByUserId(userId);
    const portfolio = await this.prisma.expertPortfolio.create({
      data: {
        developerId,
        description: dto.description,
        imageUrls: dto.imageUrls,
        sortOrder: dto.sortOrder ?? 0,
      },
    });

    return this.mapPortfolio(portfolio);
  }

  async updatePortfolio(
    userId: string,
    portfolioId: string,
    dto: { description?: string; imageUrls?: string[]; sortOrder?: number },
  ) {
    await this.assertPortfolioOwner(userId, portfolioId);
    const portfolio = await this.prisma.expertPortfolio.update({
      where: { id: portfolioId },
      data: {
        ...(dto.description !== undefined ? { description: dto.description } : {}),
        ...(dto.imageUrls !== undefined ? { imageUrls: dto.imageUrls } : {}),
        ...(dto.sortOrder !== undefined ? { sortOrder: dto.sortOrder } : {}),
      },
    });

    return this.mapPortfolio(portfolio);
  }

  async deletePortfolio(userId: string, portfolioId: string) {
    await this.assertPortfolioOwner(userId, portfolioId);
    await this.prisma.expertPortfolio.delete({
      where: { id: portfolioId },
    });

    return { success: true };
  }
}
