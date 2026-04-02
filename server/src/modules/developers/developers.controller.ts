import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { DevelopersService } from './developers.service';
import { CreateDeveloperDto } from './dto/create-developer.dto';
import { UpdateDeveloperDto } from './dto/update-developer.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { User } from '../auth/decorators/user.decorator';
import { UpsertExpertFaqDto } from './dto/upsert-expert-faq.dto';
import { UpsertExpertPortfolioDto } from './dto/upsert-expert-portfolio.dto';

@Controller('developers')
export class DevelopersController {
  constructor(private developersService: DevelopersService) {}

  @Post()
  async create(@Body() data: CreateDeveloperDto) {
    return this.developersService.create(data);
  }

  @Get()
  async search(
    @Query('skills') skills?: string,
    @Query('projectTypes') projectTypes?: string,
    @Query('minBudget') minBudget?: string,
    @Query('maxBudget') maxBudget?: string,
    @Query('availabilityStatus') availabilityStatus?: string,
  ) {
    return this.developersService.search({
      skills: skills ? skills.split(',').map((value) => value.trim()).filter(Boolean) : undefined,
      supportedProjectTypes: projectTypes
        ? projectTypes.split(',').map((value) => value.trim()).filter(Boolean)
        : undefined,
      minBudget: minBudget ? parseInt(minBudget, 10) : undefined,
      maxBudget: maxBudget ? parseInt(maxBudget, 10) : undefined,
      availabilityStatus,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Get('me/profile')
  async getMyProfile(@User() user: any) {
    return this.developersService.getByUserId(user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('me/profile')
  async upsertMyProfile(@User() user: any, @Body() data: CreateDeveloperDto) {
    return this.developersService.upsertByUserId(user.id, data);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me/profile')
  async patchMyProfile(@User() user: any, @Body() data: UpdateDeveloperDto) {
    return this.developersService.patchByUserId(user.id, data);
  }

  @Get('me/faqs')
  @UseGuards(JwtAuthGuard)
  async listMyFaqs(@User() user: any) {
    return this.developersService.listFaqsByUserId(user.id);
  }

  @Post('me/faqs')
  @UseGuards(JwtAuthGuard)
  async createMyFaq(@User() user: any, @Body() dto: UpsertExpertFaqDto) {
    return this.developersService.createFaq(user.id, dto);
  }

  @Patch('me/faqs/:faqId')
  @UseGuards(JwtAuthGuard)
  async updateMyFaq(
    @User() user: any,
    @Param('faqId') faqId: string,
    @Body() dto: Partial<UpsertExpertFaqDto>,
  ) {
    return this.developersService.updateFaq(user.id, faqId, dto);
  }

  @Delete('me/faqs/:faqId')
  @UseGuards(JwtAuthGuard)
  async deleteMyFaq(@User() user: any, @Param('faqId') faqId: string) {
    return this.developersService.deleteFaq(user.id, faqId);
  }

  @Get('me/portfolios')
  @UseGuards(JwtAuthGuard)
  async listMyPortfolios(@User() user: any) {
    return this.developersService.listPortfoliosByUserId(user.id);
  }

  @Post('me/portfolios')
  @UseGuards(JwtAuthGuard)
  async createMyPortfolio(@User() user: any, @Body() dto: UpsertExpertPortfolioDto) {
    return this.developersService.createPortfolio(user.id, dto);
  }

  @Patch('me/portfolios/:portfolioId')
  @UseGuards(JwtAuthGuard)
  async updateMyPortfolio(
    @User() user: any,
    @Param('portfolioId') portfolioId: string,
    @Body() dto: Partial<UpsertExpertPortfolioDto>,
  ) {
    return this.developersService.updatePortfolio(user.id, portfolioId, dto);
  }

  @Delete('me/portfolios/:portfolioId')
  @UseGuards(JwtAuthGuard)
  async deleteMyPortfolio(@User() user: any, @Param('portfolioId') portfolioId: string) {
    return this.developersService.deletePortfolio(user.id, portfolioId);
  }

  @Get(':id/faqs')
  async listFaqs(@Param('id') id: string) {
    return this.developersService.listFaqsByDeveloperId(id);
  }

  @Get(':id/portfolios')
  async listPortfolios(@Param('id') id: string) {
    return this.developersService.listPortfoliosByDeveloperId(id);
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    return this.developersService.getById(id);
  }

  @Get(':id/matches')
  async getMatches(@Param('id') id: string) {
    return this.developersService.getMatches(id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() data: UpdateDeveloperDto) {
    return this.developersService.update(id, data);
  }

  @Patch(':id/availability')
  async updateAvailability(
    @Param('id') id: string,
    @Body() body: { status: 'AVAILABLE' | 'BUSY' | 'LIMITED' },
  ) {
    return this.developersService.updateAvailability(id, body.status);
  }
}
