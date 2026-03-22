// =============================================================================
// ResultPage — 결과 페이지 (비용 견적 + 요구사항 문서)
// =============================================================================
//
// TODO 구현 사항:
// 1. 페이지 진입 시:
//    - useQuoteStore에서 answers 읽기
//    - answers가 비어있으면 /wizard로 리다이렉트
//    - calculateCost(answers)로 비용 계산
//    - generateDocument(answers, costEstimate)로 문서 생성
//
// 2. 상단: 완료 메시지
//    - "견적이 준비되었습니다!" 제목
//    - 프로젝트명 표시
//
// 3. 탭 또는 섹션 구성:
//    a. 비용 요약 탭:
//       - <CostSummary estimate={costEstimate} />
//    b. 요구사항 명세서 탭:
//       - <RequirementsPreview document={reqDocument} />
//
// 4. 액션 버튼:
//    - "PDF 다운로드" → downloadPdf(reqDocument) 호출
//    - "새 견적 시작" → resetQuote() + /wizard로 navigate
//    - "수정하기" → /wizard로 navigate (answers 유지)
//
// 5. 레이아웃: max-w-5xl 중앙 정렬, Header + 콘텐츠 + Footer
// =============================================================================

export function ResultPage() {
  // TODO: 구현
  // - useQuoteStore에서 answers 읽기
  // - calculateCost, generateDocument 호출
  // - CostSummary, RequirementsPreview 렌더링
  // - downloadPdf 연결
  return (
    <div>
      {/* TODO: 완료 메시지 */}
      {/* TODO: 비용 요약 / 명세서 탭 */}
      {/* TODO: 액션 버튼 (PDF 다운로드, 새 견적, 수정) */}
    </div>
  );
}
