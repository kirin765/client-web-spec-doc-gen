import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../common/db/prisma.service';
import { normalizeEnumToApi } from '../../common/utils/enum-normalizer';
import { CreateQuoteShareDto } from './dto/create-quote-share.dto';

type Actor = 'user' | 'developer';

@Injectable()
export class QuoteSharesService {
  constructor(private prisma: PrismaService) {}

  private mapQuoteShare(
    quoteShare: any,
    actor: Actor,
    includeCounterpartyEmail: boolean,
  ) {
    const canRevealContact = quoteShare.status === 'APPROVED' && includeCounterpartyEmail;
    const counterpartyEmail =
      canRevealContact && actor === 'user'
        ? quoteShare.developer?.user?.email ?? null
        : canRevealContact
          ? quoteShare.projectRequest?.user?.email ?? null
          : null;

    return {
      id: quoteShare.id,
      projectRequestId: quoteShare.projectRequestId,
      developerId: quoteShare.developerId,
      status: normalizeEnumToApi(quoteShare.status),
      approvedAt: quoteShare.approvedAt?.toISOString() ?? null,
      canceledAt: quoteShare.canceledAt?.toISOString() ?? null,
      canceledBy: quoteShare.canceledBy
        ? normalizeEnumToApi(quoteShare.canceledBy)
        : null,
      createdAt: quoteShare.createdAt.toISOString(),
      updatedAt: quoteShare.updatedAt.toISOString(),
      canOpenContact: quoteShare.status === 'APPROVED',
      counterpartyEmail,
      projectRequest: quoteShare.projectRequest
        ? {
            id: quoteShare.projectRequest.id,
            projectName: quoteShare.projectRequest.projectName,
            siteType: quoteShare.projectRequest.siteType,
            status: normalizeEnumToApi(quoteShare.projectRequest.status),
          }
        : null,
      developer: quoteShare.developer
        ? {
            id: quoteShare.developer.id,
            displayName: quoteShare.developer.displayName,
            headline: quoteShare.developer.headline,
            type: normalizeEnumToApi(quoteShare.developer.type),
            availabilityStatus: normalizeEnumToApi(
              quoteShare.developer.availabilityStatus,
            ),
          }
        : null,
    };
  }

  private async getDeveloperByUserId(userId: string) {
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

    return developer;
  }

  async createByUser(userId: string, dto: CreateQuoteShareDto) {
    const [projectRequest, developer] = await Promise.all([
      this.prisma.projectRequest.findUnique({
        where: { id: dto.projectRequestId },
        include: {
          user: {
            select: { id: true, email: true },
          },
        },
      }),
      this.prisma.developer.findUnique({
        where: { id: dto.developerId },
        include: {
          user: {
            select: { id: true, email: true },
          },
        },
      }),
    ]);

    if (!projectRequest) {
      throw new NotFoundException('Project request not found');
    }

    if (!developer || !developer.active) {
      throw new NotFoundException('Developer not found');
    }

    if (projectRequest.userId !== userId) {
      throw new ForbiddenException('Cannot share another user\'s quote');
    }

    if (developer.userId && developer.userId === userId) {
      throw new BadRequestException('Cannot share a quote to your own developer profile');
    }

    const existing = await this.prisma.quoteShare.findUnique({
      where: {
        projectRequestId_developerId: {
          projectRequestId: dto.projectRequestId,
          developerId: dto.developerId,
        },
      },
    });

    if (existing) {
      throw new BadRequestException('Quote is already shared with this developer');
    }

    const created = await this.prisma.quoteShare.create({
      data: {
        projectRequestId: dto.projectRequestId,
        developerId: dto.developerId,
        status: 'SENT',
      },
      include: {
        projectRequest: {
          include: {
            user: {
              select: { email: true },
            },
          },
        },
        developer: {
          include: {
            user: {
              select: { email: true },
            },
          },
        },
      },
    });

    return this.mapQuoteShare(created, 'user', false);
  }

  async listSentByUser(userId: string) {
    const list = await this.prisma.quoteShare.findMany({
      where: {
        projectRequest: {
          userId,
        },
      },
      include: {
        projectRequest: {
          include: {
            user: {
              select: { email: true },
            },
          },
        },
        developer: {
          include: {
            user: {
              select: { email: true },
            },
          },
        },
      },
      orderBy: [{ updatedAt: 'desc' }, { createdAt: 'desc' }],
    });

    return list.map((item) => this.mapQuoteShare(item, 'user', false));
  }

