import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { User } from '../auth/decorators/user.decorator';
import { CreateQuoteShareDto } from './dto/create-quote-share.dto';
import { QuoteSharesService } from './quote-shares.service';

@Controller('quote-shares')
@UseGuards(JwtAuthGuard)
export class QuoteSharesController {
  constructor(private quoteSharesService: QuoteSharesService) {}

  @Post()
  async create(@Body() dto: CreateQuoteShareDto, @User() user: any) {
    return this.quoteSharesService.createByUser(user.id, dto);
  }

  @Get('sent')
  async listSent(@User() user: any) {
    return this.quoteSharesService.listSentByUser(user.id);
  }

  @Get('inbox')
  async listInbox(@User() user: any) {
    return this.quoteSharesService.listInboxByDeveloper(user.id);
  }

  @Get(':id')
  async getDetail(@Param('id') id: string, @User() user: any) {
    return this.quoteSharesService.getDetail(id, user.id);
  }

  @Patch(':id/cancel')
  async cancelByUser(@Param('id') id: string, @User() user: any) {
    return this.quoteSharesService.cancelByUser(id, user.id);
  }

  @Patch(':id/approve')
  async approveByDeveloper(@Param('id') id: string, @User() user: any) {
    return this.quoteSharesService.approveByDeveloper(id, user.id);
  }

  @Patch(':id/cancel-by-developer')
  async cancelByDeveloper(@Param('id') id: string, @User() user: any) {
    return this.quoteSharesService.cancelByDeveloper(id, user.id);
  }
}
