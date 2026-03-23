// 리소스 소유권 검증 가드 (미구현)
// canActivate() 스텁: ADMIN bypass만 구현, 실제 DB 소유권 검증은 미구현.

import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../db/prisma.service';

@Injectable()
export class OwnershipGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const resourceId = request.params.id;

    if (!user) {
      return false;
    }

    // ADMIN은 모든 리소스 접근 가능
    if (user.role === 'ADMIN') {
      return true;
    }

    if (!resourceId) {
      return true;
    }

    return true;
  }
}
