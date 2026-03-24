import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../common/db/prisma.service';
import {
  normalizeEnumFromApi,
  normalizeEnumToApi,
} from '../../common/utils/enum-normalizer';
import { CreateProposalDto } from './dto/create-proposal.dto';

function toPrismaJson(value: unknown): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}

@Injectable()
export class ProposalsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateProposalDto) {
    if (dto.priceMin > dto.priceMax) {
      throw new BadRequestException('priceMin must be less than or equal to priceMax');
    }

    const [projectRequest, developer] = await Promise.all([
      this.prisma.projectRequest.findUnique({
        where: { id: dto.projectRequestId },
      }),
      this.prisma.developer.findUnique({
        where: { id: dto.developerId },
      }),
    ]);

    if (!projectRequest) {
      throw new NotFoundException('Project request not found');
    }

    if (!developer) {
      throw new NotFoundException('Developer not found');
    }

    const isMatched = await this.prisma.matchResult.findUnique({
      where: {
        projectRequestId_developerId: {
          projectRequestId: dto.projectRequestId,
          developerId: dto.developerId,
        },
      },
    });

    if (!isMatched) {
      throw new BadRequestException('Developer is not matched to this project request');
    }

    const proposal = await this.prisma.proposal.upsert({
      where: {
        projectRequestId_developerId: {
          projectRequestId: dto.projectRequestId,
          developerId: dto.developerId,
        },
      },
      update: {
        priceMin: dto.priceMin,
        priceMax: dto.priceMax,
        estimatedDurationText: dto.estimatedDurationText,
        message: dto.message,
        portfolioLinks: toPrismaJson(dto.portfolioLinks ?? []),
        status: 'SUBMITTED',
        viewedAt: null,
        decidedAt: null,
      },
      create: {
        projectRequestId: dto.projectRequestId,
        developerId: dto.developerId,
        priceMin: dto.priceMin,
        priceMax: dto.priceMax,
        estimatedDurationText: dto.estimatedDurationText,
        message: dto.message,
        portfolioLinks: toPrismaJson(dto.portfolioLinks ?? []),
      },
      include: {
        developer: true,
      },
    });

    return this.mapProposal(proposal);
  }

  async listByProjectRequest(projectRequestId: string, userId?: string) {
    const projectRequest = await this.prisma.projectRequest.findUnique({
      where: { id: projectRequestId },
    });

    if (!projectRequest) {
      throw new NotFoundException('Project request not found');
    }

    if (userId && projectRequest.userId && projectRequest.userId !== userId) {
      throw new BadRequestException('Unauthorized access to project proposals');
    }

    const proposals = await this.prisma.proposal.findMany({
      where: { projectRequestId },
      orderBy: [{ status: 'asc' }, { priceMin: 'asc' }, { createdAt: 'desc' }],
      include: {
        developer: true,
      },
    });

    return proposals.map((proposal) => this.mapProposal(proposal));
  }

  async markViewed(id: string) {
    const proposal = await this.prisma.proposal.findUnique({
      where: { id },
      include: { developer: true },
    });

    if (!proposal) {
      throw new NotFoundException('Proposal not found');
    }

    const updated = await this.prisma.proposal.update({
      where: { id },
      data: {
        status: proposal.status === 'SUBMITTED' ? 'VIEWED' : proposal.status,
        viewedAt: proposal.viewedAt ?? new Date(),
      },
      include: {
        developer: true,
      },
    });

    return this.mapProposal(updated);
  }

  async markViewedByCustomer(id: string, userId: string) {
    const proposal = await this.prisma.proposal.findUnique({
      where: { id },
      include: {
        developer: true,
        projectRequest: {
          select: { userId: true },
        },
      },
    });

    if (!proposal) {
      throw new NotFoundException('Proposal not found');
    }

    if (proposal.projectRequest.userId && proposal.projectRequest.userId !== userId) {
      throw new BadRequestException('Unauthorized access to proposal');
    }

    const updated = await this.prisma.proposal.update({
      where: { id },
      data: {
        status: proposal.status === 'SUBMITTED' ? 'VIEWED' : proposal.status,
        viewedAt: proposal.viewedAt ?? new Date(),
      },
      include: {
        developer: true,
      },
    });

    return this.mapProposal(updated);
  }

  async updateDecision(id: string, status: 'accepted' | 'rejected') {
    const proposal = await this.prisma.proposal.findUnique({
      where: { id },
      include: { developer: true },
    });

    if (!proposal) {
      throw new NotFoundException('Proposal not found');
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      const acceptedOrRejected = await tx.proposal.update({
        where: { id },
        data: {
          status: normalizeEnumFromApi(status) as any,
          decidedAt: new Date(),
          viewedAt: proposal.viewedAt ?? new Date(),
        },
        include: {
          developer: true,
        },
      });

      if (status === 'accepted') {
        await tx.proposal.updateMany({
          where: {
            projectRequestId: proposal.projectRequestId,
            id: { not: proposal.id },
            status: { in: ['SUBMITTED', 'VIEWED'] },
          },
          data: {
            status: 'REJECTED',
            decidedAt: new Date(),
          },
        });
      }

      return acceptedOrRejected;
    });

    return this.mapProposal(updated);
  }

  async updateDecisionByCustomer(id: string, status: 'accepted' | 'rejected', userId: string) {
    const proposal = await this.prisma.proposal.findUnique({
      where: { id },
      include: {
        developer: true,
        projectRequest: {
          select: { userId: true },
        },
      },
    });

    if (!proposal) {
      throw new NotFoundException('Proposal not found');
    }

    if (proposal.projectRequest.userId && proposal.projectRequest.userId !== userId) {
      throw new BadRequestException('Unauthorized access to proposal');
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      const acceptedOrRejected = await tx.proposal.update({
        where: { id },
        data: {
          status: normalizeEnumFromApi(status) as any,
          decidedAt: new Date(),
          viewedAt: proposal.viewedAt ?? new Date(),
        },
        include: {
          developer: true,
        },
      });

      if (status === 'accepted') {
        await tx.proposal.updateMany({
          where: {
            projectRequestId: proposal.projectRequestId,
            id: { not: proposal.id },
            status: { in: ['SUBMITTED', 'VIEWED'] },
          },
          data: {
            status: 'REJECTED',
            decidedAt: new Date(),
          },
        });
      }

      return acceptedOrRejected;
    });

    return this.mapProposal(updated);
  }

  private mapProposal(proposal: any) {
    return {
      id: proposal.id,
      projectRequestId: proposal.projectRequestId,
      developerId: proposal.developerId,
      priceMin: proposal.priceMin,
      priceMax: proposal.priceMax,
      estimatedDurationText: proposal.estimatedDurationText,
      message: proposal.message,
      portfolioLinks: Array.isArray(proposal.portfolioLinks) ? proposal.portfolioLinks : [],
      status: normalizeEnumToApi(proposal.status),
      viewedAt: proposal.viewedAt?.toISOString() ?? null,
      decidedAt: proposal.decidedAt?.toISOString() ?? null,
      createdAt: proposal.createdAt.toISOString(),
      updatedAt: proposal.updatedAt.toISOString(),
      developer: proposal.developer
        ? {
            id: proposal.developer.id,
            displayName: proposal.developer.displayName,
            headline: proposal.developer.headline,
            portfolioLinks: Array.isArray(proposal.developer.portfolioLinks)
              ? proposal.developer.portfolioLinks
              : [],
            availabilityStatus: normalizeEnumToApi(proposal.developer.availabilityStatus),
            active: proposal.developer.active,
          }
        : undefined,
    };
  }
}
