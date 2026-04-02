// [수정 필요 - C1] 큐 이름이 실제 모듈에서 사용하는 이름과 불일치
// - 'email' → 'email-notification'으로 변경 필요 (EmailProcessor에서 @Processor('email-notification') 사용)
// - 'notifications' → 'developer-matching'으로 변경 필요 (MatchingService에서 'developer-matching' 큐 사용)
// 큐 이름이 일치하지 않으면 BullMQ 워커가 작업을 수신하지 못함

import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        connection: {
          host: configService.get('redis.host'),
          port: configService.get('redis.port'),
          db: configService.get('redis.db'),
        },
        defaultJobOptions: {
          removeOnComplete: true,
          removeOnFail: false,
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 2000,
          },
        },
      }),
    }),
    BullModule.registerQueue(
      { name: 'email-notification' },
      { name: 'pdf-generation' },
      { name: 'developer-matching' },
    ),
  ],
  exports: [BullModule],
})
export class QueueModule {}
