// EmailProcessor — BullMQ 워커. nodemailer로 이메일 발송 구현.
import { Logger } from '@nestjs/common';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import * as nodemailer from 'nodemailer';

interface EmailJob {
  type: string;
  to: string;
  subject: string;
  templateData: any;
}

@Processor('email-notification')
export class EmailProcessor extends WorkerHost {
  private readonly logger = new Logger(EmailProcessor.name);
  private transporter: nodemailer.Transporter;

  constructor() {
    super();
    this.initializeTransporter();
  }

  private initializeTransporter() {
    const smtpHost = process.env.SMTP_HOST || 'localhost';
    const smtpPort = parseInt(process.env.SMTP_PORT || '587', 10);
    const smtpUser = process.env.SMTP_USER;
    const smtpPassword = process.env.SMTP_PASSWORD;
    const smtpFromEmail = process.env.SMTP_FROM_EMAIL || 'noreply@example.com';

    this.transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: smtpUser && smtpPassword ? { user: smtpUser, pass: smtpPassword } : undefined,
    });
  }

  async process(job: Job<EmailJob>): Promise<void> {
    try {
      const { type, to, subject, templateData } = job.data;

      this.logger.log(`Processing email job: type=${type}, to=${to}`);

      const html = this.generateEmailHtml(type, templateData);

      const result = await this.transporter.sendMail({
        from: process.env.SMTP_FROM_EMAIL || 'noreply@example.com',
        to,
        subject,
        html,
      });

      this.logger.log(`Email sent successfully: ${result.messageId}`);
    } catch (error) {
      this.logger.error(`Failed to send email: ${error}`, error instanceof Error ? error.stack : '');
      throw error;
    }
  }

  private generateEmailHtml(type: string, data: any): string {
    switch (type) {
      case 'magic-link':
        return this.generateMagicLinkEmail(data);
      case 'quote-completed':
        return this.generateQuoteCompletedEmail(data);
      case 'new-project':
        return this.generateNewProjectEmail(data);
      case 'contact-request':
        return this.generateContactRequestEmail(data);
      case 'status-change':
        return this.generateStatusChangeEmail(data);
      default:
        return `<p>알 수 없는 이메일 유형입니다.</p>`;
    }
  }

  private generateMagicLinkEmail(data: any): string {
    return `
      <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <h2>매직 링크로 로그인하세요</h2>
          <p>아래 링크를 클릭하여 로그인하세요:</p>
          <p>
            <a href="${data.magicLink}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; display: inline-block;">
              로그인하기
            </a>
          </p>
          <p style="color: #666; font-size: 12px;">이 링크는 ${data.expiresInHours}시간 후 만료됩니다.</p>
        </body>
      </html>
    `;
  }

  private generateQuoteCompletedEmail(data: any): string {
    return `
      <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <h2>당신의 사이트 견적이 완성되었습니다!</h2>
          <p>프로젝트의 상세한 요구사항 문서와 비용 견적이 완성되었습니다.</p>
          <p>
            <a href="${data.resultUrl}" style="background-color: #28a745; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; display: inline-block;">
              결과 확인하기
            </a>
          </p>
          <p style="color: #666; font-size: 12px;">프로젝트 ID: ${data.projectRequestId}</p>
        </body>
      </html>
    `;
  }

  private generateNewProjectEmail(data: any): string {
    const reasons = (data.reasons || [])
      .map((r: any) => `<li>${r.label}: ${r.description}</li>`)
      .join('');

    return `
      <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <h2>새로운 프로젝트 매칭 알림</h2>
          <p><strong>프로젝트:</strong> ${data.projectName}</p>
          <p><strong>유형:</strong> ${data.projectSiteType}</p>
          <p><strong>매칭 점수:</strong> ${data.score}점</p>
          <p><strong>매칭 사유:</strong></p>
          <ul>${reasons}</ul>
          <p>
            <a href="${data.projectUrl}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; display: inline-block;">
              프로젝트 상세보기
            </a>
          </p>
        </body>
      </html>
    `;
  }

  private generateContactRequestEmail(data: any): string {
    return `
      <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <h2>새로운 연락 요청: ${data.projectName}</h2>
          <p><strong>클라이언트 이메일:</strong> ${data.clientEmail}</p>
          <p><strong>프로젝트명:</strong> ${data.projectName}</p>
          ${data.message ? `<p><strong>메시지:</strong></p><p>${data.message}</p>` : ''}
          <p style="color: #666; font-size: 12px;">이 이메일에 직접 회신하여 클라이언트에게 연락할 수 있습니다.</p>
        </body>
      </html>
    `;
  }

  private generateStatusChangeEmail(data: any): string {
    return `
      <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <h2>프로젝트 상태 변경</h2>
          <p>프로젝트의 상태가 <strong>${data.status}</strong>로 변경되었습니다.</p>
          <p>
            <a href="${data.projectUrl}" style="background-color: #17a2b8; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; display: inline-block;">
              프로젝트 확인하기
            </a>
          </p>
          <p style="color: #666; font-size: 12px;">프로젝트 ID: ${data.projectRequestId}</p>
        </body>
      </html>
    `;
  }
}
