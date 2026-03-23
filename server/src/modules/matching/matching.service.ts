// [수정필요 C3] extractReasons()가 { score }를 받지만 실제로는 projectType, coreFeatures 등 키를 가진 breakdown 객체를 기대함.
//   scoreDeveloper()가 breakdown을 반환하도록 하고, extractReasons()에 전달해야 함.
// [수정필요 C8] updateMatchStatus()에서 소문자 status('contacted')를 저장하지만 Prisma enum은 대문자('CONTACTED')를 기대함.
//   normalizeEnumFromApi() 또는 .toUpperCase() 적용 필요.
// [수정필요 M1] matchResults: any[] — 적절한 타입 정의 필요.
// [수정필요 M2] C8과 동일한 enum 대소문자 문제.
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/db/prisma.service';
import type { NormalizedSpec } from '../../types/answers';
import {
  normalizeEnumFromApi,
  normalizeEnumToApi,
} from '../../common/utils/enum-normalizer';

interface DeveloperProfile {
  id: string;
  displayName: string;
  supportedProjectTypes: string[];
  supportedCoreFeatures: string[];
  supportedEcommerceFeatures: string[];
  supportedDesignStyles: string[];
  supportedDesignComplexities: string[];
  supportedTimelines: string[];
  budgetMin: number;
  budgetMax: number;
  availabilityStatus: string;
  avgResponseHours: number;
  [key: string]: unknown;
}

interface MatchReason {
  type: 'siteType' | 'coreFeature' | 'ecommerceFeature' | 'timeline' | 'budget' | 'design';
  label: string;
  scoreContribution: number;
  description: string;
}

interface MatchRecord {
  projectRequestId: string;
  developerId: string;
  score: number;
  reasons: MatchReason[];
  status: 'SUGGESTED';
}

@Injectable()
export class MatchingService {
  private readonly MIN_MATCH_SCORE = 30;
  private readonly MAX_TOP_DEVELOPERS = 5;

  constructor(private prisma: PrismaService) {}

  async executeMatching(projectRequestId: string): Promise<any> {
    const projectRequest = await this.prisma.projectRequest.findUnique({
      where: { id: projectRequestId },
    });

    if (!projectRequest) {
      throw new NotFoundException(`Project request ${projectRequestId} not found`);
    }

    if (!projectRequest.normalizedSpec) {
      throw new BadRequestException('Project has no normalized spec for matching');
    }

    await this.prisma.projectRequest.update({
      where: { id: projectRequestId },
      data: { status: 'MATCHING' },
    });

    const normalizedSpec = projectRequest.normalizedSpec as unknown as NormalizedSpec;

    const developers = await this.prisma.developer.findMany({
      where: { active: true },
    });

    const matchResults: MatchRecord[] = [];

    for (const developer of developers) {
      const { score, breakdown } = this.scoreDeveloper(
        normalizedSpec,
        developer as unknown as DeveloperProfile,
      );

      if (score >= this.MIN_MATCH_SCORE) {
        const reasons = this.extractReasons(
          normalizedSpec,
          developer as unknown as DeveloperProfile,
          breakdown,
        );

        matchResults.push({
          projectRequestId,
          developerId: developer.id,
          score,
          reasons,
          status: 'SUGGESTED',
        });
      }
    }

    matchResults.sort((a, b) => b.score - a.score);
    const topMatches = matchResults.slice(0, this.MAX_TOP_DEVELOPERS);

    const savedMatches = await Promise.all(
      topMatches.map((match) =>
        this.prisma.matchResult.create({
          data: match as any,
        }),
      ),
    );

    await this.prisma.projectRequest.update({
      where: { id: projectRequestId },
      data: { status: 'COMPLETED' },
    });

    return savedMatches.map((match) => this.mapMatchResult(match));
  }

  scoreDeveloper(normalizedSpec: NormalizedSpec, developer: DeveloperProfile): { score: number; breakdown: Record<string, number> } {
    let score = 0;
    const breakdown: Record<string, number> = {};

    // projectType 일치: +30점
    if (developer.supportedProjectTypes && normalizedSpec.projectType) {
      if (developer.supportedProjectTypes.includes(normalizedSpec.projectType)) {
        score += 30;
        breakdown.projectType = 30;
      }
    }

    // 기능 겹침: +25점
    const matchedCoreFeatures =
      normalizedSpec.scope.featureSet?.filter((f) =>
        developer.supportedCoreFeatures?.includes(f),
      ) || [];
    if (matchedCoreFeatures.length > 0) {
      score += Math.min(25, matchedCoreFeatures.length * 8);
      breakdown.coreFeatures = Math.min(25, matchedCoreFeatures.length * 8);
    }

    // 일정 수용: +15점
    if (
      normalizedSpec.delivery.urgency &&
      developer.supportedTimelines?.includes(normalizedSpec.delivery.urgency)
    ) {
      score += 15;
      breakdown.timeline = 15;
    }

    // 예산 적합: +10점
    if (
      normalizedSpec.budget?.min &&
      normalizedSpec.budget?.max &&
      developer.budgetMin <= normalizedSpec.budget.max &&
      developer.budgetMax >= normalizedSpec.budget.min
    ) {
      score += 10;
      breakdown.budget = 10;
    }

    // 디자인 스타일: +10점
    if (
      normalizedSpec.scope.designStyle &&
      developer.supportedDesignStyles?.includes(normalizedSpec.scope.designStyle)
    ) {
      score += 10;
      breakdown.design = 10;
    }

    // 디자인 복잡도: +10점
    if (
      normalizedSpec.scope.designTier &&
      developer.supportedDesignComplexities?.includes(normalizedSpec.scope.designTier)
    ) {
      score += 10;
      breakdown.complexity = 10;
    }

    return { score, breakdown };
  }

