// NotificationsService — 매직링크, 견적완료, 프로젝트알림, 연락요청, 상태변경 이메일 큐 등록 구현.
import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Queue } from 'bullmq';
import { InjectQueue } from '@nestjs/bullmq';
import type { MatchResult } from '../../types/matching';

interface EmailTemplateData {
  [key: string]: any;
}

@Injectable()
export class NotificationsService {
  constructor(
    private configService: ConfigService,
    @InjectQueue('email-notification') private emailQueue: Queue,
  ) {}

  async sendMagicLinkEmail(email: string, token: string, callbackUrl: string): Promise<void> {
    if (!email || !token || !callbackUrl) {
      throw new BadRequestException('Missing required parameters for magic link email');
    }

    const magicLink = `${callbackUrl}?token=${token}`;

    await this.emailQueue.add('magic-link', {
      type: 'magic-link',
      to: email,
      subject: '매직 링크로 로그인하세요',
      templateData: {
        magicLink,
        expiresInHours: 24,
      },
    });
  }

  async sendQuoteCompletedEmail(email: string, projectRequestId: string): Promise<void> {
    if (!email || !projectRequestId) {
      throw new BadRequestException('Missing required parameters for quote completion email');
    }

    const appUrl = this.configService.get<string>('APP_URL', 'http://localhost:3000');
    const resultUrl = `${appUrl}/results/${projectRequestId}`;

    await this.emailQueue.add('quote-completed', {
      type: 'quote-completed',
      to: email,
      subject: '당신의 사이트 견적이 완성되었습니다!',
      templateData: {
        projectRequestId,
        resultUrl,
      },
    });
  }

  async sendNewProjectNotification(
    developerEmail: string,
    matchResult: MatchResult & { projectName?: string; projectSiteType?: string },
  ): Promise<void> {
    if (!developerEmail || !matchResult) {
      throw new BadRequestException('Missing required parameters for new project notification');
    }

    const appUrl = this.configService.get<string>('APP_URL', 'http://localhost:3000');
    const projectUrl = `${appUrl}/projects/${matchResult.projectRequestId}`;

    await this.emailQueue.add('new-project', {
      type: 'new-project',
      to: developerEmail,
      subject: '새로운 프로젝트 매칭 알림',
      templateData: {
        projectName: matchResult.projectName || 'New Project',
        projectSiteType: matchResult.projectSiteType || 'Unknown',
        score: matchResult.score,
        reasons: matchResult.reasons,
        projectUrl,
      },
    });
  }

  async sendContactRequestEmail(
    developerEmail: string,
    clientInfo: {
      email: string;
      projectName: string;
      message?: string;
    },
  ): Promise<void> {
    if (!developerEmail || !clientInfo || !clientInfo.email) {
      throw new BadRequestException('Missing required parameters for contact request email');
    }

    await this.emailQueue.add('contact-request', {
      type: 'contact-request',
      to: developerEmail,
      subject: `새로운 연락 요청: ${clientInfo.projectName}`,
      templateData: {
        clientEmail: clientInfo.email,
        projectName: clientInfo.projectName,
        message: clientInfo.message || '',
      },
    });
  }

  async sendStatusChangeNotification(
    email: string,
    projectRequestId: string,
    status: string,
  ): Promise<void> {
    if (!email || !projectRequestId || !status) {
      throw new BadRequestException('Missing required parameters for status change notification');
    }

    const appUrl = this.configService.get<string>('APP_URL', 'http://localhost:3000');
    const projectUrl = `${appUrl}/projects/${projectRequestId}`;

    await this.emailQueue.add('status-change', {
      type: 'status-change',
      to: email,
      subject: `프로젝트 상태 변경: ${status}`,
      templateData: {
        projectRequestId,
        status,
        projectUrl,
      },
    });
  }
}
