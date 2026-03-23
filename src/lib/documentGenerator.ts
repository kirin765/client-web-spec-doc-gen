// documentGenerator — answers + costEstimate → RequirementsDocument 변환.

import type { Answers, CostEstimate, RequirementsDocument, PageSpec, FeatureSpec } from '@/types';

// 페이지별 기본 설명 매핑
const pageDescriptions: Record<string, string> = {
  home: '사이트의 메인 페이지로 주요 콘텐츠와 네비게이션을 포함합니다.',
  about: '회사 소개 페이지로 미션, 비전, 팀 정보 등을 포함합니다.',
  services: '제공하는 서비스 및 상품을 소개하는 페이지입니다.',
  portfolio: '이전 프로젝트 및 사례를 전시하는 페이지입니다.',
  contact: '고객 문의를 위한 연락처 및 문의 폼 페이지입니다.',
  blog: '뉴스, 블로그 포스트, 업데이트를 게시하는 페이지입니다.',
  productList: '판매 상품의 목록을 표시하는 페이지입니다.',
  productDetail: '개별 상품의 상세 정보를 표시하는 페이지입니다.',
  cart: '장바구니 관리 페이지입니다.',
  checkout: '결제 진행 페이지입니다.',
  dashboard: '사용자 대시보드 및 관리 화면입니다.',
  faq: '자주 묻는 질문과 답변 페이지입니다.',
  login: '로그인 및 회원가입 페이지입니다.',
};

// 기능별 기본 설명 매핑
const featureDescriptions: Record<string, string> = {
  contactForm: '방문자가 문의할 수 있는 연락처 폼을 제공합니다.',
  search: '사이트 내 콘텐츠를 검색할 수 있는 기능을 제공합니다.',
  auth: '회원 가입, 로그인, 인증 기능을 제공합니다.',
  payment: '온라인 결제 기능을 제공합니다.',
  adminPanel: '관리자 대시보드 및 콘텐츠 관리 시스템을 제공합니다.',
  fileUpload: '사용자 파일 업로드 기능을 제공합니다.',
  chat: '실시간 채팅 기능을 제공합니다.',
  socialIntegration: '소셜 미디어 계정 연동 기능을 제공합니다.',
  multiLanguage: '다국어 지원 기능을 제공합니다.',
  analyticsDashboard: '트래픽 및 사용 통계 대시보드를 제공합니다.',
  booking: '일정 예약 기능을 제공합니다.',
  mapIntegration: '지도 표시 기능을 제공합니다.',
  productManagement: '상품 추가, 수정, 삭제 관리 기능을 제공합니다.',
  inventory: '재고 관리 시스템을 제공합니다.',
  orderTracking: '주문 추적 기능을 제공합니다.',
  couponSystem: '쿠폰 및 할인 시스템을 제공합니다.',
  reviewSystem: '상품 리뷰 및 평점 시스템을 제공합니다.',
};

// 사이트 유형별 한글 레이블
const siteTypeLabels: Record<string, string> = {
  landing: '랜딩 페이지',
  brochure: '브로셔 사이트',
  ecommerce: '전자상거래 사이트',
  webapp: '웹 애플리케이션',
  blog: '블로그',
};

// 디자인 복잡도 한글 레이블
const designComplexityLabels: Record<string, string> = {
  template: '템플릿 기반',
  custom: '커스텀 디자인',
  premium: '프리미엄 디자인',
};

// 디자인 스타일 한글 레이블
const designStyleLabels: Record<string, string> = {
  minimal: '미니멀',
  corporate: '기업적',
  creative: '크리에이티브',
  luxury: '럭셔리',
};

// 일정 한글 레이블 및 추정 기간
const timelineLabels: Record<string, { label: string; weeks: { min: number; max: number } }> = {
  flexible: { label: '여유 있음 (8주+)', weeks: { min: 8, max: 16 } },
  standard: { label: '표준 (4-8주)', weeks: { min: 4, max: 8 } },
  urgent: { label: '긴급 (2-4주)', weeks: { min: 2, max: 4 } },
  rush: { label: '초긴급 (<2주)', weeks: { min: 1, max: 2 } },
};

export function generateDocument(
  answers: Answers,
  costEstimate: CostEstimate
): RequirementsDocument {
  // 1. 클라이언트 정보
  const projectName = (answers.projectName as string) || '';

  // 2. 프로젝트 개요
  const siteTypeId = (answers.siteType as string) || '';
  const siteType = siteTypeLabels[siteTypeId] || siteTypeId;
  const targetAudience = (answers.targetAudience as string) || '';

  // 3. 작업 범위 - 페이지 명세
  const requiredPages = (answers.requiredPages as string[]) || [];
  const pages: PageSpec[] = requiredPages.map((pageId) => ({
    name: pageId.charAt(0).toUpperCase() + pageId.slice(1),
    description: pageDescriptions[pageId] || '',
  }));

  // 3. 작업 범위 - 기능 명세
  const coreFeatures = (answers.coreFeatures as string[]) || [];
  const ecommerceFeatures = (answers.ecommerceFeatures as string[]) || [];
  const allFeatures = [...coreFeatures, ...ecommerceFeatures];
  const features: FeatureSpec[] = allFeatures.map((featureId) => ({
    name: featureId.charAt(0).toUpperCase() + featureId.slice(1),
    description: featureDescriptions[featureId] || '',
  }));

  // 3. 작업 범위 - 통합 서비스
  const externalIntegrations = (answers.externalIntegrations as string[]) || [];

  // 4. 디자인 요구사항
  const designComplexityId = (answers.designComplexity as string) || '';
  const complexity = designComplexityLabels[designComplexityId] || designComplexityId;
  const designStyleId = (answers.designStyle as string) || '';
  const style = designStyleLabels[designStyleId] || designStyleId;
  const responsiveTargets = (answers.responsiveTargets as string[]) || [];

  // 5. 일정
  const desiredTimelineId = (answers.desiredTimeline as string) || '';
  const timelineInfo = timelineLabels[desiredTimelineId] || { label: '', weeks: { min: 4, max: 8 } };
  const urgency = timelineInfo.label;
  const estimatedWeeks = timelineInfo.weeks;

  // 6. 추가 메모
  const additionalNotes = (answers.additionalNotes as string) || '';

  return {
    generatedAt: new Date().toISOString(),
    clientInfo: { projectName },
    projectOverview: {
      siteType,
      description: `${projectName}는 ${siteType}으로 구축됩니다.`,
      targetAudience,
    },
    scopeOfWork: { pages, features, integrations: externalIntegrations },
    designRequirements: { complexity, style, responsiveTargets },
    timeline: { urgency, estimatedWeeks },
    costEstimate,
    additionalNotes,
  };
}
