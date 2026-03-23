// [수정 필요 - C5] NormalizedSpec 필드 참조가 모두 잘못되어 데이터를 읽지 못함
// - normalizedSpec.siteType → normalizedSpec.projectType으로 변경
// - normalizedSpec.timeline → normalizedSpec.delivery.urgency으로 변경
// - normalizedSpec.design?.style → normalizedSpec.scope.designStyle으로 변경
// - normalizedSpec.features → normalizedSpec.scope.featureSet으로 변경
// - normalizedSpec.integrations → normalizedSpec.scope.integrations으로 변경
// - normalizedSpec.description → normalizedSpec.targetAudience 또는 적절한 필드로 변경
// - 파라미터 타입을 any에서 NormalizedSpec으로 변경하여 타입 안전성 확보

import type { RequirementsDocument } from '../../types/requirements-document';
import type { CostEstimate } from '../../types/cost-estimate';
import type { NormalizedSpec } from '../../types/answers';

const SITE_TYPE_LABELS: Record<string, string> = {
  landing: '랜딩페이지',
  brochure: '브로슈어',
  ecommerce: '이커머스',
  webapp: '웹 애플리케이션',
  blog: '블로그',
};

const FEATURE_DESCRIPTIONS: Record<string, string> = {
  auth: '사용자 인증 및 회원 관리',
  adminPanel: '관리자 대시보드 및 콘텐츠 관리',
  payment: '결제 시스템 통합',
  search: '고급 검색 기능',
  analytics: '분석 및 통계',
  notification: '알림 시스템',
  api: 'REST API 제공',
  mobileApp: '모바일 앱 연동',
};

const TIMELINE_LABELS: Record<string, { min: number; max: number }> = {
  urgent: { min: 2, max: 4 },
  high: { min: 4, max: 8 },
  medium: { min: 8, max: 12 },
  low: { min: 12, max: 20 },
};

const DESIGN_LABELS: Record<string, string> = {
  template: '템플릿 기반',
  custom: '커스텀 디자인',
  premium: '프리미엄 디자인',
};

export function generateRequirementsDocument(
  normalizedSpec: NormalizedSpec,
  costEstimate: CostEstimate,
  rawAnswers?: Record<string, any>,
): RequirementsDocument {
  const projectType = normalizedSpec.projectType || 'landing';
  const projectName = rawAnswers?.projectName || '(프로젝트명 미정)';
  const urgency = normalizedSpec.delivery.urgency || 'medium';
  const designTier = normalizedSpec.scope.designTier || 'template';
  const features = normalizedSpec.scope.featureSet || [];
  const pageCount = normalizedSpec.scope.pageCount || 5;

  const pages = [
    {
      name: '홈페이지',
      description: '프로젝트의 진입점. 메인 콘텐츠 및 네비게이션 제공',
    },
  ];

  if (projectType === 'ecommerce') {
    pages.push(
      { name: '상품 목록', description: '모든 상품의 목록 표시 및 필터링' },
      { name: '상품 상세', description: '개별 상품의 상세 정보 및 리뷰' },
      { name: '장바구니', description: '선택한 상품 관리 및 결제 준비' },
    );
  }

  const scopeFeatures = features.map((f: string) => ({
    name: f,
    description: FEATURE_DESCRIPTIONS[f] || f,
  }));

  const integrations = normalizedSpec.scope.integrations || [];
  const estimatedWeeks = TIMELINE_LABELS[urgency] || TIMELINE_LABELS.medium;

  const document: RequirementsDocument = {
    generatedAt: new Date().toISOString(),

    clientInfo: {
      projectName,
      contactName: rawAnswers?.contactName,
      contactEmail: rawAnswers?.contactEmail,
    },

    projectOverview: {
      siteType: SITE_TYPE_LABELS[projectType] || projectType,
      description: rawAnswers?.projectDescription || `${projectName} 개발 프로젝트`,
      targetAudience: rawAnswers?.targetAudience || '(타겟 오디언스 미정)',
    },

    scopeOfWork: {
      pages,
      features: scopeFeatures,
      integrations,
    },

    designRequirements: {
      complexity: DESIGN_LABELS[designTier] || designTier,
      style: normalizedSpec.scope.designStyle || 'modern',
      responsiveTargets: ['Desktop', 'Tablet', 'Mobile'],
    },

    timeline: {
      urgency,
      estimatedWeeks,
    },

    costEstimate,
    additionalNotes: '이 문서는 프로젝트의 기초 요구사항을 정리한 것입니다. 최종 견적은 상세 협의 후 확정됩니다.',
  };

  return document;
}
