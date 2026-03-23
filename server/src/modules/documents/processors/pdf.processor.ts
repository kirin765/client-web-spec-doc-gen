// [수정 필요 - C2] PdfProcessor가 WorkerHost를 상속하지 않음
// - @Processor 데코레이터가 동작하려면 WorkerHost를 extends 해야 함 (EmailProcessor 참고)
// - process 메서드도 올바르게 오버라이드해야 함
//
// [수정 필요 - H12] generatePdfContent()가 HTML Buffer를 반환하지만 실제 PDF가 아님
// - 현재 HTML 문자열을 Buffer로 변환할 뿐, 실제 PDF 파일이 생성되지 않음
// - Puppeteer, pdfkit 등 실제 PDF 생성 라이브러리를 사용하여 HTML → PDF 변환 필요
// - S3에 업로드되는 파일이 PDF가 아닌 HTML이므로 클라이언트에서 열 수 없음
import { Injectable, Logger } from '@nestjs/common';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { PrismaService } from '../../../common/db/prisma.service';
import { StorageService } from '../../../common/storage/storage.service';
import type { RequirementsDocument } from '../../../types/requirements-document';

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

  async process(job: Job): Promise<void> {
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

      // Generate PDF content (using HTML-based approach)
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
    // HTML-based PDF content generation.
    // 실제 PDF 변환이 필요한 경우 Puppeteer, pdfkit 등 외부 라이브러리와 함께 사용:
    // - Puppeteer: const browser = await puppeteer.launch(); const pdf = await page.pdf();
    // - pdfkit: const doc = new PDFDocument(); doc.text(...); doc.pipe(...);
    // 현재는 HTML Buffer를 반환하며, 별도의 PDF 변환 도구 설정 필요.
    let html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: 'Segoe UI', Arial, sans-serif; margin: 2cm; line-height: 1.6; color: #333; }
    h1 { border-bottom: 2px solid #007bff; padding-bottom: 10px; margin-top: 30px; }
    h2 { color: #0056b3; margin-top: 25px; margin-bottom: 10px; font-size: 18px; }
    h3 { color: #495057; margin-top: 15px; font-size: 15px; }
    .section { margin-bottom: 20px; }
    .item { margin: 8px 0; }
    .item-name { font-weight: bold; color: #0056b3; }
    .item-desc { margin-left: 20px; color: #555; font-size: 14px; }
    table { width: 100%; border-collapse: collapse; margin: 10px 0; }
    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
    th { background-color: #f8f9fa; font-weight: bold; }
    .cost-row { font-weight: bold; }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <h1>${this.escapeHtml(doc.clientInfo.projectName || 'Project')}</h1>
  
  <div class="section">
    <h2>프로젝트 개요</h2>
    <table>
      <tr><th>항목</th><th>내용</th></tr>
      <tr><td>사이트 유형</td><td>${this.escapeHtml(doc.projectOverview.siteType)}</td></tr>
      <tr><td>설명</td><td>${this.escapeHtml(doc.projectOverview.description)}</td></tr>
      <tr><td>타겟 오디언스</td><td>${this.escapeHtml(doc.projectOverview.targetAudience)}</td></tr>
    </table>
  </div>

  <div class="section">
    <h2>범위</h2>
    
    <h3>페이지 (${doc.scopeOfWork.pages.length}개)</h3>
    <div>${doc.scopeOfWork.pages.map((p: any) => `
      <div class="item">
        <div class="item-name">• ${this.escapeHtml(p.name)}</div>
        <div class="item-desc">${this.escapeHtml(p.description)}</div>
      </div>
    `).join('')}</div>

    <h3>기능 (${doc.scopeOfWork.features.length}개)</h3>
    <div>${doc.scopeOfWork.features.map((f: any) => `
      <div class="item">
        <div class="item-name">• ${this.escapeHtml(f.name)}</div>
        <div class="item-desc">${this.escapeHtml(f.description)}</div>
      </div>
    `).join('')}</div>

    ${doc.scopeOfWork.integrations.length > 0 ? `
    <h3>통합</h3>
    <div>${doc.scopeOfWork.integrations.map((i: any) => `
      <div class="item">• ${this.escapeHtml(i)}</div>
    `).join('')}</div>
    ` : ''}
  </div>

  <div class="section">
    <h2>디자인</h2>
    <table>
      <tr><th>항목</th><th>내용</th></tr>
      <tr><td>복잡도</td><td>${this.escapeHtml(doc.designRequirements.complexity)}</td></tr>
      <tr><td>스타일</td><td>${this.escapeHtml(doc.designRequirements.style)}</td></tr>
      <tr><td>반응형 대상</td><td>${this.escapeHtml(doc.designRequirements.responsiveTargets.join(', '))}</td></tr>
    </table>
  </div>

  <div class="section">
    <h2>일정</h2>
    <table>
      <tr><th>항목</th><th>내용</th></tr>
      <tr><td>긴급도</td><td>${this.escapeHtml(doc.timeline.urgency)}</td></tr>
      <tr><td>예상 기간</td><td>${doc.timeline.estimatedWeeks.min}주 ~ ${doc.timeline.estimatedWeeks.max}주</td></tr>
    </table>
  </div>

  <div class="section">
    <h2>비용 견적</h2>
    <table>
      <tr><th colspan="2">비용 계산</th></tr>
      <tr><td>기본 비용</td><td>${this.formatCurrency(doc.costEstimate.baseTier.minCost)} ~ ${this.formatCurrency(doc.costEstimate.baseTier.maxCost)}</td></tr>
      <tr><td>디자인 승수</td><td>${doc.costEstimate.designMultiplier}x</td></tr>
      <tr><td>타임라인 승수</td><td>${doc.costEstimate.timelineMultiplier}x</td></tr>
      <tr class="cost-row"><td>최종 비용</td><td>${this.formatCurrency(doc.costEstimate.totalMin)} ~ ${this.formatCurrency(doc.costEstimate.totalMax)}</td></tr>
    </table>
  </div>

  ${doc.additionalNotes ? `
  <div class="section">
    <h2>추가 사항</h2>
    <p>${this.escapeHtml(doc.additionalNotes).replace(/\n/g, '<br>')}</p>
  </div>
  ` : ''}

  <div class="footer">
    <p>이 문서는 자동 생성되었으며, 문서 작성 시간: ${new Date().toLocaleString('ko-KR')}</p>
    <p>© 2024 프로젝트 문서 생성 시스템</p>
  </div>
</body>
</html>
    `;

    // Return HTML as Buffer (실제 PDF 변환은 외부 도구 필요)
    return Buffer.from(html, 'utf-8');
  }

  private escapeHtml(text: string): string {
    const map: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;',
    };
    return text.replace(/[&<>"']/g, (m) => map[m]);
  }

  private formatCurrency(amount: number): string {
    return amount.toLocaleString('ko-KR') + ' KRW';
  }
}
