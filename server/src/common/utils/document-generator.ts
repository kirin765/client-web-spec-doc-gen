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
  contactForm: '문의 및 상담 요청 폼',
  socialIntegration: '소셜 채널 연동',
  auth: '사용자 인증 및 회원 관리',
  adminPanel: '관리자 대시보드 및 콘텐츠 관리',
  payment: '결제 시스템 통합',
  search: '고급 검색 기능',
  analytics: '분석 및 통계',
  fileUpload: '파일 업로드 및 자산 관리',
  chat: '실시간 채팅 및 커뮤니케이션',
  multiLanguage: '다국어 지원',
  analyticsDashboard: '운영 분석 대시보드',
  booking: '예약 및 일정 관리',
  mapIntegration: '지도 및 위치 기반 기능',
  productManagement: '상품 관리 시스템',
  inventory: '재고 관리',
  orderTracking: '주문 및 배송 추적',
  couponSystem: '쿠폰 및 프로모션 관리',
  reviewSystem: '리뷰 및 평점 관리',
};

const TIMELINE_LABELS: Record<string, { min: number; max: number }> = {
  rush: { min: 1, max: 2 },
  urgent: { min: 2, max: 4 },
  standard: { min: 4, max: 8 },
  flexible: { min: 8, max: 16 },
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
  const projectName =
    (typeof rawAnswers?.projectName === 'string' && rawAnswers.projectName) ||
    normalizedSpec.projectName ||
    '(프로젝트명 미정)';
  const urgency = normalizedSpec.delivery?.urgency || 'standard';
  const designTier = normalizedSpec.scope?.designTier || 'template';
  const features = [
    ...(normalizedSpec.scope?.featureSet || []),
    ...((projectType === 'ecommerce'
      ? normalizedSpec.scope?.ecommerceFeatureSet || []
      : []) as string[]),
  ];
  const pageCount = normalizedSpec.scope?.pageCount || 5;

  const pages = buildPages(projectType, pageCount);

  const scopeFeatures = features.map((f: string) => ({
    name: f,
    description: FEATURE_DESCRIPTIONS[f] || f,
  }));

  const integrations = normalizedSpec.scope?.integrations || [];
  const estimatedWeeks = TIMELINE_LABELS[urgency] || TIMELINE_LABELS.standard;

  const document: RequirementsDocument = {
    generatedAt: new Date().toISOString(),

    clientInfo: {
      projectName,
      contactName: rawAnswers?.contactName,
      contactEmail: rawAnswers?.contactEmail,
    },

    projectOverview: {
      siteType: SITE_TYPE_LABELS[projectType] || projectType,
      description:
        (typeof rawAnswers?.projectDescription === 'string' &&
          rawAnswers.projectDescription) ||
        `${projectName} 개발 프로젝트`,
      targetAudience:
        (typeof rawAnswers?.targetAudience === 'string' &&
          rawAnswers.targetAudience) ||
        normalizedSpec.targetAudience ||
        '(타겟 오디언스 미정)',
    },

    scopeOfWork: {
      pages,
      features: scopeFeatures,
      integrations,
    },

    designRequirements: {
      complexity: DESIGN_LABELS[designTier] || designTier,
      style: normalizedSpec.scope?.designStyle || 'modern',
      responsiveTargets: ['Desktop', 'Tablet', 'Mobile'],
    },

    timeline: {
      urgency,
      estimatedWeeks,
    },

    costEstimate,
    additionalNotes:
      '이 문서는 프로젝트의 기초 요구사항을 정리한 것입니다. 최종 견적은 상세 협의 후 확정됩니다.',
  };

  return document;
}

function buildPages(projectType: string, pageCount: number) {
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
      { name: '결제', description: '주문 및 결제를 완료하는 페이지' },
    );
  } else if (projectType === 'webapp') {
    pages.push(
      { name: '로그인', description: '인증 및 계정 접근을 위한 페이지' },
      { name: '대시보드', description: '핵심 데이터를 확인하고 작업하는 메인 화면' },
    );
  } else if (projectType === 'blog') {
    pages.push(
      { name: '포스트 목록', description: '콘텐츠 목록과 카테고리를 탐색하는 페이지' },
      { name: '포스트 상세', description: '개별 글과 관련 콘텐츠를 보여주는 페이지' },
    );
  } else if (projectType === 'brochure') {
    pages.push(
      { name: '회사 소개', description: '브랜드, 비전, 핵심 가치를 소개하는 페이지' },
      { name: '서비스 소개', description: '주요 서비스 및 강점을 설명하는 페이지' },
      { name: '문의', description: '상담 요청과 연락처 정보를 제공하는 페이지' },
    );
  }

  while (pages.length < pageCount) {
    pages.push({
      name: `추가 페이지 ${pages.length + 1}`,
      description: '상세 기획 단계에서 정의될 페이지입니다.',
    });
  }

  return pages.slice(0, Math.max(pageCount, 1));
}
