// [수정필요 H7] 빈 컨트롤러 스텁 상태. 다음 라우트 구현 필요:
//   GET /admin/pricing-rules (버전 목록), GET /admin/pricing-rules/:id (버전 조회),
//   POST /admin/pricing-rules (버전 생성).
import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles, RolesGuard } from '../../common/guards/roles.guard';
import { PricingService } from './pricing.service';
import type { PricingRuleSet } from '../../types/pricing-rule';

@Controller('admin/pricing-rules')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class PricingController {
  constructor(private pricingService: PricingService) {}

  @Get()
  async getAllVersions() {
    return this.pricingService.getAllVersions();
  }

  @Get(':id')
  async getVersion(@Param('id') id: string) {
    const version = await this.pricingService.getRuleVersion(id);

    if (!version) {
      throw new NotFoundException(`Pricing rule version ${id} not found`);
    }

    return version;
  }

  @Post()
  async createVersion(
    @Body()
    body: {
      rules: PricingRuleSet;
      effectiveFrom: string;
    },
    @Request() req: { user?: { id?: string } },
  ) {
    return this.pricingService.createNewVersion(
      body.rules,
      new Date(body.effectiveFrom),
      req.user?.id,
    );
  }
}
