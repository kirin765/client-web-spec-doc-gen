// AuthService — 매직링크 생성/검증, JWT 발급, 사용자 조회 구현.
import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../common/db/prisma.service';
import { randomBytes } from 'crypto';
import { OAuth2Client } from 'google-auth-library';
import type { Role } from '@prisma/client';
import { normalizeEnumToApi } from '../../common/utils/enum-normalizer';
import { TEST_USER_FIXTURES } from '../../../test/e2e-test-data';

interface IssueTestSessionOptions {
  email: string;
  role?: Role;
  createCustomerProfile?: boolean;
  createDeveloperProfile?: boolean;
  developerActive?: boolean;
}

@Injectable()
export class AuthService {
  private googleClient: OAuth2Client;

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {
    this.googleClient = new OAuth2Client(
      this.configService.get<string>('GOOGLE_CLIENT_ID') ||
        this.configService.get<string>('googleClientId'),
    );
  }

  private getAdminEmails() {
    const raw =
      this.configService.get<string>('ADMIN_GOOGLE_EMAILS') ||
      this.configService.get<string>('adminGoogleEmails') ||
      '';

    return raw
      .split(',')
      .map((item) => item.trim().toLowerCase())
      .filter(Boolean);
  }

  private isE2ETestModeEnabled() {
    return (
      this.configService.get<boolean>('e2eTestMode') === true ||
      this.configService.get<boolean>('E2E_TEST_MODE') === true
    );
  }

  isE2EAuthEnabled() {
    return (
      this.configService.get<string>('nodeEnv') === 'test' ||
      this.configService.get<boolean>('e2eAuthEnabled') === true ||
      this.isE2ETestModeEnabled()
    );
  }

  private mapSessionUser(user: {
    id: string;
    email: string;
    role: string;
    customerProfile?: { id: string } | null;
    developerProfile?: { id: string } | null;
  }) {
    const customerProfileId = user.customerProfile?.id ?? null;
    const developerProfileId = user.developerProfile?.id ?? null;

    return {
      id: user.id,
      email: user.email,
      role: normalizeEnumToApi(user.role),
      hasCustomerProfile: Boolean(customerProfileId),
      customerProfileId,
      hasExpertProfile: Boolean(developerProfileId),
      expertProfileId: developerProfileId,
      hasDeveloperProfile: Boolean(developerProfileId),
      developerProfileId,
    };
  }

  private async getUserWithProfiles(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        customerProfile: {
          select: { id: true },
        },
        developerProfile: {
          select: { id: true },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return user;
  }

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
    const user = await this.getUserWithProfiles(payload.sub);

    return {
      id: user.id,
      email: user.email,
      role: user.role,
    };
  }

  async loginWithGoogleIdToken(idToken: string) {
    const googleClientId =
      this.configService.get<string>('GOOGLE_CLIENT_ID') ||
      this.configService.get<string>('googleClientId');

    if (!googleClientId) {
      throw new UnauthorizedException('GOOGLE_CLIENT_ID is not configured');
    }

    const ticket = await this.googleClient.verifyIdToken({
      idToken,
      audience: googleClientId,
    });

    const payload = ticket.getPayload();

    if (!payload?.email) {
      throw new UnauthorizedException('Google account email is required');
    }

    const email = payload.email.toLowerCase();
    const adminEmails = this.getAdminEmails();
    const role = adminEmails.includes(email) ? 'ADMIN' : 'CLIENT';

    const user = await this.prisma.user.upsert({
      where: { email },
      update: {
        name: payload.name ?? undefined,
        role,
        emailVerifiedAt: new Date(),
      },
      create: {
        email,
        name: payload.name ?? undefined,
        role,
        emailVerifiedAt: new Date(),
      },
      include: {
        customerProfile: {
          select: { id: true },
        },
        developerProfile: {
          select: { id: true },
        },
      },
    });

    return {
      token: this.createJwt(user.id, user.email, user.role),
      user: this.mapSessionUser(user),
    };
  }

  async loginAsTestUser(userKey: 'customer' | 'developer' | 'admin') {
    if (!this.isE2ETestModeEnabled()) {
      throw new UnauthorizedException('Test login is only available in test mode');
    }

    const fixture = TEST_USER_FIXTURES[userKey];
    if (!fixture) {
      throw new BadRequestException('Unknown test user');
    }

    const user = await this.prisma.user.findUnique({
      where: { email: fixture.email },
      include: {
        customerProfile: {
          select: { id: true },
        },
        developerProfile: {
          select: { id: true },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('Seeded test user not found');
    }

    return {
      token: this.createJwt(user.id, user.email, user.role),
      user: this.mapSessionUser(user),
    };
  }

  async issueTestSession(options: IssueTestSessionOptions) {
    const role = options.role ?? 'CLIENT';
    const email = options.email.trim().toLowerCase();

    if (!email) {
      throw new BadRequestException('Email is required');
    }

    const displayName = email.split('@')[0] || 'e2e-user';

    const user = await this.prisma.user.upsert({
      where: { email },
      update: {
        role,
      },
      create: {
        email,
        role,
        name: displayName,
      },
    });

    if (options.createCustomerProfile) {
      await this.prisma.customerProfile.upsert({
        where: { userId: user.id },
        update: {
          displayName: `${displayName} customer`,
          introduction: 'E2E customer profile',
        },
        create: {
          userId: user.id,
          displayName: `${displayName} customer`,
          introduction: 'E2E customer profile',
        },
      });
    }

    if (options.createDeveloperProfile) {
      await this.prisma.developer.upsert({
        where: { userId: user.id },
        update: {
          displayName: `${displayName} studio`,
          headline: 'E2E developer profile',
          introduction: 'Generated for end-to-end tests.',
          type: 'FREELANCER',
          active: options.developerActive ?? true,
          budgetMin: 1000000,
          budgetMax: 5000000,
          languages: ['ko'],
          skills: ['react', 'nestjs'],
          specialties: ['e2e'],
          supportedProjectTypes: ['landing', 'webapp'],
          supportedCoreFeatures: ['contactForm'],
          supportedEcommerceFeatures: [],
          supportedDesignStyles: ['minimal'],
          supportedDesignComplexities: ['template'],
          supportedTimelines: ['standard'],
          portfolioLinks: [],
          regions: [],
        },
        create: {
          userId: user.id,
          displayName: `${displayName} studio`,
          headline: 'E2E developer profile',
          introduction: 'Generated for end-to-end tests.',
          type: 'FREELANCER',
          active: options.developerActive ?? true,
          budgetMin: 1000000,
          budgetMax: 5000000,
          languages: ['ko'],
          skills: ['react', 'nestjs'],
          specialties: ['e2e'],
          supportedProjectTypes: ['landing', 'webapp'],
          supportedCoreFeatures: ['contactForm'],
          supportedEcommerceFeatures: [],
          supportedDesignStyles: ['minimal'],
          supportedDesignComplexities: ['template'],
          supportedTimelines: ['standard'],
          portfolioLinks: [],
          regions: [],
        },
      });
    }

    const sessionUser = await this.prisma.user.findUnique({
      where: { id: user.id },
      include: {
        customerProfile: {
          select: { id: true },
        },
        developerProfile: {
          select: { id: true },
        },
      },
    });

    if (!sessionUser) {
      throw new NotFoundException('User not found');
    }

    return {
      token: this.createJwt(user.id, user.email, user.role),
      user: this.mapSessionUser(sessionUser),
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
    const user = await this.getUserWithProfiles(userId);
    return this.mapSessionUser(user);
  }
}
