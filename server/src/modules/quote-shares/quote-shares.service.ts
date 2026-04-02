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

const quoteShareInclude = {
  review: {
    select: { id: true },
  },
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
  chatRoom: {
    select: {
      id: true,
      status: true,
    },
  },
} as const;

@Injectable()
export class QuoteSharesService {
  constructor(private prisma: PrismaService) {}

  private async ensureChatRoom(quoteShareId: string) {
    const quoteShare = await this.prisma.quoteShare.findUnique({
      where: { id: quoteShareId },
      include: {
        projectRequest: {
          select: { userId: true },
        },
        developer: {
          select: { userId: true },
        },
        chatRoom: {
          select: { id: true },
        },
      },
    });

    if (!quoteShare?.projectRequest.userId || !quoteShare.developer.userId) {
      return null;
    }

    const room =
      quoteShare.chatRoom ??
      (await this.prisma.chatRoom.create({
        data: {
          quoteShareId,
          customerUserId: quoteShare.projectRequest.userId,
          developerUserId: quoteShare.developer.userId,
          participantStates: {
            create: [{ userId: quoteShare.projectRequest.userId }, { userId: quoteShare.developer.userId }],
          },
        },
      }));

    return room;
  }

  private async addSystemMessage(quoteShareId: string, body: string, status?: 'OPEN' | 'CLOSED' | 'ARCHIVED') {
    const room = await this.ensureChatRoom(quoteShareId);

    if (!room) {
      return;
    }

    const created = await this.prisma.chatMessage.create({
      data: {
        roomId: room.id,
        senderRole: 'SYSTEM',
        type: 'SYSTEM',
        body,
      },
    });

    await this.prisma.chatRoom.update({
      where: { id: room.id },
      data: {
        status,
        lastMessageAt: created.createdAt,
      },
    });
  }

  private shouldRevealContact(status: string) {
    return status === 'IN_PROGRESS' || status === 'COMPLETED';
  }

  private mapQuoteShare(
    quoteShare: any,
    actor: Actor,
    includeCounterpartyEmail: boolean,
  ) {
    const canRevealContact = this.shouldRevealContact(quoteShare.status);
    const reviewId = quoteShare.review?.id ?? null;
    const counterpartyEmail =
      canRevealContact && includeCounterpartyEmail
        ? actor === 'user'
          ? quoteShare.developer?.user?.email ?? null
          : quoteShare.projectRequest?.user?.email ?? null
        : null;
    const contactMethod =
      actor === 'user' || canRevealContact
        ? quoteShare.projectRequest?.contactMethod ?? null
        : null;

    return {
      id: quoteShare.id,
      projectRequestId: quoteShare.projectRequestId,
      developerId: quoteShare.developerId,
      status: normalizeEnumToApi(quoteShare.status),
      startedAt: quoteShare.startedAt?.toISOString() ?? null,
      completedAt: quoteShare.completedAt?.toISOString() ?? null,
      canceledAt: quoteShare.canceledAt?.toISOString() ?? null,
      canceledBy: quoteShare.canceledBy
        ? normalizeEnumToApi(quoteShare.canceledBy)
        : null,
      createdAt: quoteShare.createdAt.toISOString(),
      updatedAt: quoteShare.updatedAt.toISOString(),
      canOpenContact: canRevealContact,
      canComplete: actor === 'developer' && quoteShare.status === 'IN_PROGRESS',
      canReview:
        actor === 'user' &&
        quoteShare.status === 'COMPLETED' &&
        reviewId === null,
      canChat: Boolean(quoteShare.chatRoom?.id) && !String(quoteShare.status).startsWith('CANCELED_'),
      chatRoomId: quoteShare.chatRoom?.id ?? null,
      reviewId,
      contactMethod,
      counterpartyEmail,
      projectRequest: quoteShare.projectRequest
        ? {
            id: quoteShare.projectRequest.id,
            projectName: quoteShare.projectRequest.projectName ?? null,
            siteType: quoteShare.projectRequest.siteType ?? null,
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
      throw new BadRequestException(
        'Cannot share a quote to your own developer profile',
      );
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
      include: quoteShareInclude,
    });

    await this.addSystemMessage(created.id, '고객이 견적 상담을 시작했습니다.');

    const withRoom = await this.prisma.quoteShare.findUnique({
      where: { id: created.id },
      include: quoteShareInclude,
    });

    return this.mapQuoteShare(withRoom ?? created, 'user', false);
  }

