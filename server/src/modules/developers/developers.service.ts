// 개발자 서비스: DTO 기반 검증, 필터 화이트리스트 적용
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/db/prisma.service';
import {
  normalizeEnumFromApi,
  normalizeEnumToApi,
} from '../../common/utils/enum-normalizer';
import { CreateDeveloperDto } from './dto/create-developer.dto';
import { UpdateDeveloperDto } from './dto/update-developer.dto';

interface DeveloperSearchFilters {
  skills?: string[];
  supportedProjectTypes?: string[];
  minBudget?: number;
  maxBudget?: number;
  availabilityStatus?: string;
}

@Injectable()
export class DevelopersService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateDeveloperDto) {
    const developer = await this.prisma.developer.create({
      data: {
        displayName: dto.displayName,
        type: normalizeEnumFromApi(dto.type) as any,
        headline: dto.headline,
        introduction: dto.introduction,
        skills: dto.skills,
        specialties: dto.specialties ?? [],
        supportedProjectTypes: dto.supportedProjectTypes,
        supportedCoreFeatures: dto.supportedCoreFeatures ?? [],
        supportedEcommerceFeatures: dto.supportedEcommerceFeatures ?? [],
        supportedDesignStyles: dto.supportedDesignStyles ?? [],
        supportedDesignComplexities: dto.supportedDesignComplexities ?? [],
        supportedTimelines: dto.supportedTimelines ?? [],
        budgetMin: dto.budgetMin,
        budgetMax: dto.budgetMax,
        availabilityStatus: normalizeEnumFromApi(
          dto.availabilityStatus ?? 'available',
        ) as any,
        avgResponseHours: dto.avgResponseHours ?? 24,
        portfolioLinks: dto.portfolioLinks ?? [],
        regions: dto.regions ?? [],
        languages: dto.languages ?? [],
        active: false,
      },
    });

    return this.mapDeveloper(developer);
  }

  async update(id: string, dto: UpdateDeveloperDto) {
    const updateData: Record<string, unknown> = {};
    if (dto.displayName !== undefined) updateData.displayName = dto.displayName;
    if (dto.type !== undefined) {
      updateData.type = normalizeEnumFromApi(dto.type) as any;
    }
    if (dto.headline !== undefined) updateData.headline = dto.headline;
    if (dto.skills !== undefined) updateData.skills = dto.skills;
    if (dto.specialties !== undefined) updateData.specialties = dto.specialties;
    if (dto.supportedProjectTypes !== undefined) {
      updateData.supportedProjectTypes = dto.supportedProjectTypes;
    }
    if (dto.supportedCoreFeatures !== undefined) {
      updateData.supportedCoreFeatures = dto.supportedCoreFeatures;
    }
    if (dto.supportedEcommerceFeatures !== undefined) {
      updateData.supportedEcommerceFeatures = dto.supportedEcommerceFeatures;
    }
    if (dto.supportedDesignStyles !== undefined) {
      updateData.supportedDesignStyles = dto.supportedDesignStyles;
    }
    if (dto.supportedDesignComplexities !== undefined) {
      updateData.supportedDesignComplexities = dto.supportedDesignComplexities;
    }
    if (dto.supportedTimelines !== undefined) {
      updateData.supportedTimelines = dto.supportedTimelines;
    }
    if (dto.budgetMin !== undefined) updateData.budgetMin = dto.budgetMin;
    if (dto.budgetMax !== undefined) updateData.budgetMax = dto.budgetMax;
    if (dto.availabilityStatus !== undefined) {
      updateData.availabilityStatus = normalizeEnumFromApi(
        dto.availabilityStatus,
      ) as any;
    }
    if (dto.avgResponseHours !== undefined) {
      updateData.avgResponseHours = dto.avgResponseHours;
    }
    if (dto.portfolioLinks !== undefined) {
      updateData.portfolioLinks = dto.portfolioLinks;
    }
    if (dto.regions !== undefined) updateData.regions = dto.regions;
    if (dto.languages !== undefined) updateData.languages = dto.languages;
    if (dto.introduction !== undefined) updateData.introduction = dto.introduction;

    const developer = await this.prisma.developer.update({
      where: { id },
      data: updateData,
    });

    return this.mapDeveloper(developer);
  }

  async getById(id: string) {
    const developer = await this.prisma.developer.findUnique({
      where: { id },
    });

    if (!developer) {
      throw new NotFoundException('Developer not found');
    }

    return this.mapDeveloper(developer);
  }

  async getActiveDevelopers() {
    const developers = await this.prisma.developer.findMany({
      where: {
        active: true,
        availabilityStatus: {
          not: 'BUSY',
        },
      },
    });

    return developers.map((developer) => this.mapDeveloper(developer));
  }

  async search(filters: DeveloperSearchFilters) {
    const whereConditions: Record<string, unknown> = {
      active: true,
    };

    if (filters.skills && Array.isArray(filters.skills) && filters.skills.length > 0) {
      whereConditions.skills = {
        hasSome: filters.skills,
      };
    }

    if (
      filters.supportedProjectTypes &&
      Array.isArray(filters.supportedProjectTypes) &&
      filters.supportedProjectTypes.length > 0
    ) {
      whereConditions.supportedProjectTypes = {
        hasSome: filters.supportedProjectTypes,
      };
    }

    if (typeof filters.minBudget === 'number' && filters.minBudget >= 0) {
      whereConditions.budgetMax = {
        gte: filters.minBudget,
      };
    }

    if (typeof filters.maxBudget === 'number' && filters.maxBudget >= 0) {
      whereConditions.budgetMin = {
        lte: filters.maxBudget,
      };
    }

    if (filters.availabilityStatus) {
      whereConditions.availabilityStatus = normalizeEnumFromApi(
        filters.availabilityStatus,
      );
    }

    const developers = await this.prisma.developer.findMany({
      where: whereConditions,
    });

    return developers.map((developer) => this.mapDeveloper(developer));
  }

  async updateAvailability(id: string, status: 'AVAILABLE' | 'BUSY' | 'LIMITED') {
    const developer = await this.prisma.developer.update({
      where: { id },
      data: {
        availabilityStatus: normalizeEnumFromApi(status.toLowerCase()) as any,
      },
    });

    return this.mapDeveloper(developer);
  }

  private mapDeveloper(developer: any) {
    return {
      ...developer,
      type: normalizeEnumToApi(developer.type),
      availabilityStatus: normalizeEnumToApi(developer.availabilityStatus),
      createdAt:
        developer.createdAt instanceof Date
          ? developer.createdAt.toISOString()
          : developer.createdAt,
      updatedAt:
        developer.updatedAt instanceof Date
          ? developer.updatedAt.toISOString()
          : developer.updatedAt,
    };
  }
}
