// [수정 필요 - M16] 개발 환경 로깅 구현 검증 필요
// - constructor에서 NODE_ENV === 'development'일 때 ['query', 'info', 'warn', 'error'] 로그 활성화
// - process.env.NODE_ENV를 직접 참조하는 대신 ConfigService를 통해 주입받는 것이 일관성 있음
// - NestJS 모듈 시스템과 통합된 방식으로 환경 설정을 가져오도록 개선 검토

import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    super({
      log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
    });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  enableShutdownHooks(app: any) {
    this.$on('beforeExit' as never, async () => {
      await app.close();
    });
  }
}
