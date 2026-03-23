// MatchingModule — DevelopersModule 의존, developer-matching 큐 등록.
import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { MatchingController } from './matching.controller';
import { MatchingService } from './matching.service';
import { DevelopersModule } from '../developers/developers.module';

@Module({
  imports: [
    DevelopersModule,
    BullModule.registerQueue({ name: 'developer-matching' }),
  ],
  controllers: [MatchingController],
  providers: [
    MatchingService,
  ],
  exports: [MatchingService],
})
export class MatchingModule {}
