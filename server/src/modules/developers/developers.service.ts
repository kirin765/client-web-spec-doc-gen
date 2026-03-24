// DevelopersService — create, update, search, updateAvailability, getActiveDevelopers, getById 구현.
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/db/prisma.service';
import { normalizeEnumToApi } from '../../common/utils/enum-normalizer';

@Injectable()
export class DevelopersService {
  constructor(private prisma: PrismaService) {}

  async create(data: any) {
    return this.prisma.developer.create({
      data: {
        ...data,
        active: false, // Require admin approval
      },
    });
  }

  async update(id: string, data: any) {
    return this.prisma.developer.update({
      where: { id },
      data,
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

  async search(filters: any) {
    return this.prisma.developer.findMany({
      where: {
        active: true,
        ...filters,
      },
    });
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
