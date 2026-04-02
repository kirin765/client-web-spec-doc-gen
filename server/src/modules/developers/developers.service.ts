import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/db/prisma.service';
import {
  normalizeEnumFromApi,
  normalizeEnumToApi,
} from '../../common/utils/enum-normalizer';
import { CreateDeveloperDto } from './dto/create-developer.dto';
import { UpdateDeveloperDto } from './dto/update-developer.dto';
import { getCareerLevel } from './developer-career';
import { UpsertExpertFaqDto } from './dto/upsert-expert-faq.dto';
import { UpsertExpertPortfolioDto } from './dto/upsert-expert-portfolio.dto';

interface DeveloperSearchFilters {
  skills?: string[];
  supportedProjectTypes?: string[];
  minBudget?: number;
  maxBudget?: number;
  availabilityStatus?: string;
  careerLevels?: string[];
  minCareerYears?: number;
  maxCareerYears?: number;
}

function toStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.map(String).filter(Boolean) : [];
}

function mapRegion(
  region:
    | {
        code: string;
        name: string;
        depth: number;
        parentCode: string | null;
        sortOrder: number;
      }
    | null
    | undefined,
) {
  if (!region) {
    return null;
  }

  return {
    code: region.code,
    name: region.name,
    depth: region.depth,
    parentCode: region.parentCode ?? null,
    sortOrder: region.sortOrder,
  };
}

function mapSignedImage(storageUrl: string) {
  return {
    storageUrl,
    url: storageUrl,
  };
}

@Injectable()
export class DevelopersService {
  constructor(private prisma: PrismaService) {}

  private matchesCareerFilters(
    developer: { totalCareerYears: number | null },
    filters: DeveloperSearchFilters,
  ) {
    const hasCareerFilter =
      (Array.isArray(filters.careerLevels) && filters.careerLevels.length > 0) ||
      (typeof filters.minCareerYears === 'number' && Number.isFinite(filters.minCareerYears)) ||
      (typeof filters.maxCareerYears === 'number' && Number.isFinite(filters.maxCareerYears));

    if (!hasCareerFilter) {
      return true;
    }

    const totalCareerYears = developer.totalCareerYears;
    if (!Number.isFinite(totalCareerYears) || totalCareerYears == null || totalCareerYears <= 0) {
      return false;
    }

    if (
      typeof filters.minCareerYears === 'number' &&
      Number.isFinite(filters.minCareerYears) &&
      totalCareerYears < filters.minCareerYears
    ) {
      return false;
    }

    if (
      typeof filters.maxCareerYears === 'number' &&
      Number.isFinite(filters.maxCareerYears) &&
      totalCareerYears > filters.maxCareerYears
    ) {
      return false;
    }

    if (Array.isArray(filters.careerLevels) && filters.careerLevels.length > 0) {
      const careerLevel = getCareerLevel(totalCareerYears);
      if (!careerLevel || !filters.careerLevels.includes(careerLevel)) {
        return false;
      }
    }

    return true;
  }

  private buildDeveloperMutationData(
    data: Partial<CreateDeveloperDto> & { regionCode?: string },
  ) {
    return {
      ...(data.displayName !== undefined ? { displayName: data.displayName } : {}),
      ...(data.type !== undefined
        ? { type: normalizeEnumFromApi(data.type) as 'FREELANCER' | 'AGENCY' }
        : {}),
      ...(data.headline !== undefined ? { headline: data.headline } : {}),
      ...(data.introduction !== undefined ? { introduction: data.introduction } : {}),
      ...(data.skills !== undefined ? { skills: data.skills } : {}),
      ...(data.specialties !== undefined ? { specialties: data.specialties } : {}),
      ...(data.supportedProjectTypes !== undefined
        ? { supportedProjectTypes: data.supportedProjectTypes }
        : {}),
      ...(data.supportedCoreFeatures !== undefined
        ? { supportedCoreFeatures: data.supportedCoreFeatures }
        : {}),
      ...(data.supportedEcommerceFeatures !== undefined
        ? { supportedEcommerceFeatures: data.supportedEcommerceFeatures }
        : {}),
      ...(data.supportedDesignStyles !== undefined
        ? { supportedDesignStyles: data.supportedDesignStyles }
        : {}),
      ...(data.supportedDesignComplexities !== undefined
        ? { supportedDesignComplexities: data.supportedDesignComplexities }
        : {}),
      ...(data.supportedTimelines !== undefined
        ? { supportedTimelines: data.supportedTimelines }
        : {}),
      ...(data.budgetMin !== undefined ? { budgetMin: data.budgetMin } : {}),
      ...(data.budgetMax !== undefined ? { budgetMax: data.budgetMax } : {}),
      ...(data.totalCareerYears !== undefined
        ? { totalCareerYears: data.totalCareerYears ?? null }
        : {}),
      ...(data.availabilityStatus !== undefined
        ? {
            availabilityStatus: normalizeEnumFromApi(data.availabilityStatus) as
              | 'AVAILABLE'
              | 'BUSY'
              | 'LIMITED',
          }
        : {}),
      ...(data.avgResponseHours !== undefined ? { avgResponseHours: data.avgResponseHours } : {}),
      ...(data.portfolioLinks !== undefined ? { portfolioLinks: data.portfolioLinks } : {}),
      ...(data.regions !== undefined ? { regions: data.regions } : {}),
      ...(data.languages !== undefined ? { languages: data.languages } : {}),
      ...(data.regionCode !== undefined ? { regionCode: data.regionCode || null } : {}),
    };
  }

