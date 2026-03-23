// [L3] 수정 필요: PricingModule을 import하고 있으나 AdminService에서 PricingService를 사용하지 않음. import 제거 또는 가격 관리 기능 추가 필요.
import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { PricingModule } from '../pricing/pricing.module';

@Module({
  imports: [PricingModule],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}
