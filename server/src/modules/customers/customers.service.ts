import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/db/prisma.service';
import { UpsertCustomerProfileDto } from './dto/upsert-customer-profile.dto';

function mapRegion(region: any) {
  if (!region) {
    return null;
  }

  return {
    code: region.code,
    name: region.name,
    depth: region.depth,
    parentCode: region.parentCode ?? null,
  };
}

function normalizeRegionCode(value: unknown) {
  if (typeof value !== 'string') {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

@Injectable()
export class CustomersService {
  constructor(private prisma: PrismaService) {}

  private mapProfile(profile: any) {
    return {
      id: profile.id,
      userId: profile.userId,
      displayName: profile.displayName,
      introduction: profile.introduction ?? null,
      regionCode: profile.regionCode ?? null,
      region: mapRegion(profile.region),
      createdAt: profile.createdAt.toISOString(),
      updatedAt: profile.updatedAt.toISOString(),
    };
  }

  async getByUserId(userId: string) {
    const profile = await this.prisma.customerProfile.findUnique({
      where: { userId },
      include: {
        region: true,
      },
    });

    if (!profile) {
      throw new NotFoundException('Customer profile not found');
    }

    return this.mapProfile(profile);
  }

  async upsertByUserId(userId: string, dto: UpsertCustomerProfileDto) {
    const profile = await this.prisma.customerProfile.upsert({
      where: { userId },
      update: {
        displayName: dto.displayName,
        introduction: dto.introduction,
        regionCode: normalizeRegionCode(dto.regionCode),
      },
      create: {
        userId,
        displayName: dto.displayName,
        introduction: dto.introduction,
        regionCode: normalizeRegionCode(dto.regionCode),
      },
      include: {
        region: true,
      },
    });

    return this.mapProfile(profile);
  }

  async patchByUserId(userId: string, dto: Partial<UpsertCustomerProfileDto>) {
    const existing = await this.prisma.customerProfile.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!existing) {
      throw new NotFoundException('Customer profile not found');
    }

    const profile = await this.prisma.customerProfile.update({
      where: { userId },
      data: {
        ...(dto.displayName !== undefined ? { displayName: dto.displayName } : {}),
        ...(dto.introduction !== undefined ? { introduction: dto.introduction } : {}),
        ...(dto.regionCode !== undefined
          ? { regionCode: normalizeRegionCode(dto.regionCode) }
          : {}),
      },
      include: {
        region: true,
      },
    });

    return this.mapProfile(profile);
  }
}
