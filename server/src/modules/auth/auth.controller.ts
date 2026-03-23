// AuthController — POST /auth/login, POST /auth/verify, POST /auth/refresh, GET /auth/me 구현.
import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { User } from './decorators/user.decorator';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Body() body: { email: string }) {
    if (!body.email) {
      throw new BadRequestException('Email is required');
    }
    return this.authService.login(body.email);
  }

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
}