  private async mapDeveloperProfile(
    developer: {
      id: string;
      userId: string | null;
      type: string;
      displayName: string;
      headline: string;
      introduction: string | null;
      skills: unknown;
      specialties: unknown;
      supportedProjectTypes: unknown;
      supportedCoreFeatures: unknown;
      supportedEcommerceFeatures: unknown;
      supportedDesignStyles: unknown;
      supportedDesignComplexities: unknown;
      supportedTimelines: unknown;
      budgetMin: number;
      budgetMax: number;
      totalCareerYears: number | null;
      availabilityStatus: string;
      avgResponseHours: number;
      portfolioLinks: unknown;
      regionCode: string | null;
      regions: unknown;
      languages: unknown;
      active: boolean;
      createdAt: Date;
      updatedAt: Date;
      region?: {
        code: string;
        name: string;
        depth: number;
        parentCode: string | null;
        sortOrder: number;
      } | null;
      faqs?: { id: string }[];
      portfolios?: { id: string; description: string; imageUrls: unknown }[];
      reviews?: { rating: number }[];
      user?: { email: string | null } | null;
    },
    options: { includeContactEmail?: boolean } = {},
  ) {
    const reviews = developer.reviews ?? [];
    const portfolioPreview = (developer.portfolios ?? []).slice(0, 3).map((portfolio) => {
      const imageUrls = toStringArray(portfolio.imageUrls);
      return {
        id: portfolio.id,
        description: portfolio.description,
        imageCount: imageUrls.length,
        previewImage: imageUrls[0] ? mapSignedImage(imageUrls[0]) : null,
      };
    });

    return {
      id: developer.id,
      type: normalizeEnumToApi(developer.type),
      displayName: developer.displayName,
      headline: developer.headline,
      introduction: developer.introduction ?? null,
      skills: toStringArray(developer.skills),
      specialties: toStringArray(developer.specialties),
      supportedProjectTypes: toStringArray(developer.supportedProjectTypes),
      supportedCoreFeatures: toStringArray(developer.supportedCoreFeatures),
      supportedEcommerceFeatures: toStringArray(developer.supportedEcommerceFeatures),
      supportedDesignStyles: toStringArray(developer.supportedDesignStyles),
      supportedDesignComplexities: toStringArray(developer.supportedDesignComplexities),
      supportedTimelines: toStringArray(developer.supportedTimelines),
      budgetMin: developer.budgetMin,
      budgetMax: developer.budgetMax,
      totalCareerYears: developer.totalCareerYears ?? null,
      availabilityStatus: normalizeEnumToApi(developer.availabilityStatus),
      careerLevel: getCareerLevel(developer.totalCareerYears),
      avgResponseHours: developer.avgResponseHours,
      portfolioLinks: toStringArray(developer.portfolioLinks),
      regionCode: developer.regionCode ?? null,
      region: mapRegion(developer.region),
      regions: toStringArray(developer.regions),
      languages: toStringArray(developer.languages),
      active: developer.active,
      faqCount: developer.faqs?.length ?? 0,
      reviewCount: reviews.length,
      reviewAverage:
        reviews.length === 0
          ? 0
          : Number(
              (
                reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
              ).toFixed(1),
            ),
      portfolioPreview,
      createdAt: developer.createdAt.toISOString(),
      updatedAt: developer.updatedAt.toISOString(),
      contactEmail: options.includeContactEmail ? developer.user?.email ?? null : undefined,
    };
  }

