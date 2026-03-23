// [H5] 수정 필요: Line 110, 146에서 BadRequestException('Unauthorized access to document')을 던지고 있음 — 권한 없음은 ForbiddenException으로 변경해야 함.
import { Injectable, Logger, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { Queue } from 'bullmq';
import { InjectQueue } from '@nestjs/bullmq';
import { PrismaService } from '../../common/db/prisma.service';
import { generateRequirementsDocument } from '../../common/utils/document-generator';
import { PricingService } from '../pricing/pricing.service';
import type { RequirementsDocument } from '../../types/requirements-document';

@Injectable()
export class DocumentsService {
  private readonly logger = new Logger(DocumentsService.name);

  constructor(
    private prisma: PrismaService,
    private pricingService: PricingService,
    @InjectQueue('pdf-generation') private pdfQueue: Queue,
  ) {}

  async generateDocument(projectRequestId: string): Promise<{ documentId: string; version: number }> {
    this.logger.log(`Generating document for project: ${projectRequestId}`);

    const projectRequest = await this.prisma.projectRequest.findUnique({
      where: { id: projectRequestId },
    });

    if (!projectRequest) {
      throw new NotFoundException(`Project request not found: ${projectRequestId}`);
    }

    if (!projectRequest.normalizedSpec) {
      throw new BadRequestException('Project request does not have normalized spec');
    }

    const normalizedSpec = projectRequest.normalizedSpec as any;
    let costEstimate = projectRequest.costEstimate as any;

    // Calculate cost if not already done
    if (!costEstimate) {
      costEstimate = await this.pricingService.calculateCost(normalizedSpec);
    }

    // Generate requirements document
    const requirementsDocument: RequirementsDocument = generateRequirementsDocument(
      normalizedSpec,
      costEstimate,
      projectRequest.rawAnswers as any,
    );

    // Get the next version number
    const existingDocs = await this.prisma.requirementDocument.findMany({
      where: { projectRequestId },
      select: { version: true },
    });

    const nextVersion = existingDocs.length > 0 ? Math.max(...existingDocs.map((d) => d.version)) + 1 : 1;

    // Store JSON document in DB
    const document = await this.prisma.requirementDocument.create({
      data: {
        projectRequestId,
        version: nextVersion,
        format: 'json',
        snapshotJson: requirementsDocument as any,
      },
    });

    // Enqueue PDF generation job
    await this.pdfQueue.add(
      'generate-pdf',
      {
        documentId: document.id,
        projectRequestId,
        documentVersion: nextVersion,
      },
      {
        jobId: `pdf-${document.id}`,
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
      },
    );

    this.logger.log(`Document ${document.id} created, PDF generation queued`);

    return {
      documentId: document.id,
      version: nextVersion,
    };
  }

  async getDocumentById(documentId: string, userId?: string): Promise<any> {
    const document = await this.prisma.requirementDocument.findUnique({
      where: { id: documentId },
      include: {
        projectRequest: {
          select: { userId: true },
        },
      },
    });

    if (!document) {
      throw new NotFoundException(`Document not found: ${documentId}`);
    }

    // Auth check if userId provided
    if (userId && document.projectRequest.userId !== userId) {
      throw new ForbiddenException('Unauthorized access to document');
    }

    return {
      id: document.id,
      projectRequestId: document.projectRequestId,
      version: document.version,
      format: document.format,
      content: document.snapshotJson,
      storageUrl: document.storageUrl,
      generatedAt: document.generatedAt.toISOString(),
    };
  }

  async listDocuments(
    projectRequestId: string,
    userId?: string,
  ): Promise<
    Array<{
      id: string;
      version: number;
      format: string;
      storageUrl: string | null;
      generatedAt: string;
    }>
  > {
    const projectRequest = await this.prisma.projectRequest.findUnique({
      where: { id: projectRequestId },
    });

    if (!projectRequest) {
      throw new NotFoundException(`Project request not found: ${projectRequestId}`);
    }

    // Auth check
    if (userId && projectRequest.userId !== userId) {
      throw new ForbiddenException('Unauthorized access to project');
    }

    const documents = await this.prisma.requirementDocument.findMany({
      where: { projectRequestId },
      orderBy: { generatedAt: 'desc' },
    });

    return documents.map((doc) => ({
      id: doc.id,
      version: doc.version,
      format: doc.format,
      storageUrl: doc.storageUrl,
      generatedAt: doc.generatedAt.toISOString(),
    }));
  }

  async updateDocumentStatus(documentId: string, storageUrl: string): Promise<void> {
    await this.prisma.requirementDocument.update({
      where: { id: documentId },
      data: { storageUrl },
    });

    this.logger.log(`Document ${documentId} updated with storage URL`);
  }

  async getDocumentContent(documentId: string): Promise<RequirementsDocument> {
    const document = await this.prisma.requirementDocument.findUnique({
      where: { id: documentId },
    });

    if (!document) {
      throw new NotFoundException(`Document not found: ${documentId}`);
    }

    return document.snapshotJson as unknown as RequirementsDocument;
  }
}
