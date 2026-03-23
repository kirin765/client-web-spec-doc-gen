// AdminService — 개발자 활성화/비활성화, 요청 목록, 전환율 통계 구현.
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/db/prisma.service';

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

  async listProjectRequests(page: number = 1, limit: number = 10, filters?: any): Promise<any> {
    const skip = (page - 1) * limit;

    const where: any = {};
    if (filters?.status) {
      where.status = filters.status;
    }
    if (filters?.siteType) {
      where.siteType = filters.siteType;
    }
    if (filters?.submittedFrom) {
      where.submittedAt = {
        ...where.submittedAt,
        gte: new Date(filters.submittedFrom),
      };
    }
    if (filters?.submittedTo) {
      where.submittedAt = {
        ...where.submittedAt,
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
      data,
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
      _count: true,
    });

    const counts = stats.reduce(
      (acc: any, item: any) => {
        acc[item.status] = item._count;
        return acc;
      },
      {},
    );

    const total = Object.values(counts).reduce((a: number, b: any) => a + b, 0) as number;

    return {
      total,
      byStatus: counts,
      conversionRates: {
        draftToSubmitted: this.calculateRate(counts['submitted'] || 0, counts['draft'] || 0),
        submittedToMatching: this.calculateRate(
          (counts['matching'] || 0) + (counts['completed'] || 0),
          counts['submitted'] || 0,
        ),
        matchingToCompleted: this.calculateRate(counts['completed'] || 0, counts['matching'] || 0),
      },
    };
  }

  private calculateRate(numerator: number, denominator: number): number {
    if (denominator === 0) return 0;
    return parseFloat(((numerator / denominator) * 100).toFixed(2));
  }
}
