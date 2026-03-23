// DevelopersController — 등록, 수정, 검색, 가용성 변경, 상세 조회 구현.
import {
  Controller,
  Post,
  Get,
  Patch,
  Param,
  Body,
  Query,
} from '@nestjs/common';
import { DevelopersService } from './developers.service';
import { CreateDeveloperDto } from './dto/create-developer.dto';
import { UpdateDeveloperDto } from './dto/update-developer.dto';

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

  @Get(':id')
  async getById(@Param('id') id: string) {
    return this.developersService.getById(id);
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
