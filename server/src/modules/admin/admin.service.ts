// [C9] 수정 필요: getConversionStats()에서 소문자 키('submitted', 'draft')를 사용하나 Prisma groupBy는 대문자 enum 값('SUBMITTED', 'DRAFT')을 반환함. 대문자 키 사용 또는 enum 정규화 처리 필요.
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/db/prisma.service';
import {
  normalizeEnumFromApi,
  normalizeEnumToApi,
} from '../../common/utils/enum-normalizer';

interface ProjectRequestFilters {
  status?: string;
  siteType?: string;
  submittedFrom?: string;
  submittedTo?: string;
}

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async activateDeveloper(id: string): Promise<any> {
    const developer = await this.prisma.developer.findUnique({ where: { id } });
    if (!developer) {
      throw new NotFoundException(`Developer with ID ${id} not found`);
    }

    return this.prisma.developer.update({
      where: { id },
      data: { active: true },
    });
  }

  async deactivateDeveloper(id: string): Promise<any> {
    const developer = await this.prisma.developer.findUnique({ where: { id } });
    if (!developer) {
      throw new NotFoundException(`Developer with ID ${id} not found`);
    }

    return this.prisma.developer.update({
      where: { id },
      data: { active: false },
    });
  }

  async listProjectRequests(
    page: number = 1,
    limit: number = 10,
    filters?: ProjectRequestFilters,
  ): Promise<any> {
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (filters?.status) {
      where.status = normalizeEnumFromApi(filters.status);
    }
    if (filters?.siteType) {
      where.siteType = filters.siteType;
    }
    if (filters?.submittedFrom) {
      const submittedAt =
        (where.submittedAt as Record<string, unknown> | undefined) ?? {};
      where.submittedAt = {
        ...submittedAt,
        gte: new Date(filters.submittedFrom),
      };
    }
    if (filters?.submittedTo) {
      const submittedAt =
        (where.submittedAt as Record<string, unknown> | undefined) ?? {};
      where.submittedAt = {
        ...submittedAt,
        lte: new Date(filters.submittedTo),
      };
    }

    const [data, total] = await Promise.all([
      this.prisma.projectRequest.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.projectRequest.count({ where }),
    ]);

    return {
      data: data.map((projectRequest) => ({
        ...projectRequest,
        status: normalizeEnumToApi(projectRequest.status),
        createdAt: projectRequest.createdAt.toISOString(),
        updatedAt: projectRequest.updatedAt.toISOString(),
        submittedAt: projectRequest.submittedAt?.toISOString() ?? null,
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getConversionStats(): Promise<any> {
    const stats = await this.prisma.projectRequest.groupBy({
      by: ['status'],
      _count: {
        _all: true,
      },
    });

    const counts = stats.reduce<Record<string, number>>(
      (acc, item) => {
        acc[normalizeEnumToApi(item.status)] = item._count._all;
        return acc;
      },
      {},
    );

    const total = Object.values(counts).reduce((sum, count) => sum + count, 0);

    return {
      total,
      byStatus: counts,
      conversionRates: {
        draftToSubmitted: this.calculateRate(counts.submitted ?? 0, counts.draft ?? 0),
        submittedToMatching: this.calculateRate(
          (counts.matching ?? 0) + (counts.completed ?? 0),
          counts.submitted ?? 0,
        ),
        matchingToCompleted: this.calculateRate(
          counts.completed ?? 0,
          counts.matching ?? 0,
        ),
      },
    };
  }

  private calculateRate(numerator: number, denominator: number): number {
    if (denominator === 0) return 0;
    return parseFloat(((numerator / denominator) * 100).toFixed(2));
  }
}
