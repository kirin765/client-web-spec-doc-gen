// [수정필요 H7] 빈 컨트롤러 스텁 상태. 다음 라우트 구현 필요:
//   GET /admin/pricing-rules (버전 목록), GET /admin/pricing-rules/:id (버전 조회),
//   POST /admin/pricing-rules (버전 생성).
import { Controller } from '@nestjs/common';

@Controller('admin/pricing-rules')
export class PricingController {}
