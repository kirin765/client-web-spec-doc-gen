// [수정필요 C7] submit()에서 costEstimate를 계산하지 않음. PricingService를 주입하고 저장 전 calculateCost() 호출 필요.
// [수정필요 H14] rawAnswers 병합 시 Prisma JsonValue에 spread 연산자 사용 — 타입 단언(as Record) 필요.
// [수정필요 M3] rawAnswers spread 타입 안전성 문제 — H14와 동일하게 타입 단언 적용 필요.
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../common/db/prisma.service';
import { CreateDraftDto, UpdateAnswersDto, SubmitProjectRequestDto } from './dto';
import { normalizeAnswers, validateNormalizedSpec } from '../../common/utils/normalizer';
import { PricingService } from '../pricing/pricing.service';
import { DocumentsService } from '../documents/documents.service';
import { MatchingService } from '../matching/matching.service';
import { NotificationsService } from '../notifications/notifications.service';
import { normalizeEnumToApi } from '../../common/utils/enum-normalizer';

type JsonRecord = Record<string, unknown>;

@Injectable()
export class ProjectRequestsService {
  constructor(
    private prisma: PrismaService,
    private pricingService: PricingService,
    private documentsService: DocumentsService,
    private matchingService: MatchingService,
    private notificationsService: NotificationsService,
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

    return this.mapProjectRequest(projectRequest);
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

    const existingRawAnswers = this.asJsonRecord(projectRequest.rawAnswers);

    const updated = await this.prisma.projectRequest.update({
      where: { id: projectRequestId },
      data: {
        rawAnswers: {
          ...existingRawAnswers,
          ...dto.rawAnswers,
        },
      },
    });

    return this.mapProjectRequest(updated);
  }

  async submit(
    projectRequestId: string,
    userId: string,
    dto: SubmitProjectRequestDto,
  ): Promise<any> {
    const projectRequest = await this.getById(projectRequestId, userId, false);

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

    // Calculate cost estimate
    const costEstimate = await this.pricingService.calculateCost(normalizedSpec);

    await this.prisma.projectRequest.update({
      where: { id: projectRequestId },
      data: {
        rawAnswers: dto.rawAnswers,
        normalizedSpec: normalizedSpec as any,
        costEstimate: costEstimate as any,
        siteType: normalizedSpec.projectType,
        status: 'SUBMITTED',
        submittedAt: new Date(),
        pricingVersion: costEstimate.pricingVersion,
      },
    });

    await this.documentsService.generateDocument(projectRequestId);
    await this.matchingService.executeMatching(projectRequestId);

    const notificationEmail = await this.resolveNotificationEmail(userId, dto.rawAnswers);
    if (notificationEmail) {
      await this.notificationsService.sendQuoteCompletedEmail(
        notificationEmail,
        projectRequestId,
      );
    }

    return this.getDetail(projectRequestId, userId);
  }

  async getById(
    projectRequestId: string,
    userId?: string,
    mapResult = true,
  ): Promise<any> {
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

    return mapResult ? this.mapProjectRequest(projectRequest) : projectRequest;
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
      data: data.map((projectRequest) => this.mapProjectRequest(projectRequest)),
      total,
      pageSize,
      page,
    };
  }

  async getDetail(projectRequestId: string, userId: string): Promise<any> {
    const projectRequest = await this.getById(projectRequestId, userId, false);

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
      ...this.mapProjectRequest(projectRequest),
      documents: documents.map((document) => ({
        ...document,
        generatedAt: document.generatedAt.toISOString(),
      })),
      matches: matches.map((match) => ({
        ...match,
        developerName: match.developer.displayName,
        status: normalizeEnumToApi(match.status),
        createdAt: this.toIsoString(match.createdAt),
        developer: {
          ...match.developer,
          type: normalizeEnumToApi(match.developer.type),
          availabilityStatus: normalizeEnumToApi(
            match.developer.availabilityStatus,
          ),
          createdAt: this.toIsoString(match.developer.createdAt),
          updatedAt: this.toIsoString(match.developer.updatedAt),
        },
      })),
    };
  }

  private asJsonRecord(value: unknown): JsonRecord {
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      return value as JsonRecord;
    }

    return {};
  }

  private mapProjectRequest(projectRequest: any) {
    return {
      ...projectRequest,
      status: normalizeEnumToApi(projectRequest.status),
      createdAt: this.toIsoString(projectRequest.createdAt),
      updatedAt: this.toIsoString(projectRequest.updatedAt),
      submittedAt: this.toIsoString(projectRequest.submittedAt),
    };
  }

  private toIsoString(value: unknown): string | null {
    if (!value) {
      return null;
    }

    if (value instanceof Date) {
      return value.toISOString();
    }

    return typeof value === 'string' ? value : null;
  }

  private async resolveNotificationEmail(
    userId: string,
    rawAnswers: JsonRecord,
  ): Promise<string | null> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { email: true },
    });

    if (user?.email) {
      return user.email;
    }

    const contactEmail = rawAnswers.contactEmail;
    return typeof contactEmail === 'string' && contactEmail.trim()
      ? contactEmail
      : null;
  }
}
