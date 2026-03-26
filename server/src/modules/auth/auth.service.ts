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
import { OAuth2Client } from 'google-auth-library';

export interface SessionUser {
  id: string;
  email: string;
  role: string;
  hasDeveloperProfile: boolean;
  developerProfileId: string | null;
}

export interface AuthSessionResponse {
  token: string;
  user: SessionUser;
}

@Injectable()
export class AuthService {
  private googleClient = new OAuth2Client();

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

  async verifyMagicLink(token: string): Promise<AuthSessionResponse> {
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
    const sessionUser = await this.getSessionUser(user.id);

    return { token: jwt, user: sessionUser };
  }

  async loginWithGoogle(googleIdToken: string): Promise<AuthSessionResponse> {
    const googleClientId = this.configService.get<string>('auth.googleClientId');

    if (!googleClientId) {
      throw new BadRequestException('Google login is not configured');
    }

    let payload: any = null;
    try {
      const ticket = await this.googleClient.verifyIdToken({
        idToken: googleIdToken,
        audience: googleClientId,
      });
      payload = ticket.getPayload();
    } catch {
      throw new UnauthorizedException('Invalid Google token');
    }

    if (!payload?.email || !payload?.email_verified) {
      throw new UnauthorizedException('Google account email is not verified');
    }

    const email = String(payload.email).toLowerCase();
    const adminGoogleEmails = this.configService.get<string[]>(
      'auth.adminGoogleEmails',
      [],
    );
    const nextRole = adminGoogleEmails.includes(email) ? 'ADMIN' : 'CLIENT';

    const user = await this.prisma.user.upsert({
      where: { email },
      update: {
        role: nextRole as any,
        emailVerifiedAt: new Date(),
      },
      create: {
        email,
        role: nextRole as any,
        emailVerifiedAt: new Date(),
      },
    });

    const jwt = this.createJwt(user.id, user.email, user.role);
    const sessionUser = await this.getSessionUser(user.id);

    return { token: jwt, user: sessionUser };
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
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return this.getSessionUser(user.id);
  }

  private async getSessionUser(userId: string): Promise<SessionUser> {
    const [user, developer] = await Promise.all([
      this.prisma.user.findUnique({
        where: { id: userId },
      }),
      this.prisma.developer.findUnique({
        where: { userId },
        select: { id: true },
      }),
    ]);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return {
      id: user.id,
      email: user.email,
      role: String(user.role).toLowerCase(),
      hasDeveloperProfile: Boolean(developer?.id),
      developerProfileId: developer?.id ?? null,
    };
  }
}
