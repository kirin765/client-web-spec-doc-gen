// [수정필요 H8] login()과 verify() 엔드포인트에 @Public() 데코레이터가 없음.
// 글로벌 JWT 가드가 적용되면 비인증 사용자가 로그인/검증할 수 없으므로 @Public() 추가 필요.
import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { User } from './decorators/user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import type { Role } from '@prisma/client';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('google')
  async loginWithGoogle(@Body() body: { idToken: string }) {
    if (!body.idToken) {
      throw new BadRequestException('idToken is required');
    }

    return this.authService.loginWithGoogleIdToken(body.idToken);
  }

  @Public()
  @Post('test-login')
  async loginWithTestUser(
    @Body() body: { userKey: 'customer' | 'developer' | 'admin' },
  ) {
    if (!body.userKey) {
      throw new BadRequestException('userKey is required');
    }

    return this.authService.loginAsTestUser(body.userKey);
  }

  @Public()
  @Post('login')
  async login(@Body() body: { email: string }) {
    if (!body.email) {
      throw new BadRequestException('Email is required');
    }
    return this.authService.login(body.email);
  }

  @Public()
  @Post('verify')
  async verify(@Body() body: { token: string }) {
    if (!body.token) {
      throw new BadRequestException('Token is required');
    }
    return this.authService.verifyMagicLink(body.token);
  }

  @Post('refresh')
  @UseGuards(JwtAuthGuard)
  async refresh(@User() user: any) {
    const newToken = this.authService.createJwt(
      user.id,
      user.email,
      user.role,
    );
    return {
      token: newToken,
      email: user.email,
    };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getCurrentUser(@User() user: any) {
    return this.authService.getCurrentUser(user.id);
  }

  @Public()
  @Post('test/session')
  async issueTestSession(
    @Body()
    body: {
      email: string;
      role?: Role;
      createCustomerProfile?: boolean;
      createDeveloperProfile?: boolean;
      developerActive?: boolean;
    },
  ) {
    if (!this.authService.isE2EAuthEnabled()) {
      throw new NotFoundException('Not found');
    }

    if (!body.email) {
      throw new BadRequestException('Email is required');
    }

    return this.authService.issueTestSession(body);
  }
}
