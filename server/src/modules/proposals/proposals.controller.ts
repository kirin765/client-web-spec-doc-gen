import {
  Body,
  Controller,
  Get,
  Patch,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ProposalsService } from './proposals.service';
import { CreateProposalDto } from './dto/create-proposal.dto';
import { UpdateProposalStatusDto } from './dto/update-proposal-status.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { User } from '../auth/decorators/user.decorator';

@Controller('proposals')
@UseGuards(JwtAuthGuard)
export class ProposalsController {
  constructor(private readonly proposalsService: ProposalsService) {}

  @Post()
  async create(@Body() dto: CreateProposalDto) {
    return this.proposalsService.create(dto);
  }

  @Get('project-requests/:projectRequestId')
  async listByProjectRequest(
    @Param('projectRequestId') projectRequestId: string,
    @User() user: any,
  ) {
    return this.proposalsService.listByProjectRequest(projectRequestId, user.id);
  }

  @Patch(':id/view')
  async markViewed(@Param('id') id: string, @User() user: any) {
    return this.proposalsService.markViewedByCustomer(id, user.id);
  }

  @Patch(':id/decision')
  async updateDecision(
    @Param('id') id: string,
    @Body() dto: UpdateProposalStatusDto,
    @User() user: any,
  ) {
    return this.proposalsService.updateDecisionByCustomer(id, dto.status, user.id);
  }
}
