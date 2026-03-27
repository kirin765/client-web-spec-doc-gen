import { Injectable, OnModuleInit, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/db/prisma.service';
import { REGION_SEED } from '@shared/regions';

@Injectable()
export class RegionsService implements OnModuleInit {
  constructor(private prisma: PrismaService) {}

  async onModuleInit() {
    await this.ensureSeeded();
  }

  private async ensureSeeded() {
    const count = await this.prisma.region.count();
    if (count > 0) {
      return;
    }

    await this.prisma.region.createMany({
      data: REGION_SEED.map((region) => ({
        code: region.code,
        name: region.name,
        depth: region.depth,
        parentCode: region.parentCode,
        sortOrder: region.sortOrder,
      })),
      skipDuplicates: true,
    });
  }

  async listRoots() {
    await this.ensureSeeded();

    return this.prisma.region.findMany({
      where: { depth: 1 },
      orderBy: [{ sortOrder: 'asc' }, { code: 'asc' }],
    });
  }

  async listChildren(code: string) {
    await this.ensureSeeded();

    const parent = await this.prisma.region.findUnique({
      where: { code },
      select: { code: true },
    });

    if (!parent) {
      throw new NotFoundException('Region not found');
    }

    return this.prisma.region.findMany({
      where: {
        parentCode: code,
        depth: 2,
      },
      orderBy: [{ sortOrder: 'asc' }, { code: 'asc' }],
    });
  }
}
