// DevelopersController — 등록, 수정, 검색, 가용성 변경, 상세 조회 구현.
import { Controller, Post, Get, Patch, Param, Body } from '@nestjs/common';
import { DevelopersService } from './developers.service';

@Controller('developers')
export class DevelopersController {
  constructor(private developersService: DevelopersService) {}

  @Post()
  async create(@Body() data: any) {
    return this.developersService.create(data);
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    return this.developersService.getById(id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() data: any) {
    return this.developersService.update(id, data);
  }

  @Get(':id/availability')
  async updateAvailability(
    @Param('id') id: string,
    @Body() body: { status: 'AVAILABLE' | 'BUSY' | 'LIMITED' },
  ) {
    return this.developersService.updateAvailability(id, body.status);
  }
}
