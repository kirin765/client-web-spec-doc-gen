// =============================================================================
// 문서 생성기 — answers → RequirementsDocument 변환
// =============================================================================
//
// TODO 구현 사항:
// 이 파일의 핵심은 generateDocument() 함수.
// 입력: Answers (사용자 답변), CostEstimate (계산된 비용)
// 출력: RequirementsDocument (PDF/HTML 렌더링용 구조화 데이터)
//
// 변환 흐름:
// 1. clientInfo 구성
//    - answers.projectName → clientInfo.projectName
//    - generatedAt: new Date().toISOString()
//
// 2. projectOverview 구성
//    - answers.siteType → 한글 레이블로 변환 (i18n 키 또는 직접 매핑)
//    - answers.targetAudience → targetAudience
//
// 3. scopeOfWork 구성
//    - answers.requiredPages (string[]) → PageSpec[] 배열
//      각 페이지에 name, description 매핑 (페이지별 기본 설명 템플릿 필요)
//    - answers.features + answers.ecommerceFeatures → FeatureSpec[] 배열
//      각 기능에 name, description 매핑 (기능별 기본 설명 템플릿 필요)
//    - answers.integrations → string[] 그대로
//
// 4. designRequirements 구성
//    - answers.designComplexity → complexity 한글명
//    - answers.designStyle → style 한글명
//    - answers.responsiveTargets → responsiveTargets
//
// 5. timeline 구성
//    - answers.timeline → urgency 한글명
//    - urgency에 따른 estimatedWeeks 범위 산출:
//      flexible: { min: 8, max: 16 }
//      standard: { min: 4, max: 8 }
//      urgent: { min: 2, max: 4 }
//      rush: { min: 1, max: 2 }
//
// 6. costEstimate: calculateCost() 결과를 그대로 포함
//
// 7. additionalNotes: answers.additionalNotes 또는 빈 문자열
// =============================================================================

import type { Answers, CostEstimate, RequirementsDocument } from '@/types';

export function generateDocument(
  _answers: Answers,
  _costEstimate: CostEstimate
): RequirementsDocument {
  // TODO: 위 흐름대로 구현

  return {
    generatedAt: new Date().toISOString(),
    clientInfo: { projectName: '' },
    projectOverview: { siteType: '', description: '', targetAudience: '' },
    scopeOfWork: { pages: [], features: [], integrations: [] },
    designRequirements: { complexity: '', style: '', responsiveTargets: [] },
    timeline: { urgency: '', estimatedWeeks: { min: 0, max: 0 } },
    costEstimate: _costEstimate,
    additionalNotes: '',
  };
}
