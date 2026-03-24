import { Injectable, Logger } from '@nestjs/common';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { PrismaService } from '../../../common/db/prisma.service';
import { StorageService } from '../../../common/storage/storage.service';
import type { RequirementsDocument } from '../../../types/requirements-document';

interface PdfJobData {
  documentId: string;
  projectRequestId: string;
  documentVersion: number;
}

@Processor('pdf-generation')
@Injectable()
export class PdfProcessor extends WorkerHost {
  private readonly logger = new Logger(PdfProcessor.name);

  constructor(
    private prisma: PrismaService,
    private storageService: StorageService,
  ) {
    super();
  }

  async process(job: Job<PdfJobData>): Promise<void> {
    const { documentId, projectRequestId, documentVersion } = job.data;
    this.logger.log(`Processing PDF generation for document: ${documentId}`);

    try {
      // Fetch the requirement document
      const document = await this.prisma.requirementDocument.findUnique({
        where: { id: documentId },
      });

      if (!document) {
        throw new Error(`Document not found: ${documentId}`);
      }

      const requirementDoc = document.snapshotJson as any as RequirementsDocument;

      // Generate PDF content (using a simple text-based approach for now)
      // In production, you'd use puppeteer or @react-pdf/renderer
      const pdfContent = this.generatePdfContent(requirementDoc);

      // Upload to S3
      const key = `documents/${projectRequestId}/requirement-v${documentVersion}.pdf`;
      await this.storageService.uploadFile(key, pdfContent, 'application/pdf');

      // Get signed URL
      const signedUrl = await this.storageService.getSignedUrl(key);

      // Update document with storage URL
      await this.prisma.requirementDocument.update({
        where: { id: documentId },
        data: {
          storageUrl: signedUrl,
        },
      });

      this.logger.log(`PDF generated and uploaded for document: ${documentId}`);
    } catch (error) {
      this.logger.error(`Failed to process PDF for document ${documentId}`, error);
      throw error;
    }
  }

  private generatePdfContent(doc: RequirementsDocument): Buffer {
    // Simple text-based PDF generation
    // In production, use puppeteer or @react-pdf/renderer for proper PDF
    let content = '';

    content += `# ${doc.clientInfo.projectName || 'Project'}\n\n`;

    content += `## 프로젝트 개요\n`;
    content += `- 사이트 유형: ${doc.projectOverview.siteType}\n`;
    content += `- 설명: ${doc.projectOverview.description}\n`;
    content += `- 타겟 오디언스: ${doc.projectOverview.targetAudience}\n\n`;

    content += `## 범위\n`;
    content += `### 페이지\n`;
    doc.scopeOfWork.pages.forEach((page: any) => {
      content += `- ${page.name}: ${page.description}\n`;
    });

    content += `\n### 기능\n`;
    doc.scopeOfWork.features.forEach((feature: any) => {
      content += `- ${feature.name}: ${feature.description}\n`;
    });

    if (doc.scopeOfWork.integrations.length > 0) {
      content += `\n### 통합\n`;
      doc.scopeOfWork.integrations.forEach((integration: any) => {
        content += `- ${integration}\n`;
      });
    }

    content += `\n## 디자인\n`;
    content += `- 복잡도: ${doc.designRequirements.complexity}\n`;
    content += `- 스타일: ${doc.designRequirements.style}\n`;
    content += `- 반응형 대상: ${doc.designRequirements.responsiveTargets.join(', ')}\n\n`;

    content += `## 타임라인\n`;
    content += `- 긴급도: ${doc.timeline.urgency}\n`;
    content += `- 예상 기간: ${doc.timeline.estimatedWeeks.min} ~ ${doc.timeline.estimatedWeeks.max}주\n\n`;

    content += `## 비용 견적\n`;
    content += `- 기본: ${doc.costEstimate.baseTier.minCost.toLocaleString()} ~ ${doc.costEstimate.baseTier.maxCost.toLocaleString()} KRW\n`;
    content += `- 최종: ${doc.costEstimate.totalMin.toLocaleString()} ~ ${doc.costEstimate.totalMax.toLocaleString()} KRW\n`;
    content += `- 디자인 승수: ${doc.costEstimate.designMultiplier}\n`;
    content += `- 타임라인 승수: ${doc.costEstimate.timelineMultiplier}\n\n`;

    content += `## 참고\n`;
    content += doc.additionalNotes;

    // Convert to Buffer (in production, use actual PDF generation)
    return Buffer.from(content, 'utf-8');
  }
}