  private async getDeveloperEntityByUserId(userId: string) {
    const developer = await this.prisma.developer.findUnique({
      where: { userId },
      include: {
        region: true,
        faqs: {
          select: { id: true },
        },
        portfolios: {
          select: { id: true, description: true, imageUrls: true },
          orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
        },
        reviews: {
          select: { rating: true },
        },
        user: {
          select: { email: true },
        },
      },
    });

    if (!developer) {
      throw new NotFoundException('Developer profile not found');
    }

    return developer;
  }

  async create(data: CreateDeveloperDto) {
    return this.prisma.developer.create({
      data: {
        displayName: data.displayName,
        type: normalizeEnumFromApi(data.type) as 'FREELANCER' | 'AGENCY',
        headline: data.headline,
        introduction: data.introduction,
        skills: data.skills,
        specialties: data.specialties ?? [],
        supportedProjectTypes: data.supportedProjectTypes,
        supportedCoreFeatures: data.supportedCoreFeatures ?? [],
        supportedEcommerceFeatures: data.supportedEcommerceFeatures ?? [],
        supportedDesignStyles: data.supportedDesignStyles ?? [],
        supportedDesignComplexities: data.supportedDesignComplexities ?? [],
        supportedTimelines: data.supportedTimelines ?? [],
        budgetMin: data.budgetMin,
        budgetMax: data.budgetMax,
        totalCareerYears: data.totalCareerYears ?? null,
        availabilityStatus: normalizeEnumFromApi(
          data.availabilityStatus ?? 'available',
        ) as 'AVAILABLE' | 'BUSY' | 'LIMITED',
        avgResponseHours: data.avgResponseHours ?? 24,
        portfolioLinks: data.portfolioLinks ?? [],
        regions: data.regions ?? [],
        languages: data.languages ?? [],
        active: false,
      },
    });
  }

  async upsertByUserId(userId: string, data: CreateDeveloperDto & { regionCode?: string }) {
    const developer = await this.prisma.developer.upsert({
      where: { userId },
      update: {
        displayName: data.displayName,
        type: normalizeEnumFromApi(data.type) as 'FREELANCER' | 'AGENCY',
        headline: data.headline,
        introduction: data.introduction,
        skills: data.skills,
        specialties: data.specialties ?? [],
        supportedProjectTypes: data.supportedProjectTypes,
        supportedCoreFeatures: data.supportedCoreFeatures ?? [],
        supportedEcommerceFeatures: data.supportedEcommerceFeatures ?? [],
        supportedDesignStyles: data.supportedDesignStyles ?? [],
        supportedDesignComplexities: data.supportedDesignComplexities ?? [],
        supportedTimelines: data.supportedTimelines ?? [],
        budgetMin: data.budgetMin,
        budgetMax: data.budgetMax,
        totalCareerYears: data.totalCareerYears ?? null,
        availabilityStatus: normalizeEnumFromApi(
          data.availabilityStatus ?? 'available',
        ) as 'AVAILABLE' | 'BUSY' | 'LIMITED',
        avgResponseHours: data.avgResponseHours ?? 24,
        portfolioLinks: data.portfolioLinks ?? [],
        regions: data.regions ?? [],
        languages: data.languages ?? [],
        regionCode: data.regionCode ?? null,
      },
      create: {
        userId,
        displayName: data.displayName,
        type: normalizeEnumFromApi(data.type) as 'FREELANCER' | 'AGENCY',
        headline: data.headline,
        introduction: data.introduction,
        skills: data.skills,
        specialties: data.specialties ?? [],
        supportedProjectTypes: data.supportedProjectTypes,
        supportedCoreFeatures: data.supportedCoreFeatures ?? [],
        supportedEcommerceFeatures: data.supportedEcommerceFeatures ?? [],
        supportedDesignStyles: data.supportedDesignStyles ?? [],
        supportedDesignComplexities: data.supportedDesignComplexities ?? [],
        supportedTimelines: data.supportedTimelines ?? [],
        budgetMin: data.budgetMin,
        budgetMax: data.budgetMax,
        totalCareerYears: data.totalCareerYears ?? null,
        availabilityStatus: normalizeEnumFromApi(
          data.availabilityStatus ?? 'available',
        ) as 'AVAILABLE' | 'BUSY' | 'LIMITED',
        avgResponseHours: data.avgResponseHours ?? 24,
        portfolioLinks: data.portfolioLinks ?? [],
        regions: data.regions ?? [],
        languages: data.languages ?? [],
        regionCode: data.regionCode ?? null,
        active: false,
      },
      include: {
        region: true,
        faqs: {
          select: { id: true },
        },
        portfolios: {
          select: { id: true, description: true, imageUrls: true },
          orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
        },
        reviews: {
          select: { rating: true },
        },
        user: {
          select: { email: true },
        },
      },
    });

    return this.mapDeveloperProfile(developer, { includeContactEmail: true });
  }

