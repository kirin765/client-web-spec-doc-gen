// PrismaModule — @Global 전역 모듈. PrismaService를 모든 모듈에 제공.

import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
