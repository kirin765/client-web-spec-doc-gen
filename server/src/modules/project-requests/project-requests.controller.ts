// ProjectRequestsController — draft 생성, 답변 업데이트, 제출, 상세 조회 구현.
import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ProjectRequestsService } from './project-requests.service';
import { CreateDraftDto, UpdateAnswersDto, SubmitProjectRequestDto } from './dto';
import { User } from '../../modules/auth/decorators/user.decorator';
import { ProposalsService } from '../proposals/proposals.service';
import { MatchingService } from '../matching/matching.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('project-requests')
export class ProjectRequestsController {
  constructor(
    private projectRequestsService: ProjectRequestsService,
    private proposalsService: ProposalsService,
    private matchingService: MatchingService,
  ) {}

  @Post('draft')
  async createDraft(
    @Body() createDraftDto: CreateDraftDto,
    @User() user?: any,
  ) {
    return this.projectRequestsService.createDraft(
      user?.id,
      createDraftDto,
    );
  }

  @Post()
  async createDraftLegacy(
    @Body() createDraftDto: CreateDraftDto,
    @User() user?: any,
  ) {
    return this.projectRequestsService.createDraft(
      user?.id,
      createDraftDto,
    );
  }

  @Patch(':id/answers')
  @UseGuards(JwtAuthGuard)
  async updateAnswers(
    @Param('id') id: string,
    @Body() updateAnswersDto: UpdateAnswersDto,
    @User() user: any,
  ) {
    return this.projectRequestsService.updateAnswers(
      id,
      user.id,
      updateAnswersDto,
    );
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async updateAnswersLegacy(
    @Param('id') id: string,
    @Body() updateAnswersDto: UpdateAnswersDto,
    @User() user: any,
  ) {
    return this.projectRequestsService.updateAnswers(
      id,
      user.id,
      updateAnswersDto,
    );
  }

  @Post(':id/submit')
  @UseGuards(JwtAuthGuard)
  async submit(
    @Param('id') id: string,
    @Body() submitDto: SubmitProjectRequestDto,
    @User() user: any,
  ) {
    return this.projectRequestsService.submit(id, user.id, submitDto);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getById(@Param('id') id: string, @User() user: any) {
    return this.projectRequestsService.getDetail(id, user.id);
  }

  @Get(':id/proposals')
  @UseGuards(JwtAuthGuard)
  async getProposals(@Param('id') id: string, @User() user: any) {
    return this.proposalsService.listByProjectRequest(id, user.id);
  }

  @Get(':id/matches')
  @UseGuards(JwtAuthGuard)
  async getMatches(@Param('id') id: string, @User() user: any) {
    await this.projectRequestsService.getById(id, user.id);
    return this.matchingService.getMatches(id);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async list(
    @User() user: any,
    @Query('pageSize') pageSize?: string,
    @Query('page') page?: string,
  ) {
    return this.projectRequestsService.list(
      user.id,
      pageSize ? parseInt(pageSize, 10) : 10,
      page ? parseInt(page, 10) : 1,
    );
  }
}
