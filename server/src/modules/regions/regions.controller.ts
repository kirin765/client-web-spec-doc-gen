import { Controller, Get, Param } from '@nestjs/common';
import { RegionsService } from './regions.service';

function mapRegion(region: any) {
  return {
    code: region.code,
    name: region.name,
    depth: region.depth,
    parentCode: region.parentCode ?? null,
    sortOrder: region.sortOrder,
  };
}

@Controller('regions')
export class RegionsController {
  constructor(private readonly regionsService: RegionsService) {}

  @Get()
  async listRoots() {
    const list = await this.regionsService.listRoots();
    return list.map(mapRegion);
  }

  @Get(':code/children')
  async listChildren(@Param('code') code: string) {
    const list = await this.regionsService.listChildren(code);
    return list.map(mapRegion);
  }
}
