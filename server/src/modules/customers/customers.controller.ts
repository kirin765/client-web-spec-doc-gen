import { Body, Controller, Get, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { User } from '../auth/decorators/user.decorator';
import { CustomersService } from './customers.service';
import { UpsertCustomerProfileDto } from './dto/upsert-customer-profile.dto';

@Controller('customers')
@UseGuards(JwtAuthGuard)
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Get('me/profile')
  async getMyProfile(@User() user: any) {
    return this.customersService.getByUserId(user.id);
  }

  @Post('me/profile')
  async upsertMyProfile(@User() user: any, @Body() dto: UpsertCustomerProfileDto) {
    return this.customersService.upsertByUserId(user.id, dto);
  }

  @Patch('me/profile')
  async patchMyProfile(
    @User() user: any,
    @Body() dto: Partial<UpsertCustomerProfileDto>,
  ) {
    return this.customersService.patchByUserId(user.id, dto);
  }
}
