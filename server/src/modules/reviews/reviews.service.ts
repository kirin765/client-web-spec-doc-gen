import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../common/db/prisma.service';
import { CreateReviewDto } from './dto/create-review.dto';

@Injectable()
export class ReviewsService {
  constructor(private prisma: PrismaService) {}

  private mapReview(review: any) {
    return {
      id: review.id,
      quoteShareId: review.quoteShareId,
      developerId: review.developerId,
      customerUserId: review.customerUserId,
      rating: review.rating,
      content: review.content,
      createdAt: review.createdAt.toISOString(),
      updatedAt: review.updatedAt.toISOString(),
      customer: review.customer
        ? {
            id: review.customer.id,
            email: review.customer.email,
            name: review.customer.name ?? null,
          }
        : null,
    };
  }

  async create(userId: string, dto: CreateReviewDto) {
    const quoteShare = await this.prisma.quoteShare.findUnique({
      where: { id: dto.quoteShareId },
      include: {
        projectRequest: {
          select: { userId: true },
        },
        review: {
          select: { id: true },
        },
      },
    });

    if (!quoteShare) {
      throw new NotFoundException('Quote share not found');
    }

    if (quoteShare.projectRequest.userId !== userId) {
      throw new ForbiddenException('Cannot review another customer\'s quote share');
    }

    if (quoteShare.status !== 'COMPLETED') {
      throw new BadRequestException('Only completed quote shares can be reviewed');
    }

    if (quoteShare.review?.id) {
      throw new BadRequestException('Review already exists for this quote share');
    }

    const review = await this.prisma.review.create({
      data: {
        quoteShareId: quoteShare.id,
        developerId: quoteShare.developerId,
        customerUserId: userId,
        rating: dto.rating,
        content: dto.content,
      },
      include: {
        customer: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });

    return this.mapReview(review);
  }

  async listByDeveloperId(developerId: string) {
    const developer = await this.prisma.developer.findUnique({
      where: { id: developerId },
      select: { id: true, active: true },
    });

    if (!developer || !developer.active) {
      throw new NotFoundException('Developer not found');
    }

    const reviews = await this.prisma.review.findMany({
      where: { developerId },
      include: {
        customer: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
      orderBy: [{ createdAt: 'desc' }],
    });

    const total = reviews.length;
    const averageRating =
      total === 0
        ? 0
        : Number(
            (
              reviews.reduce((sum, review) => sum + review.rating, 0) / total
            ).toFixed(1),
          );

    return {
      averageRating,
      total,
      items: reviews.map((review) => this.mapReview(review)),
    };
  }

  async listReceivedByUserId(userId: string) {
    const developer = await this.prisma.developer.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!developer) {
      throw new NotFoundException('Developer profile not found');
    }

    const reviews = await this.prisma.review.findMany({
      where: { developerId: developer.id },
      include: {
        customer: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
      orderBy: [{ createdAt: 'desc' }],
    });

    return reviews.map((review) => this.mapReview(review));
  }
}
