// [H6] 수정 필요: 빈 컨트롤러임. AdminService에 연결되는 라우트 추가 필요:
// - POST /admin/developers/:id/activate
// - POST /admin/developers/:id/deactivate
// - GET /admin/project-requests (필터 포함 목록)
// - GET /admin/stats/conversion
// 모든 라우트에 @UseGuards(JwtAuthGuard)와 @Roles('ADMIN') 적용 필수.
import { Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles, RolesGuard } from '../../common/guards/roles.guard';
import { AdminService } from './admin.service';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Post('developers/:id/activate')
  async activateDeveloper(@Param('id') id: string) {
    return this.adminService.activateDeveloper(id);
  }

  @Post('developers/:id/deactivate')
  async deactivateDeveloper(@Param('id') id: string) {
    return this.adminService.deactivateDeveloper(id);
  }

  @Get('project-requests')
  async listProjectRequests(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
    @Query('siteType') siteType?: string,
    @Query('submittedFrom') submittedFrom?: string,
    @Query('submittedTo') submittedTo?: string,
  ) {
    return this.adminService.listProjectRequests(
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 10,
      {
        status,
        siteType,
        submittedFrom,
        submittedTo,
      },
    );
  }

  @Get('stats/conversion')
  async getConversionStats() {
    return this.adminService.getConversionStats();
  }
}
