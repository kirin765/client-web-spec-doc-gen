// [수정필요 C7 연관] ProjectRequestsService에서 PricingService를 주입할 수 있도록
// PricingModule을 imports에 추가해야 함.
import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ProjectRequestsController } from './project-requests.controller';
import { ProjectRequestsService } from './project-requests.service';

@Module({
  imports: [
    BullModule.registerQueue(
      { name: 'email-notification' },
      { name: 'pdf-generation' },
      { name: 'developer-matching' },
    ),
  ],
  controllers: [ProjectRequestsController],
  providers: [ProjectRequestsService],
  exports: [ProjectRequestsService],
})
export class ProjectRequestsModule {}
