import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { User } from '../auth/decorators/user.decorator';
import { CreateReviewDto } from './dto/create-review.dto';
import { ReviewsService } from './reviews.service';

@Controller()
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Get('developers/:id/reviews')
  async listByDeveloper(@Param('id') id: string) {
    return this.reviewsService.listByDeveloperId(id);
  }

  @Post('reviews')
  @UseGuards(JwtAuthGuard)
  async create(@User() user: any, @Body() dto: CreateReviewDto) {
    return this.reviewsService.create(user.id, dto);
  }

  @Get('reviews/me/received')
  @UseGuards(JwtAuthGuard)
  async listReceived(@User() user: any) {
    return this.reviewsService.listReceivedByUserId(user.id);
  }
}
