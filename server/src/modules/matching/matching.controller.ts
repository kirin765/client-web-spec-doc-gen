// MatchingController — 매칭 실행, 결과 조회, 상태 업데이트 구현.
import { Controller, Post, Get, Param, Body } from '@nestjs/common';
import { MatchingService } from './matching.service';

@Controller()
export class MatchingController {
  constructor(private matchingService: MatchingService) {}

  /**
   * POST /project-requests/:id/match
   * 매칭 실행
   */
  @Post('project-requests/:id/match')
  async executeMatching(@Param('id') projectRequestId: string) {
    return this.matchingService.executeMatching(projectRequestId);
  }

  /**
   * GET /project-requests/:id/matches
   * 추천 개발자 목록 조회
   */
  @Get('project-requests/:id/matches')
  async getMatches(@Param('id') projectRequestId: string) {
    return this.matchingService.getMatches(projectRequestId);
  }

  /**
   * POST /matches/:id/contact
   * 연락 요청
   */
  @Post('matches/:id/contact')
  async updateMatchStatus(
    @Param('id') matchId: string,
    @Body() body: { status: 'contacted' | 'accepted' | 'rejected' },
  ) {
    return this.matchingService.updateMatchStatus(matchId, body.status);
  }
}
