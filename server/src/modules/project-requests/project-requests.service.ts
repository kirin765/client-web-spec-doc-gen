// ProjectRequestsService — createDraft, updateAnswers, submit, getById, list, getDetail 구현.
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../common/db/prisma.service';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { CreateDraftDto, UpdateAnswersDto, SubmitProjectRequestDto } from './dto';
import { normalizeAnswers, validateNormalizedSpec } from '../../common/utils/normalizer';

function toPrismaJson(value: unknown): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}

@Injectable()
export class ProjectRequestsService {
  constructor(
    private prisma: PrismaService,
    @InjectQueue('email-notification') private emailQueue: Queue,
    @InjectQueue('pdf-generation') private pdfQueue: Queue,
    @InjectQueue('developer-matching') private matchingQueue: Queue,
  ) {}

  async createDraft(
    userId: string | undefined,
    dto: CreateDraftDto,
  ): Promise<any> {
    const projectRequest = await this.prisma.projectRequest.create({
      data: {
        userId: userId || null,
        projectName: dto.projectName,
        siteType: dto.siteType,
        status: 'DRAFT',
        rawAnswers: {},
      },
    });

    return projectRequest;
  }

  async updateAnswers(
    projectRequestId: string,
    userId: string | undefined,
    dto: UpdateAnswersDto,
  ): Promise<any> {
    const projectRequest = await this.getById(projectRequestId, userId);

    if (projectRequest.status !== 'DRAFT') {
      throw new BadRequestException(
        'Can only update answers in DRAFT status',
      );
    }

    const updated = await this.prisma.projectRequest.update({
      where: { id: projectRequestId },
      data: {
        rawAnswers: {
          ...projectRequest.rawAnswers,
          ...dto.rawAnswers,
        },
      },
    });

    return updated;
  }

  async submit(
    projectRequestId: string,
    userId: string | undefined,
    dto: SubmitProjectRequestDto,
  ): Promise<any> {
    const projectRequest = await this.getById(projectRequestId, userId);

    if (projectRequest.status !== 'DRAFT') {
      throw new BadRequestException('Only DRAFT projects can be submitted');
    }

    // Normalize answers
    const normalizedSpec = normalizeAnswers(dto.rawAnswers);

    const validation = validateNormalizedSpec(normalizedSpec);
    if (!validation.valid) {
      throw new BadRequestException(
        `Invalid answers: ${validation.errors.join(', ')}`,
      );
    }

    // Get current pricing version
    const pricingVersion = await this.prisma.pricingRuleVersion.findFirst({
      where: {
        effectiveFrom: {
          lte: new Date(),
        },
      },
      orderBy: {
        effectiveFrom: 'desc',
      },
    });

    // Update status and prepare for queue jobs
    const updated = await this.prisma.projectRequest.update({
      where: { id: projectRequestId },
      data: {
        rawAnswers: toPrismaJson(dto.rawAnswers),
        normalizedSpec: toPrismaJson(normalizedSpec),
        status: 'SUBMITTED',
        submittedAt: new Date(),
        pricingVersion: pricingVersion?.version,
      },
    });

    await this.pdfQueue.add('generate-pdf', {
      projectRequestId,
    });

    await this.matchingQueue.add('execute-matching', {
      projectRequestId,
      normalizedSpec,
    });

    await this.emailQueue.add('quote-completed', {
      projectRequestId,
    });

    return updated;
  }

  async getById(projectRequestId: string, userId?: string): Promise<any> {
    const projectRequest = await this.prisma.projectRequest.findUnique({
      where: { id: projectRequestId },
    });

    if (!projectRequest) {
      throw new NotFoundException('Project request not found');
    }

    if (userId && projectRequest.userId !== userId) {
      throw new ForbiddenException(
        'You do not have access to this project request',
      );
    }

    return projectRequest;
  }

  async list(
    userId?: string,
    pageSize = 10,
    page = 1,
  ): Promise<{ data: any[]; total: number; pageSize: number; page: number }> {
    const skip = (page - 1) * pageSize;

    const where = userId ? { userId } : {};

    const [data, total] = await Promise.all([
      this.prisma.projectRequest.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize,
      }),
      this.prisma.projectRequest.count({ where }),
    ]);

    return {
      data,
      total,
      pageSize,
      page,
    };
  }

  async getDetail(projectRequestId: string, userId?: string): Promise<any> {
    const projectRequest = await this.getById(projectRequestId, userId);

    const [documents, matches, quoteShareCounts] = await Promise.all([
      this.prisma.requirementDocument.findMany({
        where: { projectRequestId },
      }),
      this.prisma.matchResult.findMany({
        where: { projectRequestId },
        include: {
          developer: true,
        },
      }),
      this.prisma.quoteShare.groupBy({
        by: ['status'],
        where: { projectRequestId },
        _count: {
          _all: true,
        },
      }),
    ]);

    const quoteSharesSummary = {
      sent: 0,
      inProgress: 0,
      completed: 0,
      canceled: 0,
    };

    for (const item of quoteShareCounts) {
      switch (item.status) {
        case 'SENT':
          quoteSharesSummary.sent += item._count._all;
          break;
        case 'IN_PROGRESS':
          quoteSharesSummary.inProgress += item._count._all;
          break;
        case 'COMPLETED':
          quoteSharesSummary.completed += item._count._all;
          break;
        case 'CANCELED_BY_USER':
        case 'CANCELED_BY_DEVELOPER':
          quoteSharesSummary.canceled += item._count._all;
          break;
      }
    }

    return {
      ...projectRequest,
      documents,
      matches,
      quoteSharesSummary,
    };
  }
}
