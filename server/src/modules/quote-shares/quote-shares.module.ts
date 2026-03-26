import { Module } from '@nestjs/common';
import { QuoteSharesController } from './quote-shares.controller';
import { QuoteSharesService } from './quote-shares.service';

@Module({
  controllers: [QuoteSharesController],
  providers: [QuoteSharesService],
  exports: [QuoteSharesService],
})
export class QuoteSharesModule {}
