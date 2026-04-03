import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../common/db/prisma.service';
import { normalizeEnumToApi } from '../../common/utils/enum-normalizer';

const roomInclude = {
  quoteShare: {
    include: {
      projectRequest: {
        select: {
          id: true,
          projectName: true,
          siteType: true,
          status: true,
        },
      },
      developer: {
        select: {
          id: true,
          displayName: true,
          headline: true,
        },
      },
    },
  },
  messages: {
    where: {
      deletedAt: null as Date | null,
    },
    orderBy: [{ createdAt: 'desc' as const }],
    take: 1,
  },
  participantStates: true,
};

@Injectable()
export class ChatService {
  constructor(private prisma: PrismaService) {}

  private async getAccessibleRoom(roomId: string, userId: string) {
    const room = await this.prisma.chatRoom.findUnique({
      where: { id: roomId },
      include: roomInclude,
    });

    if (!room) {
      throw new NotFoundException('Chat room not found');
    }

    if (room.customerUserId !== userId && room.developerUserId !== userId) {
      throw new ForbiddenException('You do not have access to this chat room');
    }

    return room;
  }

  private canSendMessage(room: any) {
    return room.status === 'OPEN' && !String(room.quoteShare.status).startsWith('CANCELED_');
  }

  private mapMessage(message: any, userId: string) {
    return {
      id: message.id,
      roomId: message.roomId,
      senderUserId: message.senderUserId ?? null,
      senderRole: normalizeEnumToApi(message.senderRole),
      type: normalizeEnumToApi(message.type),
      body: message.body,
      createdAt: message.createdAt.toISOString(),
      editedAt: message.editedAt?.toISOString() ?? null,
      deletedAt: message.deletedAt?.toISOString() ?? null,
      isMine: message.senderUserId === userId,
    };
  }

  private async getUnreadCount(roomId: string, userId: string, lastReadAt: Date | null) {
    return this.prisma.chatMessage.count({
      where: {
        roomId,
        deletedAt: null,
        senderUserId: {
          not: userId,
        },
        createdAt: lastReadAt ? { gt: lastReadAt } : undefined,
      },
    });
  }

  private async mapRoom(room: any, userId: string) {
    const participantState = room.participantStates.find((item: any) => item.userId === userId) ?? null;
    const counterparty =
      room.customerUserId === userId
        ? {
            userId: room.developerUserId,
            role: 'developer',
            displayName: room.quoteShare.developer?.displayName ?? '전문가',
            headline: room.quoteShare.developer?.headline ?? '',
          }
        : {
            userId: room.customerUserId,
            role: 'customer',
            displayName: '고객',
            headline: room.quoteShare.projectRequest?.projectName ?? '',
          };

    const unreadCount = await this.getUnreadCount(
      room.id,
      userId,
      participantState?.lastReadAt ?? null,
    );
    const lastMessage = room.messages[0] ? this.mapMessage(room.messages[0], userId) : null;

    return {
      id: room.id,
      quoteShareId: room.quoteShareId,
      status: normalizeEnumToApi(room.status),
      canSendMessage: this.canSendMessage(room),
      unreadCount,
      updatedAt: room.updatedAt.toISOString(),
      lastMessageAt: room.lastMessageAt?.toISOString() ?? lastMessage?.createdAt ?? null,
      projectRequest: room.quoteShare.projectRequest
        ? {
            id: room.quoteShare.projectRequest.id,
            projectName: room.quoteShare.projectRequest.projectName ?? null,
            siteType: room.quoteShare.projectRequest.siteType ?? null,
            status: normalizeEnumToApi(room.quoteShare.projectRequest.status),
          }
        : null,
      quoteShare: {
        id: room.quoteShare.id,
        status: normalizeEnumToApi(room.quoteShare.status),
      },
      counterparty,
      lastMessage,
      participantState: participantState
        ? {
            lastReadMessageId: participantState.lastReadMessageId ?? null,
            lastReadAt: participantState.lastReadAt?.toISOString() ?? null,
          }
        : {
            lastReadMessageId: null,
            lastReadAt: null,
          },
    };
  }

  async listRooms(userId: string) {
    const rooms = await this.prisma.chatRoom.findMany({
      where: {
        OR: [{ customerUserId: userId }, { developerUserId: userId }],
      },
      include: roomInclude,
      orderBy: [{ lastMessageAt: 'desc' }, { updatedAt: 'desc' }],
    });

    return Promise.all(rooms.map((room) => this.mapRoom(room, userId)));
  }

  async getRoom(roomId: string, userId: string) {
    const room = await this.getAccessibleRoom(roomId, userId);
    return this.mapRoom(room, userId);
  }

  async listMessages(roomId: string, userId: string, cursor?: string) {
    await this.getAccessibleRoom(roomId, userId);

    const messages = await this.prisma.chatMessage.findMany({
      where: {
        roomId,
        deletedAt: null,
        createdAt: cursor ? { lt: new Date(cursor) } : undefined,
      },
      orderBy: [{ createdAt: 'desc' }],
      take: 50,
    });

    return {
      data: messages.reverse().map((message) => this.mapMessage(message, userId)),
      nextCursor:
        messages.length === 50 ? messages[messages.length - 1]?.createdAt.toISOString() ?? null : null,
    };
  }

  async createMessage(roomId: string, userId: string, body: string) {
    const room = await this.getAccessibleRoom(roomId, userId);

    if (!this.canSendMessage(room)) {
      throw new BadRequestException('This chat room is read-only');
    }

    const trimmedBody = body.trim();
    if (!trimmedBody) {
      throw new BadRequestException('Message body is required');
    }

    const senderRole = room.customerUserId === userId ? 'CUSTOMER' : 'DEVELOPER';

    const message = await this.prisma.$transaction(async (tx) => {
      const created = await tx.chatMessage.create({
        data: {
          roomId: room.id,
          senderUserId: userId,
          senderRole,
          type: 'TEXT',
          body: trimmedBody,
        },
      });

      await tx.chatRoom.update({
        where: { id: room.id },
        data: {
          lastMessageAt: created.createdAt,
          status: room.status === 'ARCHIVED' ? 'OPEN' : room.status,
        },
      });

      return created;
    });

    return this.mapMessage(message, userId);
  }

  async markRead(roomId: string, userId: string, lastReadMessageId?: string) {
    const room = await this.getAccessibleRoom(roomId, userId);

    let targetTimestamp = new Date();

    if (lastReadMessageId) {
      const message = await this.prisma.chatMessage.findFirst({
        where: {
          id: lastReadMessageId,
          roomId,
          deletedAt: null,
        },
      });

      if (!message) {
        throw new NotFoundException('Chat message not found');
      }

      targetTimestamp = message.createdAt;
    } else {
      const latestMessage = await this.prisma.chatMessage.findFirst({
        where: {
          roomId,
          deletedAt: null,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      if (latestMessage) {
        targetTimestamp = latestMessage.createdAt;
        lastReadMessageId = latestMessage.id;
      }
    }

    await this.prisma.chatParticipantState.upsert({
      where: {
        roomId_userId: {
          roomId,
          userId,
        },
      },
      update: {
        lastReadMessageId: lastReadMessageId ?? null,
        lastReadAt: targetTimestamp,
      },
      create: {
        roomId,
        userId,
        lastReadMessageId: lastReadMessageId ?? null,
        lastReadAt: targetTimestamp,
      },
    });

    return { success: true };
  }
}
