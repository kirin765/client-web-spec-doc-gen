// developerMatcher — 규칙 기반 개발자 매칭: buildMatchingInput, scoreDeveloper, matchDevelopers.

import type { Answers, CostEstimate } from '@/types';
import type { DeveloperProfile, DeveloperMatchingInput, DeveloperMatchReason, DeveloperMatchResult } from '@/types/matching';

/**
 * 기존 견적 답변과 비용 결과에서 매칭에 필요한 최소 필드만 추출한다.
 */
export function buildMatchingInput(answers: Answers, costEstimate: CostEstimate): DeveloperMatchingInput {
  return {
    siteType: answers.siteType as string,
    coreFeatures: (answers.coreFeatures as string[]) || [],
    ecommerceFeatures: (answers.ecommerceFeatures as string[]) || [],
    designComplexity: answers.designComplexity as string,
    designStyle: answers.designStyle as string,
    desiredTimeline: answers.desiredTimeline as string,
    budgetRange: {
      min: costEstimate.totalMin,
      max: costEstimate.totalMax,
    },
  };
}

/**
 * 단일 개발자 프로필에 대해 100점 만점 스코어를 계산한다.
 * 배점:
 * - 사이트 유형: 30점
 * - 일반 기능: 25점
 * - 이커머스 기능: 10점
 * - 일정: 15점
 * - 예산: 10점
 * - 디자인: 10점
 */
function scoreDeveloper(input: DeveloperMatchingInput, developer: DeveloperProfile): { score: number; breakdown: Record<string, number> } {
  const breakdown: Record<string, number> = {
    siteType: 0,
    coreFeature: 0,
    ecommerceFeature: 0,
    timeline: 0,
    budget: 0,
    design: 0,
  };

  // 사이트 유형 적합도 (30점)
  if (developer.primarySiteTypes.includes(input.siteType)) {
    breakdown.siteType = 30;
  } else {
    breakdown.siteType = 0;
  }

  // 일반 기능 겹침 (25점)
  const matchedCoreFeatures = input.coreFeatures.filter((f) => developer.supportedCoreFeatures.includes(f)).length;
  const totalCoreFeatures = input.coreFeatures.length || 1;
  breakdown.coreFeature = (matchedCoreFeatures / totalCoreFeatures) * 25;

  // 이커머스 기능 겹침 (10점)
  if (input.siteType === 'ecommerce' && input.ecommerceFeatures.length > 0) {
    const matchedEcomFeatures = input.ecommerceFeatures.filter((f) => developer.supportedEcommerceFeatures.includes(f)).length;
    breakdown.ecommerceFeature = (matchedEcomFeatures / input.ecommerceFeatures.length) * 10;
  } else {
    breakdown.ecommerceFeature = 0;
  }

  // 일정 적합도 (15점)
  if (developer.supportedTimelines.includes(input.desiredTimeline)) {
    breakdown.timeline = 15;
  } else {
    breakdown.timeline = 0;
  }

  // 예산 적합도 (10점)
  const budgetMatch =
    input.budgetRange.min <= developer.budgetRange.max && input.budgetRange.max >= developer.budgetRange.min;
  breakdown.budget = budgetMatch ? 10 : 0;

  // 디자인 적합도 (10점)
  const designMatch =
    developer.supportedDesignStyles.includes(input.designStyle) &&
    developer.supportedDesignComplexities.includes(input.designComplexity);
  breakdown.design = designMatch ? 10 : 0;

  const totalScore = Math.min(
    100,
    breakdown.siteType + breakdown.coreFeature + breakdown.ecommerceFeature + breakdown.timeline + breakdown.budget + breakdown.design
  );

  return { score: totalScore, breakdown };
}

/**
 * UI 카드에 노출할 설명 가능한 매칭 사유를 생성한다.
 * 점수 기여도가 높은 이유 우선으로 정렬하여 최대 3개만 반환한다.
 */