  async update(id: string, data: UpdateDeveloperDto) {
    return this.prisma.developer.update({
      where: { id },
      data: this.buildDeveloperMutationData(data),
    });
  }

  async patchByUserId(
    userId: string,
    data: Partial<CreateDeveloperDto> & { regionCode?: string },
  ) {
    const existing = await this.getDeveloperEntityByUserId(userId);
    const developer = await this.prisma.developer.update({
      where: { id: existing.id },
      data: this.buildDeveloperMutationData(data),
      include: {
        region: true,
        faqs: {
          select: { id: true },
        },
        portfolios: {
          select: { id: true, description: true, imageUrls: true },
          orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
        },
        reviews: {
          select: { rating: true },
        },
        user: {
          select: { email: true },
        },
      },
    });

    return this.mapDeveloperProfile(developer, { includeContactEmail: true });
  }

  async getById(id: string) {
    const developer = await this.prisma.developer.findUnique({
      where: { id },
      include: {
        region: true,
        faqs: {
          select: { id: true },
        },
        portfolios: {
          select: { id: true, description: true, imageUrls: true },
          orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
        },
        reviews: {
          select: { rating: true },
        },
        user: {
          select: { email: true },
        },
      },
    });

    if (!developer) {
      throw new NotFoundException('Developer not found');
    }

    return this.mapDeveloperProfile(developer, { includeContactEmail: true });
  }

