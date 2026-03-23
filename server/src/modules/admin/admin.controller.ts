// [H6] 수정 필요: 빈 컨트롤러임. AdminService에 연결되는 라우트 추가 필요:
// - POST /admin/developers/:id/activate
// - POST /admin/developers/:id/deactivate
// - GET /admin/project-requests (필터 포함 목록)
// - GET /admin/stats/conversion
// 모든 라우트에 @UseGuards(JwtAuthGuard)와 @Roles('ADMIN') 적용 필수.
import { Controller } from '@nestjs/common';

@Controller('admin')
export class AdminController {}
