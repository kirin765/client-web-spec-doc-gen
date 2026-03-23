import { Injectable, Logger } from '@nestjs/common';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import * as fs from 'fs';
import * as path from 'path';
import PDFDocument from 'pdfkit';
import { PrismaService } from '../../../common/db/prisma.service';
import { StorageService } from '../../../common/storage/storage.service';
import type { RequirementsDocument } from '../../../types/requirements-document';

interface PdfJobData {
  documentId: string;
  projectRequestId: string;
  documentVersion: number;
}

type PdfDocumentInstance = InstanceType<typeof PDFDocument>;

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
      const document = await this.prisma.requirementDocument.findUnique({
        where: { id: documentId },
      });

      if (!document) {
        throw new Error(`Document not found: ${documentId}`);
      }

      const requirementDoc = document.snapshotJson as unknown as RequirementsDocument;
      const pdfContent = await this.generatePdfContent(requirementDoc);

      const key = `documents/${projectRequestId}/requirement-v${documentVersion}.pdf`;
      await this.storageService.uploadFile(key, pdfContent, 'application/pdf');

      const signedUrl = await this.storageService.getSignedUrl(key);

      await this.prisma.requirementDocument.update({
        where: { id: documentId },
        data: {
          storageUrl: signedUrl,
          format: 'pdf',
        },
      });

      this.logger.log(`PDF generated and uploaded for document: ${documentId}`);
    } catch (error) {
      this.logger.error(`Failed to process PDF for document ${documentId}`, error);
      throw error;
    }
  }

  private async generatePdfContent(doc: RequirementsDocument): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const pdf = new PDFDocument({
        size: 'A4',
        margin: 50,
        info: {
          Title: doc.clientInfo.projectName || 'Requirement Document',
          Author: 'Spec Doc Generator',
        },
      });
      const chunks: Buffer[] = [];

      pdf.on('data', (chunk) => {
        chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
      });
      pdf.on('end', () => resolve(Buffer.concat(chunks)));
      pdf.on('error', reject);

      const regularFontPath = this.resolveFontPath('NotoSansKR-Regular.ttf');
      const boldFontPath = this.resolveFontPath('NotoSansKR-Bold.ttf');
      const regularFontName = regularFontPath ? 'NotoSansKR' : 'Helvetica';
      const boldFontName = boldFontPath ? 'NotoSansKRBold' : 'Helvetica-Bold';

      if (regularFontPath) {
        pdf.registerFont(regularFontName, regularFontPath);
      }
      if (boldFontPath) {
        pdf.registerFont(boldFontName, boldFontPath);
      }

      pdf.font(boldFontName).fontSize(22).text(doc.clientInfo.projectName || 'Project');
      pdf.moveDown(0.25);
      pdf.font(regularFontName).fontSize(10).fillColor('#666').text(`생성일: ${new Date(doc.generatedAt).toLocaleString('ko-KR')}`);
      this.writeDivider(pdf);

      this.writeSectionTitle(pdf, '프로젝트 개요', boldFontName);
      this.writeKeyValue(pdf, '사이트 유형', doc.projectOverview.siteType, regularFontName, boldFontName);
      this.writeKeyValue(pdf, '설명', doc.projectOverview.description, regularFontName, boldFontName);
      this.writeKeyValue(pdf, '타겟 오디언스', doc.projectOverview.targetAudience, regularFontName, boldFontName);

      this.writeSectionTitle(pdf, '작업 범위', boldFontName);
      this.writeSubsectionTitle(pdf, `페이지 (${doc.scopeOfWork.pages.length}개)`, boldFontName);
      this.writeBulletList(
        pdf,
        doc.scopeOfWork.pages.map((page) => `${page.name}: ${page.description}`),
        regularFontName,
      );
      this.writeSubsectionTitle(pdf, `기능 (${doc.scopeOfWork.features.length}개)`, boldFontName);
      this.writeBulletList(
        pdf,
        doc.scopeOfWork.features.map((feature) => `${feature.name}: ${feature.description}`),
        regularFontName,
      );
      if (doc.scopeOfWork.integrations.length > 0) {
        this.writeSubsectionTitle(pdf, '외부 연동', boldFontName);
        this.writeBulletList(pdf, doc.scopeOfWork.integrations, regularFontName);
      }

      this.writeSectionTitle(pdf, '디자인 요구사항', boldFontName);
      this.writeKeyValue(pdf, '복잡도', doc.designRequirements.complexity, regularFontName, boldFontName);
      this.writeKeyValue(pdf, '스타일', doc.designRequirements.style, regularFontName, boldFontName);
      this.writeKeyValue(
        pdf,
        '반응형 대상',
        doc.designRequirements.responsiveTargets.join(', '),
        regularFontName,
        boldFontName,
      );

      this.writeSectionTitle(pdf, '일정', boldFontName);
      this.writeKeyValue(pdf, '긴급도', doc.timeline.urgency, regularFontName, boldFontName);
      this.writeKeyValue(
        pdf,
        '예상 기간',
        `${doc.timeline.estimatedWeeks.min}주 ~ ${doc.timeline.estimatedWeeks.max}주`,
        regularFontName,
        boldFontName,
      );

      this.writeSectionTitle(pdf, '비용 견적', boldFontName);
      this.writeKeyValue(
        pdf,
        '기본 비용',
        `${this.formatCurrency(doc.costEstimate.baseTier.minCost)} ~ ${this.formatCurrency(doc.costEstimate.baseTier.maxCost)}`,
        regularFontName,
        boldFontName,
      );
      this.writeKeyValue(
        pdf,
        '디자인 승수',
        `${doc.costEstimate.designMultiplier}x`,
        regularFontName,
        boldFontName,
      );
      this.writeKeyValue(
        pdf,
        '타임라인 승수',
        `${doc.costEstimate.timelineMultiplier}x`,
        regularFontName,
        boldFontName,
      );
      this.writeKeyValue(
        pdf,
        '최종 비용',
        `${this.formatCurrency(doc.costEstimate.totalMin)} ~ ${this.formatCurrency(doc.costEstimate.totalMax)}`,
        regularFontName,
        boldFontName,
      );

      if (doc.additionalNotes) {
        this.writeSectionTitle(pdf, '추가 사항', boldFontName);
        pdf.font(regularFontName).fontSize(10).fillColor('#222').text(doc.additionalNotes);
      }

      pdf.moveDown(1.5);
      this.writeDivider(pdf);
      pdf
        .font(regularFontName)
        .fontSize(9)
        .fillColor('#666')
        .text(`© ${new Date().getFullYear()} 프로젝트 문서 생성 시스템`);

      pdf.end();
    });
  }

  private resolveFontPath(fileName: string): string | null {
    const candidates = [
      path.resolve(process.cwd(), 'public/fonts', fileName),
      path.resolve(process.cwd(), '../public/fonts', fileName),
      path.resolve(__dirname, '../../../../../public/fonts', fileName),
      path.resolve(__dirname, '../../../../../../public/fonts', fileName),
    ];

    for (const candidate of candidates) {
      if (fs.existsSync(candidate)) {
        return candidate;
      }
    }

    return null;
  }

  private writeDivider(pdf: PdfDocumentInstance) {
    pdf.moveDown(0.5);
    pdf
      .strokeColor('#d1d5db')
      .lineWidth(1)
      .moveTo(pdf.page.margins.left, pdf.y)
      .lineTo(pdf.page.width - pdf.page.margins.right, pdf.y)
      .stroke();
    pdf.moveDown(0.75);
  }

  private writeSectionTitle(
    pdf: PdfDocumentInstance,
    title: string,
    boldFontName: string,
  ) {
    pdf.font(boldFontName).fontSize(16).fillColor('#111').text(title);
    pdf.moveDown(0.3);
  }

  private writeSubsectionTitle(
    pdf: PdfDocumentInstance,
    title: string,
    boldFontName: string,
  ) {
    pdf.font(boldFontName).fontSize(12).fillColor('#222').text(title);
    pdf.moveDown(0.2);
  }

  private writeKeyValue(
    pdf: PdfDocumentInstance,
    label: string,
    value: string,
    regularFontName: string,
    boldFontName: string,
  ) {
    pdf.font(boldFontName).fontSize(10).fillColor('#111').text(`${label}: `, {
      continued: true,
    });
    pdf.font(regularFontName).fontSize(10).fillColor('#222').text(value || '-');
    pdf.moveDown(0.1);
  }

  private writeBulletList(
    pdf: PdfDocumentInstance,
    items: string[],
    regularFontName: string,
  ) {
    if (items.length === 0) {
      pdf.font(regularFontName).fontSize(10).fillColor('#222').text('• 없음');
      pdf.moveDown(0.2);
      return;
    }

    items.forEach((item) => {
      pdf.font(regularFontName).fontSize(10).fillColor('#222').text(`• ${item}`);
    });
    pdf.moveDown(0.2);
  }

  private formatCurrency(amount: number): string {
    return `${amount.toLocaleString('ko-KR')} KRW`;
  }
}