  async listInboxByDeveloper(userId: string) {
    const developer = await this.getDeveloperByUserId(userId);

    const list = await this.prisma.quoteShare.findMany({
      where: {
        developerId: developer.id,
        status: {
          in: ['SENT', 'APPROVED'],
        },
      },
      include: {
        projectRequest: {
          include: {
            user: {
              select: { email: true },
            },
          },
        },
        developer: {
          include: {
            user: {
              select: { email: true },
            },
          },
        },
      },
      orderBy: [{ updatedAt: 'desc' }, { createdAt: 'desc' }],
    });

    return list.map((item) => this.mapQuoteShare(item, 'developer', false));
  }

  async getDetail(id: string, userId: string) {
    const quoteShare = await this.prisma.quoteShare.findUnique({
      where: { id },
      include: {
        projectRequest: {
          include: {
            user: {
              select: { id: true, email: true },
            },
          },
        },
        developer: {
          include: {
            user: {
              select: { id: true, email: true },
            },
          },
        },
      },
    });

    if (!quoteShare) {
      throw new NotFoundException('Quote share not found');
    }

    const isOwner = quoteShare.projectRequest?.userId === userId;
    const isDeveloper = quoteShare.developer?.userId === userId;

    if (!isOwner && !isDeveloper) {
      throw new ForbiddenException('You do not have access to this quote share');
    }

    return this.mapQuoteShare(
      quoteShare,
      isOwner ? 'user' : 'developer',
      true,
    );
  }

  async cancelByUser(id: string, userId: string) {
    const quoteShare = await this.prisma.quoteShare.findUnique({
      where: { id },
      include: {
        projectRequest: {
          select: { userId: true },
        },
      },
    });

    if (!quoteShare) {
      throw new NotFoundException('Quote share not found');
    }

    if (quoteShare.projectRequest.userId !== userId) {
      throw new ForbiddenException('Cannot cancel another user\'s quote share');
    }

    if (quoteShare.status === 'APPROVED') {
      throw new BadRequestException('Approved quote share cannot be canceled by user');
    }

    const updated = await this.prisma.quoteShare.update({
      where: { id },
      data: {
        status: 'CANCELED_BY_USER',
        canceledAt: new Date(),
        canceledBy: 'USER',
      },
      include: {
        projectRequest: {
          include: {
            user: {
              select: { email: true },
            },
          },
        },
        developer: {
          include: {
            user: {
              select: { email: true },
            },
          },
        },
      },
    });

    return this.mapQuoteShare(updated, 'user', false);
  }

  async approveByDeveloper(id: string, userId: string) {
    const developer = await this.getDeveloperByUserId(userId);
    const quoteShare = await this.prisma.quoteShare.findUnique({
      where: { id },
    });

    if (!quoteShare) {
      throw new NotFoundException('Quote share not found');
    }

    if (quoteShare.developerId !== developer.id) {
      throw new ForbiddenException('Cannot approve another developer\'s quote share');
    }

    if (quoteShare.status !== 'SENT') {
      throw new BadRequestException('Only sent quote shares can be approved');
    }

    const updated = await this.prisma.quoteShare.update({
      where: { id },
      data: {
        status: 'APPROVED',
        approvedAt: new Date(),
        canceledAt: null,
        canceledBy: null,
      },
      include: {
        projectRequest: {
          include: {
            user: {
              select: { email: true },
            },
          },
        },
        developer: {
          include: {
            user: {
              select: { email: true },
            },
          },
        },
      },
    });

    return this.mapQuoteShare(updated, 'developer', false);
  }

  async cancelByDeveloper(id: string, userId: string) {
    const developer = await this.getDeveloperByUserId(userId);
    const quoteShare = await this.prisma.quoteShare.findUnique({
      where: { id },
    });

    if (!quoteShare) {
      throw new NotFoundException('Quote share not found');
    }

    if (quoteShare.developerId !== developer.id) {
      throw new ForbiddenException('Cannot cancel another developer\'s quote share');
    }

    if (quoteShare.status === 'APPROVED') {
      throw new BadRequestException('Approved quote share cannot be canceled by developer');
    }

    const updated = await this.prisma.quoteShare.update({
      where: { id },
      data: {
        status: 'CANCELED_BY_DEVELOPER',
        canceledAt: new Date(),
        canceledBy: 'DEVELOPER',
      },
      include: {
        projectRequest: {
          include: {
            user: {
              select: { email: true },
            },
          },
        },
        developer: {
          include: {
            user: {
              select: { email: true },
            },
          },
        },
      },
    });

    return this.mapQuoteShare(updated, 'developer', false);
  }
}
