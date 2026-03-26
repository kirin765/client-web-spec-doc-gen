// DevelopersService — create, update, search, updateAvailability, getActiveDevelopers, getById 구현.
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/db/prisma.service';
import {
  normalizeEnumFromApi,
  normalizeEnumToApi,
} from '../../common/utils/enum-normalizer';
import { CreateDeveloperDto } from './dto/create-developer.dto';
import { UpdateDeveloperDto } from './dto/update-developer.dto';

function asArray(value: unknown): string[] {
  return Array.isArray(value) ? (value as string[]) : [];
}

@Injectable()
export class DevelopersService {
  constructor(private prisma: PrismaService) {}

  private mapWriteData(data: Partial<CreateDeveloperDto | UpdateDeveloperDto>) {
    const next: Record<string, unknown> = { ...data };

    if (typeof data.type === 'string') {
      next.type = normalizeEnumFromApi(data.type) as any;
    }

    if (typeof data.availabilityStatus === 'string') {
      next.availabilityStatus = normalizeEnumFromApi(data.availabilityStatus) as any;
    }

    return next;
  }

  private mapDeveloper(developer: any, includeEmail = false) {
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
      regions: asArray(developer.regions),
      languages: asArray(developer.languages),
      active: developer.active,
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
        active: false, // Require admin approval
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
      },
    });

    return this.mapDeveloper(updated, true);
  }

  async getById(id: string) {
    const developer = await this.prisma.developer.findUnique({
      where: { id },
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

    return filtered.map((developer) => this.mapDeveloper(developer, false));
  }

  async updateAvailability(id: string, status: 'AVAILABLE' | 'BUSY' | 'LIMITED') {
    const updated = await this.prisma.developer.update({
      where: { id },
      data: { availabilityStatus: status },
      include: {
        user: {
          select: { email: true },
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
}
