// AuthService: NotificationsService 주입, 이메일 발송 구현
import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../common/db/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { randomBytes } from 'crypto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private notificationsService: NotificationsService,
  ) {}

  async login(email: string): Promise<{ sent: boolean }> {
    const token = this.generateMagicLinkToken();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await this.prisma.magicLinkToken.upsert({
      where: { email },
      update: { token, expiresAt },
      create: { email, token, expiresAt },
    });

    // 이메일 발송
    try {
      const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:5173';
      const verifyUrl = `${frontendUrl}/auth/verify?token=${token}`;
      await this.notificationsService.sendMagicLinkEmail(email, token, verifyUrl);
    } catch (error) {
      this.logger.warn(`Failed to send magic link email to ${email}`, error);
    }

    return { sent: true };
  }

  async verifyMagicLink(token: string): Promise<{ token: string; email: string }> {
    const magicLink = await this.prisma.magicLinkToken.findUnique({
      where: { token },
    });

    if (!magicLink || magicLink.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid or expired token');
    }

    const user = await this.prisma.user.upsert({
      where: { email: magicLink.email },
      update: {},
      create: {
        email: magicLink.email,
        role: 'CLIENT',
      },
    });

    const jwt = this.createJwt(user.id, user.email, user.role);

    await this.prisma.magicLinkToken.delete({
      where: { token },
    });

    return { token: jwt, email: user.email };
  }

  async validateJwt(payload: any): Promise<any> {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return user;
  }

  createJwt(userId: string, email: string, role: string = 'CLIENT'): string {
    const payload = { sub: userId, email, role };
    return this.jwtService.sign(payload);
  }

  generateMagicLinkToken(): string {
    return randomBytes(32).toString('hex');
  }

  async getCurrentUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return user;
  }
}
