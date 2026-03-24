// AuthService — 매직링크 생성/검증, JWT 발급, 사용자 조회 구현.
import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../common/db/prisma.service';
import { randomBytes } from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async login(email: string): Promise<{ sent: boolean }> {
    const token = this.generateMagicLinkToken();
    // Store token with expiry (15 minutes)
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await this.prisma.magicLinkToken.upsert({
      where: { email },
      update: {
        token,
        expiresAt,
      },
      create: {
        email,
        token,
        expiresAt,
      },
    });

    return { sent: true };
  }

  async verifyMagicLink(token: string): Promise<{ token: string; email: string }> {
    const magicLink = await this.prisma.magicLinkToken.findUnique({
      where: { token },
    });

    if (!magicLink || magicLink.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid or expired token');
    }

    // Find or create user
    let user = await this.prisma.user.findUnique({
      where: { email: magicLink.email },
    });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          email: magicLink.email,
          role: 'CLIENT',
        },
      });
    }

    // Delete used token
    await this.prisma.magicLinkToken.delete({
      where: { token },
    });

    const jwt = this.createJwt(user.id, user.email, user.role);
    return {
      token: jwt,
      email: user.email,
    };
  }

  async validateJwt(payload: any): Promise<any> {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return {
      id: user.id,
      email: user.email,
      role: user.role,
    };
  }

  createJwt(userId: string, email: string, role: string = 'CLIENT'): string {
    const payload = {
      sub: userId,
      email,
      role,
    };

    const expiresIn = this.configService.get<string>('jwt.expiresIn', '24h');

    return this.jwtService.sign(payload, {
      expiresIn,
    });
  }

  generateMagicLinkToken(): string {
    return randomBytes(32).toString('hex');
  }

  async getCurrentUser(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
    });
  }
}
