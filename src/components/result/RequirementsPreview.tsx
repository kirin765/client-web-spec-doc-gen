// =============================================================================
// RequirementsPreview — 요구사항 명세서 HTML 미리보기
// =============================================================================
//
// TODO 구현 사항:
// 1. props로 RequirementsDocument를 받음
//
// 2. 섹션별 HTML 렌더링 (스크롤 가능한 미리보기):
//    a. 표지: 프로젝트명, 생성일, "웹사이트 요구사항 명세서" 제목
//    b. 프로젝트 개요: 사이트 유형, 목적, 타겟 고객
//    c. 작업 범위:
//       - 페이지 목록 (이름 + 설명 테이블)
//       - 기능 목록 (이름 + 설명 테이블)
//       - 외부 연동 서비스 목록
//    d. 디자인 요구사항: 복잡도, 스타일, 반응형 대상
//    e. 기능 명세: 선택된 각 기능의 상세 설명
//    f. 연동 및 인프라: 호스팅, 외부 서비스
//    g. 일정: 긴급도, 예상 주수
//    h. 예상 비용: CostSummary와 동일한 분해표
//    i. 다음 단계: 표준 안내 텍스트
//
// 3. 인쇄 스타일 고려 (print-friendly CSS)
// 4. 스타일: prose 클래스 활용, 섹션 간 구분선
// =============================================================================

import type { RequirementsDocument } from '@/types';

interface RequirementsPreviewProps {
  document: RequirementsDocument;
}

export function RequirementsPreview({ document: _document }: RequirementsPreviewProps) {
  // TODO: 구현
  return (
    <div>
      {/* TODO: 표지 */}
      {/* TODO: 프로젝트 개요 */}
      {/* TODO: 작업 범위 */}
      {/* TODO: 디자인 요구사항 */}
      {/* TODO: 기능 명세 */}
      {/* TODO: 일정 */}
      {/* TODO: 예상 비용 */}
      {/* TODO: 다음 단계 */}
    </div>
  );
}
