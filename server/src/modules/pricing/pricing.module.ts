// PricingModule — PricingService 제공.
import { Module } from '@nestjs/common';
import { PrismaModule } from '../../common/db/prisma.module';
import { PricingService } from './pricing.service';
import { PricingController } from './pricing.controller';
import { AuthModule } from '../auth/auth.module';
import { RolesGuard } from '../../common/guards/roles.guard';

@Module({
  imports: [PrismaModule, AuthModule],
  providers: [PricingService, RolesGuard],
  controllers: [PricingController],
  exports: [PricingService],
})
export class PricingModule {}
