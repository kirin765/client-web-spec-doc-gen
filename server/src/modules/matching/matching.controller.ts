import { Controller, Post, Param, Body, UseGuards } from '@nestjs/common';
import { MatchingService } from './matching.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles, RolesGuard } from '../../common/guards/roles.guard';

@Controller('matching')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class MatchingController {
  constructor(private matchingService: MatchingService) {}

  @Post('project-requests/:id')
  async executeMatching(@Param('id') projectRequestId: string) {
    return this.matchingService.executeMatching(projectRequestId);
  }

  @Post('matches/:id/status')
  async updateMatchStatus(
    @Param('id') matchId: string,
    @Body() body: { status: 'contacted' | 'accepted' | 'rejected' },
  ) {
    return this.matchingService.updateMatchStatus(matchId, body.status);
  }
}