  async getByUserId(userId: string) {
    const developer = await this.getDeveloperEntityByUserId(userId);
    return this.mapDeveloperProfile(developer, { includeContactEmail: true });
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

  async search(filters: DeveloperSearchFilters) {
    const developers = await this.prisma.developer.findMany({
      where: {
        active: true,
        ...(filters.availabilityStatus
          ? {
              availabilityStatus: normalizeEnumFromApi(filters.availabilityStatus) as
                | 'AVAILABLE'
                | 'BUSY'
                | 'LIMITED',
            }
          : {}),
        ...(filters.minBudget !== undefined ? { budgetMax: { gte: filters.minBudget } } : {}),
        ...(filters.maxBudget !== undefined ? { budgetMin: { lte: filters.maxBudget } } : {}),
      },
      include: {
        region: true,
        faqs: {
          select: { id: true },
        },
        portfolios: {
          select: { id: true, description: true, imageUrls: true },
          orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
        },
        reviews: {
          select: { rating: true },
        },
        user: {
          select: { email: true },
        },
      },
      orderBy: [{ active: 'desc' }, { createdAt: 'desc' }],
    });

    const filtered = developers.filter((developer) => {
      const skills = toStringArray(developer.skills);
      const projectTypes = toStringArray(developer.supportedProjectTypes);

      const matchesSkills =
        !filters.skills || filters.skills.length === 0
          ? true
          : filters.skills.every((skill) => skills.includes(skill));
      const matchesProjectTypes =
        !filters.supportedProjectTypes || filters.supportedProjectTypes.length === 0
          ? true
          : filters.supportedProjectTypes.some((projectType) =>
              projectTypes.includes(projectType),
            );

      return (
        matchesSkills &&
        matchesProjectTypes &&
        this.matchesCareerFilters(developer, filters)
      );
    });

    return Promise.all(filtered.map((developer) => this.mapDeveloperProfile(developer)));
  }

  async listFaqsByDeveloperId(developerId: string) {
    const faqs = await this.prisma.expertFaq.findMany({
      where: { developerId },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
    });

    return faqs.map((faq) => ({
      id: faq.id,
      developerId: faq.developerId,
      question: faq.question,
      answer: faq.answer,
      sortOrder: faq.sortOrder,
      createdAt: faq.createdAt.toISOString(),
      updatedAt: faq.updatedAt.toISOString(),
    }));
  }

  async listFaqsByUserId(userId: string) {
    const developer = await this.getDeveloperEntityByUserId(userId);
    return this.listFaqsByDeveloperId(developer.id);
  }

  async createFaq(userId: string, dto: UpsertExpertFaqDto) {
    const developer = await this.getDeveloperEntityByUserId(userId);
    const faq = await this.prisma.expertFaq.create({
      data: {
        developerId: developer.id,
        question: dto.question,
        answer: dto.answer,
        sortOrder: dto.sortOrder ?? 0,
      },
    });

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

  async updateFaq(userId: string, faqId: string, dto: Partial<UpsertExpertFaqDto>) {
    const developer = await this.getDeveloperEntityByUserId(userId);
    const existing = await this.prisma.expertFaq.findFirst({
      where: {
        id: faqId,
        developerId: developer.id,
      },
    });

    if (!existing) {
      throw new NotFoundException('FAQ not found');
    }

    const faq = await this.prisma.expertFaq.update({
      where: { id: faqId },
      data: {
        ...(dto.question !== undefined ? { question: dto.question } : {}),
        ...(dto.answer !== undefined ? { answer: dto.answer } : {}),
        ...(dto.sortOrder !== undefined ? { sortOrder: dto.sortOrder } : {}),
      },
    });

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

  async deleteFaq(userId: string, faqId: string) {
    const developer = await this.getDeveloperEntityByUserId(userId);
    const existing = await this.prisma.expertFaq.findFirst({
      where: {
        id: faqId,
        developerId: developer.id,
      },
    });

    if (!existing) {
      throw new NotFoundException('FAQ not found');
    }

    await this.prisma.expertFaq.delete({
      where: { id: faqId },
    });

    return { success: true as const };
  }

  async listPortfoliosByDeveloperId(developerId: string) {
    const portfolios = await this.prisma.expertPortfolio.findMany({
      where: { developerId },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
    });

    return portfolios.map((portfolio) => ({
      id: portfolio.id,
      developerId: portfolio.developerId,
      description: portfolio.description,
      imageUrls: toStringArray(portfolio.imageUrls).map(mapSignedImage),
      sortOrder: portfolio.sortOrder,
      createdAt: portfolio.createdAt.toISOString(),
      updatedAt: portfolio.updatedAt.toISOString(),
    }));
  }

  async listPortfoliosByUserId(userId: string) {
    const developer = await this.getDeveloperEntityByUserId(userId);
    return this.listPortfoliosByDeveloperId(developer.id);
  }

  async createPortfolio(userId: string, dto: UpsertExpertPortfolioDto) {
    const developer = await this.getDeveloperEntityByUserId(userId);
    const portfolio = await this.prisma.expertPortfolio.create({
      data: {
        developerId: developer.id,
        description: dto.description,
        imageUrls: dto.imageUrls,
        sortOrder: dto.sortOrder ?? 0,
      },
    });

    return {
      id: portfolio.id,
      developerId: portfolio.developerId,
      description: portfolio.description,
      imageUrls: toStringArray(portfolio.imageUrls).map(mapSignedImage),
      sortOrder: portfolio.sortOrder,
      createdAt: portfolio.createdAt.toISOString(),
      updatedAt: portfolio.updatedAt.toISOString(),
    };
  }

  async updatePortfolio(
    userId: string,
    portfolioId: string,
    dto: Partial<UpsertExpertPortfolioDto>,
  ) {
    const developer = await this.getDeveloperEntityByUserId(userId);
    const existing = await this.prisma.expertPortfolio.findFirst({
      where: {
        id: portfolioId,
        developerId: developer.id,
      },
    });

    if (!existing) {
      throw new NotFoundException('Portfolio not found');
    }

    const portfolio = await this.prisma.expertPortfolio.update({
      where: { id: portfolioId },
      data: {
        ...(dto.description !== undefined ? { description: dto.description } : {}),
        ...(dto.imageUrls !== undefined ? { imageUrls: dto.imageUrls } : {}),
        ...(dto.sortOrder !== undefined ? { sortOrder: dto.sortOrder } : {}),
      },
    });

    return {
      id: portfolio.id,
      developerId: portfolio.developerId,
      description: portfolio.description,
      imageUrls: toStringArray(portfolio.imageUrls).map(mapSignedImage),
      sortOrder: portfolio.sortOrder,
      createdAt: portfolio.createdAt.toISOString(),
      updatedAt: portfolio.updatedAt.toISOString(),
    };
  }

  async deletePortfolio(userId: string, portfolioId: string) {
    const developer = await this.getDeveloperEntityByUserId(userId);
    const existing = await this.prisma.expertPortfolio.findFirst({
      where: {
        id: portfolioId,
        developerId: developer.id,
      },
    });

    if (!existing) {
      throw new NotFoundException('Portfolio not found');
    }

    await this.prisma.expertPortfolio.delete({
      where: { id: portfolioId },
    });

    return { success: true as const };
  }

  async updateAvailability(id: string, status: 'AVAILABLE' | 'BUSY' | 'LIMITED') {
    return this.prisma.developer.update({
      where: { id },
      data: { availabilityStatus: status },
    });
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
}
