// =============================================================================
// StepNavigation — 이전/다음 버튼
// =============================================================================
//
// TODO 구현 사항:
// 1. "이전" 버튼: prevStep() 호출, 첫 스텝에서는 숨김 또는 비활성화
// 2. "다음" 버튼: nextStep() 호출
//    - 현재 스텝의 필수 질문이 모두 답변되지 않으면 비활성화
//    - 마지막 스텝에서는 "결과 보기" 텍스트 + /result로 navigate
// 3. 버튼 스타일:
//    - 이전: variant="outline"
//    - 다음: variant="default" (primary 색상)
// 4. 레이아웃: flex justify-between, 하단 고정
// =============================================================================

export function StepNavigation() {
  // TODO: 구현
  // - useQuoteStore에서 currentStep, answers 읽기
  // - questionCategories에서 현재 카테고리의 필수 질문 검증
  // - useNavigate()로 마지막 스텝에서 /result 이동
  return (
    <div>
      {/* TODO: 이전 버튼 */}
      {/* TODO: 다음/결과보기 버튼 */}
    </div>
  );
}
