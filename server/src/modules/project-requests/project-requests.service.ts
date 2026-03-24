// ProjectRequestsService — createDraft, updateAnswers, submit, getById, list, getDetail 구현.
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../common/db/prisma.service';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { CreateDraftDto, UpdateAnswersDto, SubmitProjectRequestDto } from './dto';
import { normalizeAnswers, validateNormalizedSpec } from '../../common/utils/normalizer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ProjectRequestsService {
  constructor(
    private prisma: PrismaService,
    @InjectQueue('email-notification') private emailQueue: Queue,
    @InjectQueue('pdf-generation') private pdfQueue: Queue,
    @InjectQueue('developer-matching') private matchingQueue: Queue,
    private configService: ConfigService,
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
    userId: string,
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
    userId: string,
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
        rawAnswers: dto.rawAnswers,
        normalizedSpec,
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

  async getDetail(projectRequestId: string, userId: string): Promise<any> {
    const projectRequest = await this.getById(projectRequestId, userId);

    const documents = await this.prisma.requirementDocument.findMany({
      where: { projectRequestId },
    });

    const matches = await this.prisma.matchResult.findMany({
      where: { projectRequestId },
      include: {
        developer: true,
      },
    });

    return {
      ...projectRequest,
      documents,
      matches,
    };
  }
}
