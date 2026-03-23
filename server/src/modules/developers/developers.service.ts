// 개발자 서비스: DTO 기반 검증, 필터 화이트리스트 적용
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/db/prisma.service';

interface CreateDeveloperDto {
  displayName: string;
  email: string;
  skills?: string[];
  hourlyRate?: number;
  introduction?: string;
}

interface UpdateDeveloperDto {
  displayName?: string;
  skills?: string[];
  hourlyRate?: number;
  introduction?: string;
}

interface DeveloperSearchFilters {
  skills?: string[];
  minRate?: number;
  maxRate?: number;
}

@Injectable()
export class DevelopersService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateDeveloperDto) {
    if (!dto.displayName || !dto.email) {
      throw new BadRequestException('displayName and email are required');
    }
    return this.prisma.developer.create({
      data: {
        displayName: dto.displayName,
        email: dto.email,
        skills: dto.skills || [],
        hourlyRate: dto.hourlyRate || 0,
        introduction: dto.introduction || '',
        active: false, // Require admin approval
      },
    });
  }

  async update(id: string, dto: UpdateDeveloperDto) {
    // 허용 필드만 추출
    const updateData: any = {};
    if (dto.displayName !== undefined) updateData.displayName = dto.displayName;
    if (dto.skills !== undefined) updateData.skills = dto.skills;
    if (dto.hourlyRate !== undefined) updateData.hourlyRate = dto.hourlyRate;
    if (dto.introduction !== undefined) updateData.introduction = dto.introduction;

    return this.prisma.developer.update({
      where: { id },
      data: updateData,
    });
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
    const whereConditions: any = {
      active: true,
    };

    // 화이트리스트 필터만 적용
    if (filters.skills && Array.isArray(filters.skills) && filters.skills.length > 0) {
      whereConditions.skills = {
        hasSome: filters.skills,
      };
    }

    if (typeof filters.minRate === 'number' && filters.minRate >= 0) {
      whereConditions.hourlyRate = {
        ...whereConditions.hourlyRate,
        gte: filters.minRate,
      };
    }

    if (typeof filters.maxRate === 'number' && filters.maxRate >= 0) {
      whereConditions.hourlyRate = {
        ...whereConditions.hourlyRate,
        lte: filters.maxRate,
      };
    }

    return this.prisma.developer.findMany({
      where: whereConditions,
    });
  }

  async updateAvailability(id: string, status: 'AVAILABLE' | 'BUSY' | 'LIMITED') {
    return this.prisma.developer.update({
      where: { id },
      data: { availabilityStatus: status },
    });
  }
}