function extractReasons(
  input: DeveloperMatchingInput,
  developer: DeveloperProfile,
  breakdown: Record<string, number>
): DeveloperMatchReason[] {
  const reasons: DeveloperMatchReason[] = [];

  // 사이트 유형
  if (breakdown.siteType > 0) {
    reasons.push({
      type: 'siteType',
      label: `${input.siteType} 전문가`,
      scoreContribution: breakdown.siteType,
      description: `${input.siteType} 유형 프로젝트를 많이 경험했습니다.`,
    });
  }

  // 일반 기능
  if (breakdown.coreFeature > 0) {
    const matchedFeatures = input.coreFeatures.filter((f) => developer.supportedCoreFeatures.includes(f));
    if (matchedFeatures.length > 0) {
      reasons.push({
        type: 'coreFeature',
        label: `필요 기능 지원`,
        scoreContribution: breakdown.coreFeature,
        description: `${matchedFeatures.join(', ')} 등의 기능을 구현한 경험이 있습니다.`,
      });
    }
  }

  // 이커머스 기능
  if (breakdown.ecommerceFeature > 0) {
    const matchedEcomFeatures = input.ecommerceFeatures.filter((f) => developer.supportedEcommerceFeatures.includes(f));
    if (matchedEcomFeatures.length > 0) {
      reasons.push({
        type: 'ecommerceFeature',
        label: `쇼핑몰 기능 지원`,
        scoreContribution: breakdown.ecommerceFeature,
        description: `${matchedEcomFeatures.join(', ')} 등의 쇼핑몰 기능을 구현한 경험이 있습니다.`,
      });
    }
  }

  // 일정
  if (breakdown.timeline > 0) {
    reasons.push({
      type: 'timeline',
      label: `일정 가능`,
      scoreContribution: breakdown.timeline,
      description: `${input.desiredTimeline} 일정의 프로젝트 경험이 충분합니다.`,
    });
  }

  // 예산
  if (breakdown.budget > 0) {
    reasons.push({
      type: 'budget',
      label: `예산 범위 적합`,
      scoreContribution: breakdown.budget,
      description: `귀사의 예산 범위 내에서 프로젝트를 진행할 수 있습니다.`,
    });
  }

  // 디자인
  if (breakdown.design > 0) {
    reasons.push({
      type: 'design',
      label: `디자인 스타일 경험`,
      scoreContribution: breakdown.design,
      description: `${input.designStyle} 스타일의 디자인 구현 경험이 있습니다.`,
    });
  }

  // 점수 기여도 순으로 정렬하고 상위 3개만 반환
  return reasons.sort((a, b) => b.scoreContribution - a.scoreContribution).slice(0, 3);
}

/**
 * 전체 개발자 목록을 순회해 점수화, 사유 추출, 정렬한다.
 * 반환: UI 표시용 상위 3명 (그러나 함수는 전체 정렬 결과를 반환 가능)
 */
export function matchDevelopers(input: DeveloperMatchingInput, developers: DeveloperProfile[]): DeveloperMatchResult[] {
  const results: DeveloperMatchResult[] = developers
    .map((developer) => {
      const { score, breakdown } = scoreDeveloper(input, developer);
      const reasons = extractReasons(input, developer, breakdown);
      const matchedFeatureCount = input.coreFeatures.filter((f) => developer.supportedCoreFeatures.includes(f)).length +
        input.ecommerceFeatures.filter((f) => developer.supportedEcommerceFeatures.includes(f)).length;

      return {
        developer,
        score,
        matchedFeatureCount,
        reasons,
        summary: reasons.length > 0 ? reasons[0].description : '일반적인 프로젝트 경험이 있습니다.',
      };
    })
    // 정렬: score 내림차순 → matchedFeatureCount 내림차순 → responseTimeHours 오름차순
    .sort((a, b) => {
      if (a.score !== b.score) return b.score - a.score;
      if (a.matchedFeatureCount !== b.matchedFeatureCount) return b.matchedFeatureCount - a.matchedFeatureCount;
      return a.developer.responseTimeHours - b.developer.responseTimeHours;
    });

  return results;
}