  extractReasons(
    normalizedSpec: NormalizedSpec,
    developer: DeveloperProfile,
    breakdown: Record<string, number>,
  ): MatchReason[] {
    const reasons: MatchReason[] = [];

    // projectType 일치
    if (breakdown.projectType) {
      reasons.push({
        type: 'siteType',
        label: normalizedSpec.projectType || 'Project Type',
        scoreContribution: breakdown.projectType,
        description: `${developer.displayName}는 ${normalizedSpec.projectType} 프로젝트 경험이 있습니다`,
      });
    }

    // 기능 겹침
    if (breakdown.coreFeatures) {
      const matchedFeatures =
        normalizedSpec.scope.featureSet?.filter((f) =>
          developer.supportedCoreFeatures?.includes(f),
        ) || [];
      reasons.push({
        type: 'coreFeature',
        label: 'Core Features',
        scoreContribution: breakdown.coreFeatures,
        description: `${matchedFeatures.length}개의 필수 기능을 지원합니다`,
      });
    }

    // 일정
    if (breakdown.timeline) {
      reasons.push({
        type: 'timeline',
        label: 'Timeline',
        scoreContribution: breakdown.timeline,
        description: `${normalizedSpec.delivery.urgency} 일정 조율이 가능합니다`,
      });
    }

    // 예산
    if (breakdown.budget) {
      reasons.push({
        type: 'budget',
        label: 'Budget Match',
        scoreContribution: breakdown.budget,
        description: '귀사의 예산 범위와 맞습니다',
      });
    }

    // 디자인
    if (breakdown.design) {
      reasons.push({
        type: 'design',
        label: 'Design Style',
        scoreContribution: breakdown.design,
        description: `${normalizedSpec.scope.designStyle} 스타일을 선호합니다`,
      });
    }

    // 복잡도
    if (breakdown.complexity) {
      reasons.push({
        type: 'design',
        label: 'Design Complexity',
        scoreContribution: breakdown.complexity,
        description: `${normalizedSpec.scope.designTier} 복잡도의 프로젝트를 경험했습니다`,
      });
    }

    reasons.sort((a, b) => b.scoreContribution - a.scoreContribution);
    return reasons.slice(0, 3);
  }

  async getMatches(projectRequestId: string): Promise<any> {
    const matches = await this.prisma.matchResult.findMany({
      where: { projectRequestId },
      orderBy: { score: 'desc' },
      include: {
        developer: true,
      },
    });

    if (matches.length === 0) {
      throw new NotFoundException(`No matches found for project ${projectRequestId}`);
    }

    return matches.map((match) => this.mapMatchResult(match));
  }

  async updateMatchStatus(matchId: string, status: 'contacted' | 'accepted' | 'rejected'): Promise<any> {
    const match = await this.prisma.matchResult.findUnique({ where: { id: matchId } });

    if (!match) {
      throw new NotFoundException(`Match ${matchId} not found`);
    }

    if (!['contacted', 'accepted', 'rejected'].includes(status)) {
      throw new BadRequestException(`Invalid status: ${status}`);
    }

    const prismaStatus = normalizeEnumFromApi(status);

    const updated = await this.prisma.matchResult.update({
      where: { id: matchId },
      data: { status: prismaStatus as any },
    });

    return this.mapMatchResult(updated);
  }

  private mapMatchResult(match: any) {
    return {
      ...match,
      status: normalizeEnumToApi(match.status),
      createdAt: match.createdAt instanceof Date ? match.createdAt.toISOString() : match.createdAt,
      developer: match.developer
        ? {
            ...match.developer,
            type: normalizeEnumToApi(match.developer.type),
            availabilityStatus: normalizeEnumToApi(match.developer.availabilityStatus),
            createdAt:
              match.developer.createdAt instanceof Date
                ? match.developer.createdAt.toISOString()
                : match.developer.createdAt,
            updatedAt:
              match.developer.updatedAt instanceof Date
                ? match.developer.updatedAt.toISOString()
                : match.developer.updatedAt,
          }
        : undefined,
    };
  }
}
