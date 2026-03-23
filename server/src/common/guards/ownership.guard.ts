// [수정 필요 - H1] 38행에서 (this.prisma as any).document를 사용하지만 Prisma 모델명이 잘못됨
// - Prisma 스키마에 'document' 모델이 없음. 올바른 모델명은 'requirementDocument'
// - `(this.prisma as any).document` → `(this.prisma as any).requirementDocument`로 변경 필요
// - 현재 코드는 항상 undefined를 반환하여 소유권 검증이 실패하고 무조건 ForbiddenException 발생

import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../db/prisma.service';

@Injectable()
export class OwnershipGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user as { id?: string; role?: string } | undefined;

    if (!user) {
      return false;
    }

    // ADMIN은 모든 리소스 접근 가능
    if (user.role === 'ADMIN') return true;

    // 흔한 패턴: params.userId 또는 params.ownerId가 현재 사용자와 일치하면 허용
    const { userId, ownerId, id } = request.params ?? {};
    if (userId && String(userId) === String(user.id)) return true;
    if (ownerId && String(ownerId) === String(user.id)) return true;

    // 요청 바디에 ownerId가 명시되어 있을 때도 허용
    if (request.body && request.body.ownerId && String(request.body.ownerId) === String(user.id)) return true;

    // 일부 엔드포인트는 id 파라미터가 리소스 id일 수 있음. DB 조회가 가능한 경우 owner 비교 시도
    if (id) {
      try {
        // 공통적으로 사용할 수 있는 모델을 알 수 없으므로, 몇 가지 일반적인 모델을 시도합니다.
        // 실패하면 무시하고 권한 거부 처리로 이어집니다.
        const maybeProjectRequest = await (this.prisma as any).projectRequest?.findUnique({ where: { id } });
        if (maybeProjectRequest && (maybeProjectRequest.ownerId === user.id || maybeProjectRequest.userId === user.id)) return true;

        const maybeDocument = await (this.prisma as any).requirementDocument?.findUnique({ where: { id } });
        if (maybeDocument && (maybeDocument.ownerId === user.id || maybeDocument.userId === user.id)) return true;
      } catch (e) {
        // DB 모델이 없거나 조회 실패 시 여기로 옴 — 무시하고 아래에서 Forbidden 처리
      }
    }

    throw new ForbiddenException('리소스에 대한 접근 권한이 없습니다.');
  }
}
