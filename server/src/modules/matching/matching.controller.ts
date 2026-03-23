// [수정필요 H9] 인증 가드(@UseGuards(JwtAuthGuard))가 없음 — 누구나 매칭 실행, 결과 조회, 상태 변경 가능. 가드 추가 필요.
// [수정필요 L8] @Controller()에 빈 prefix — 'project-requests/:id/match' 등의 라우트가 전역 네임스페이스를 오염시킴.
//   @Controller('matching') 등 적절한 prefix 설정 필요.
import { Controller, Post, Get, Param, Body, UseGuards } from '@nestjs/common';
import { MatchingService } from './matching.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('matching')
@UseGuards(JwtAuthGuard)
export class MatchingController {
  constructor(private matchingService: MatchingService) {}

  @Post('project-requests/:id')
  async executeMatching(@Param('id') projectRequestId: string) {
    return this.matchingService.executeMatching(projectRequestId);
  }

  @Get('project-requests/:id')
  async getMatches(@Param('id') projectRequestId: string) {
    return this.matchingService.getMatches(projectRequestId);
  }

  @Post('matches/:id/status')
  async updateMatchStatus(
    @Param('id') matchId: string,
    @Body() body: { status: 'contacted' | 'accepted' | 'rejected' },
  ) {
    return this.matchingService.updateMatchStatus(matchId, body.status);
  }
}
