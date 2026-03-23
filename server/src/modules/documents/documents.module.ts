// DocumentsModule — 문서 생성 + PDF 큐 등록.
import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { PrismaModule } from '../../common/db/prisma.module';
import { PricingModule } from '../pricing/pricing.module';
import { DocumentsService } from './documents.service';
import { DocumentsController } from './documents.controller';
import { PdfProcessor } from './processors/pdf.processor';

@Module({
  imports: [
    BullModule.registerQueue({ name: 'pdf-generation' }),
    PrismaModule,
    PricingModule,
  ],
  providers: [DocumentsService, PdfProcessor],
  controllers: [DocumentsController],
  exports: [DocumentsService],
})
export class DocumentsModule {}