  async listSentByUser(userId: string) {
    const list = await this.prisma.quoteShare.findMany({
      where: {
        projectRequest: {
          userId,
        },
      },
      include: quoteShareInclude,
      orderBy: [{ updatedAt: 'desc' }, { createdAt: 'desc' }],
    });

    return list.map((item) => this.mapQuoteShare(item, 'user', false));
  }

  async listInboxByDeveloper(userId: string) {
    const developer = await this.getDeveloperByUserId(userId);

    const list = await this.prisma.quoteShare.findMany({
      where: {
        developerId: developer.id,
      },
      include: quoteShareInclude,
      orderBy: [{ updatedAt: 'desc' }, { createdAt: 'desc' }],
    });

    return list.map((item) => this.mapQuoteShare(item, 'developer', false));
  }

  async getDetail(id: string, userId: string) {
    const quoteShare = await this.prisma.quoteShare.findUnique({
      where: { id },
      include: quoteShareInclude,
    });

    if (!quoteShare) {
      throw new NotFoundException('Quote share not found');
    }

    const isOwner = quoteShare.projectRequest?.userId === userId;
    const isDeveloper = quoteShare.developer?.userId === userId;

    if (!isOwner && !isDeveloper) {
      throw new ForbiddenException('You do not have access to this quote share');
    }

    return this.mapQuoteShare(quoteShare, isOwner ? 'user' : 'developer', true);
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
      throw new ForbiddenException(
        'Cannot cancel another user\'s quote share',
      );
    }

    if (quoteShare.status !== 'SENT') {
      throw new BadRequestException('Only sent quote shares can be canceled');
    }

    const updated = await this.prisma.quoteShare.update({
      where: { id },
      data: {
        status: 'CANCELED_BY_USER',
        canceledAt: new Date(),
        canceledBy: 'USER',
      },
      include: quoteShareInclude,
    });

    await this.addSystemMessage(updated.id, '고객이 상담 요청을 취소했습니다.', 'CLOSED');

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
      throw new ForbiddenException(
        'Cannot approve another developer\'s quote share',
      );
    }

    if (quoteShare.status !== 'SENT') {
      throw new BadRequestException('Only sent quote shares can be started');
    }

    const updated = await this.prisma.quoteShare.update({
      where: { id },
      data: {
        status: 'IN_PROGRESS',
        startedAt: new Date(),
        completedAt: null,
        canceledAt: null,
        canceledBy: null,
      },
      include: quoteShareInclude,
    });

    await this.addSystemMessage(updated.id, '개발자가 상담 진행을 수락했습니다.', 'OPEN');

    return this.mapQuoteShare(updated, 'developer', false);
  }

  async completeByDeveloper(id: string, userId: string) {
    const developer = await this.getDeveloperByUserId(userId);
    const quoteShare = await this.prisma.quoteShare.findUnique({
      where: { id },
    });

    if (!quoteShare) {
      throw new NotFoundException('Quote share not found');
    }

    if (quoteShare.developerId !== developer.id) {
      throw new ForbiddenException(
        'Cannot complete another developer\'s quote share',
      );
    }

    if (quoteShare.status !== 'IN_PROGRESS') {
      throw new BadRequestException(
        'Only in-progress quote shares can be completed',
      );
    }

    const updated = await this.prisma.quoteShare.update({
      where: { id },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
        canceledAt: null,
        canceledBy: null,
      },
      include: quoteShareInclude,
    });

    await this.addSystemMessage(updated.id, '개발자가 상담을 완료 처리했습니다.', 'OPEN');

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
      throw new ForbiddenException(
        'Cannot cancel another developer\'s quote share',
      );
    }

    if (quoteShare.status !== 'SENT') {
      throw new BadRequestException('Only sent quote shares can be canceled');
    }

    const updated = await this.prisma.quoteShare.update({
      where: { id },
      data: {
        status: 'CANCELED_BY_DEVELOPER',
        canceledAt: new Date(),
        canceledBy: 'DEVELOPER',
      },
      include: quoteShareInclude,
    });

    await this.addSystemMessage(updated.id, '개발자가 상담 요청을 거절했습니다.', 'CLOSED');

    return this.mapQuoteShare(updated, 'developer', false);
  }
}
