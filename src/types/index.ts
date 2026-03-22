// =============================================================================
// 웹사이트 견적 자동 생성기 - 타입 정의
// =============================================================================

// -----------------------------------------------------------------------------
// 질문 플로우 관련 타입
// -----------------------------------------------------------------------------

/** 질문 유형: 단일선택 / 다중선택 / 범위슬라이더 / 텍스트입력 */
export type QuestionType = 'single-select' | 'multi-select' | 'range-slider' | 'text-input';

/** 가격 영향도 타입: base(기본단가 설정), add(금액 추가), multiply(승수 적용) */
export interface PricingImpact {
  type: 'base' | 'add' | 'multiply';
  // 'base'     → baseTiers에서 해당 tier를 선택
  // 'add'      → KRW 금액을 총액에 추가
  // 'multiply' → 총액에 배수를 적용
  value: number;
  category: string; // 비용 분해표에서의 그룹명 (예: "기본", "기능", "디자인", "일정")
}

/** 질문의 개별 선택지 */
export interface QuestionOption {
  id: string;              // 예: "ecommerce"
  labelKey: string;        // i18n 키: "questions.siteType.options.ecommerce"
  descriptionKey?: string; // 선택지 설명 i18n 키
  icon?: string;           // Lucide 아이콘 이름
  pricingImpact: PricingImpact;
}

/** 개별 질문 정의 */
export interface Question {
  id: string;              // 예: "siteType"
  categoryId: string;      // 소속 카테고리 (위저드 스텝과 매핑)
  type: QuestionType;
  labelKey: string;        // 질문 텍스트 i18n 키
  descriptionKey?: string; // 질문 보충 설명 i18n 키
  options?: QuestionOption[];  // select 유형에서 사용
  validation?: {
    required?: boolean;
    min?: number;          // range-slider 최솟값
    max?: number;          // range-slider 최댓값
  };
  conditionalOn?: {        // 조건부 표시: 특정 질문의 답변에 따라 표시/숨김
    questionId: string;
    values: string[];      // 이 값들 중 하나가 선택되었을 때만 표시
  };
  pricingImpact?: PricingImpact; // 가격 영향도 (text-input, range-slider용)
}

/** 질문 카테고리 = 위저드의 한 스텝 */
export interface QuestionCategory {
  id: string;              // 예: "basics"
  labelKey: string;        // 카테고리 제목 i18n 키
  icon: string;            // Lucide 아이콘 이름
  questions: Question[];
}

// -----------------------------------------------------------------------------
// 비용 산정 관련 타입
// -----------------------------------------------------------------------------

/** 사이트 유형별 기본 단가 */
export interface BaseTier {
  id: string;              // "landing", "brochure", "ecommerce", "webapp", "blog"
  labelKey: string;
  minCost: number;         // KRW 최소
  maxCost: number;         // KRW 최대
}

/** 비용 분해 항목 (결과 페이지에서 항목별로 표시) */
export interface CostBreakdownItem {
  category: string;        // "기본", "기능", "디자인", "일정"
  label: string;           // 표시 텍스트
  minAmount: number;
  maxAmount: number;
}

/** 최종 비용 견적 결과 */
export interface CostEstimate {
  baseTier: BaseTier;
  featureAdditions: CostBreakdownItem[];
  designMultiplier: number;   // 1.0 / 1.3 / 1.6
  timelineMultiplier: number; // 1.0 / 1.3 / 1.6
  totalMin: number;
  totalMax: number;
  breakdown: CostBreakdownItem[];
}

// -----------------------------------------------------------------------------
// 요구사항 문서 관련 타입
// -----------------------------------------------------------------------------

/** 페이지 명세 */
export interface PageSpec {
  name: string;
  description: string;
}

/** 기능 명세 */
export interface FeatureSpec {
  name: string;
  description: string;
}

/** 자동 생성되는 요구사항 명세서 데이터 구조 */
export interface RequirementsDocument {
  generatedAt: string;        // ISO 날짜

  clientInfo: {
    projectName: string;
    contactName?: string;
    contactEmail?: string;
  };

  projectOverview: {
    siteType: string;         // 사이트 유형 한글명
    description: string;
    targetAudience: string;
  };

  scopeOfWork: {
    pages: PageSpec[];
    features: FeatureSpec[];
    integrations: string[];
  };

  designRequirements: {
    complexity: string;       // 템플릿/커스텀/프리미엄
    style: string;            // 미니멀/기업적/크리에이티브/럭셔리
    responsiveTargets: string[];
  };

  timeline: {
    urgency: string;          // 여유/표준/긴급/초긴급
    estimatedWeeks: { min: number; max: number };
  };

  costEstimate: CostEstimate;
  additionalNotes: string;
}

// -----------------------------------------------------------------------------
// Zustand 스토어 타입
// -----------------------------------------------------------------------------

/** 사용자 답변을 담는 맵: questionId → 선택된 값(들) */
export type Answers = Record<string, string | string[] | number>;

/** 전역 상태 스토어 인터페이스 */
export interface QuoteStore {
  // 위저드 상태
  currentStep: number;
  answers: Answers;

  // 액션
  setCurrentStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  setAnswer: (questionId: string, value: string | string[] | number) => void;
  resetQuote: () => void;
}
