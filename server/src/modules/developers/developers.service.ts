// DevelopersService — create, update, search, updateAvailability, getActiveDevelopers, getById 구현.
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/db/prisma.service';

@Injectable()
export class DevelopersService {
  constructor(private prisma: PrismaService) {}

  async create(data: any) {
    return this.prisma.developer.create({
      data: {
        ...data,
        active: false, // Require admin approval
      },
    });
  }

  async update(id: string, data: any) {
    return this.prisma.developer.update({
      where: { id },
      data,
    });
  }

  async getById(id: string) {
    const developer = await this.prisma.developer.findUnique({
      where: { id },
    });

    if (!developer) {
      throw new NotFoundException('Developer not found');
    }

    return developer;
  }

  async getActiveDevelopers() {
    return this.prisma.developer.findMany({
      where: {
        active: true,
        availabilityStatus: {
          not: 'BUSY',
        },
      },
    });
  }

  async search(filters: any) {
    return this.prisma.developer.findMany({
      where: {
        active: true,
        ...filters,
      },
    });
  }

  async updateAvailability(id: string, status: 'AVAILABLE' | 'BUSY' | 'LIMITED') {
    return this.prisma.developer.update({
      where: { id },
      data: { availabilityStatus: status },
    });
  }
}
