import {
  Body,
  Controller,
  Patch,
  Param,
  Post,
} from '@nestjs/common';
import { ProposalsService } from './proposals.service';
import { CreateProposalDto } from './dto/create-proposal.dto';
import { UpdateProposalStatusDto } from './dto/update-proposal-status.dto';

@Controller('proposals')
export class ProposalsController {
  constructor(private readonly proposalsService: ProposalsService) {}

  @Post()
  async create(@Body() dto: CreateProposalDto) {
    return this.proposalsService.create(dto);
  }

  @Patch(':id/view')
  async markViewed(@Param('id') id: string) {
    return this.proposalsService.markViewed(id);
  }

  @Patch(':id/decision')
  async updateDecision(
    @Param('id') id: string,
    @Body() dto: UpdateProposalStatusDto,
  ) {
    return this.proposalsService.updateDecision(id, dto.status);
  }
}
