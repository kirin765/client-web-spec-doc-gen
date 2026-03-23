// ProjectRequestsModule — BullMQ 큐 3개(email-notification, pdf-generation, developer-matching) 등록.
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
