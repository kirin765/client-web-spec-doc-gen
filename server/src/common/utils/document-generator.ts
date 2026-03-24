import type { RequirementsDocument } from '../../types/requirements-document';
import type { CostEstimate } from '../../types/cost-estimate';

const SITE_TYPE_LABELS: Record<string, string> = {
  landing: '랜딩페이지',
  ecommerce: '이커머스',
  corporate: '기업 사이트',
  portal: '포탈/커뮤니티',
};

const FEATURE_DESCRIPTIONS: Record<string, string> = {
  authentication: '사용자 인증 및 회원 관리',
  admin_cms: '관리자 대시보드 및 콘텐츠 관리',
  payment: '결제 시스템 통합',
  search: '고급 검색 기능',
  analytics: '분석 및 통계',
  notification: '알림 시스템',
  api: 'REST API 제공',
  mobile_app: '모바일 앱 연동',
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
  normalizedSpec: any,
  costEstimate: CostEstimate,
  rawAnswers?: Record<string, any>,
): RequirementsDocument {
  const siteType = normalizedSpec.siteType || 'landing';
  const projectName = normalizedSpec.projectName || '(프로젝트명 미정)';
  const timeline = normalizedSpec.timeline || 'medium';
  const designStyle = normalizedSpec.design?.style || 'template';
  const features = normalizedSpec.features || [];

  const pages = [
    {
      name: '홈페이지',
      description: '프로젝트의 진입점. 메인 콘텐츠 및 네비게이션 제공',
    },
  ];

  if (siteType === 'ecommerce') {
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

  const integrations = normalizedSpec.integrations || [];
  const estimatedWeeks = TIMELINE_LABELS[timeline] || TIMELINE_LABELS.medium;

  const document: RequirementsDocument = {
    generatedAt: new Date().toISOString(),

    clientInfo: {
      projectName,
      contactName: rawAnswers?.contactName,
      contactEmail: rawAnswers?.contactEmail,
    },

    projectOverview: {
      siteType: SITE_TYPE_LABELS[siteType] || siteType,
      description: normalizedSpec.description || `${projectName} 개발 프로젝트`,
      targetAudience: normalizedSpec.targetAudience || '(타겟 오디언스 미정)',
    },

    scopeOfWork: {
      pages,
      features: scopeFeatures,
      integrations,
    },

    designRequirements: {
      complexity: DESIGN_LABELS[designStyle] || designStyle,
      style: normalizedSpec.design?.style || 'modern',
      responsiveTargets: ['Desktop', 'Tablet', 'Mobile'],
    },

    timeline: {
      urgency: timeline,
      estimatedWeeks,
    },

    costEstimate,
    additionalNotes: '이 문서는 프로젝트의 기초 요구사항을 정리한 것입니다. 최종 견적은 상세 협의 후 확정됩니다.',
  };

  return document;
}
