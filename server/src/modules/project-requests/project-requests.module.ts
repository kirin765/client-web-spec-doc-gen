// [수정필요 C7 연관] ProjectRequestsService에서 PricingService를 주입할 수 있도록
// PricingModule을 imports에 추가해야 함.
import { Module } from '@nestjs/common';
import { ProjectRequestsController } from './project-requests.controller';
import { ProjectRequestsService } from './project-requests.service';
import { AuthModule } from '../auth/auth.module';
import { PricingModule } from '../pricing/pricing.module';
import { DocumentsModule } from '../documents/documents.module';
import { MatchingModule } from '../matching/matching.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { QueueModule } from '../../common/queue/queue.module';

@Module({
  imports: [
    AuthModule,
    QueueModule,
    PricingModule,
    DocumentsModule,
    MatchingModule,
    NotificationsModule,
  ],
  controllers: [ProjectRequestsController],
  providers: [ProjectRequestsService],
  exports: [ProjectRequestsService],
})
export class ProjectRequestsModule {}
