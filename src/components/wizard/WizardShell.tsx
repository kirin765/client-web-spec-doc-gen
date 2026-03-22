// =============================================================================
// WizardShell — 위저드 전체 컨테이너
// =============================================================================
//
// TODO 구현 사항:
// 1. 상단 프로그레스 바
//    - 6개 스텝 표시 (각 카테고리의 labelKey + icon)
//    - 현재 스텝 하이라이트, 완료 스텝 체크마크
//    - 클릭으로 이전 스텝 이동 가능 (미래 스텝은 불가)
//
// 2. 중앙 콘텐츠 영역
//    - <StepRenderer />로 현재 스텝의 질문들을 렌더링
//    - 스텝 전환 시 fade/slide 애니메이션 (CSS transition)
//
// 3. 하단 네비게이션
//    - <StepNavigation />으로 이전/다음 버튼
//
// 4. 우측 사이드바 (데스크톱) / 하단 시트 (모바일)
//    - 실시간 비용 미리보기
//    - useQuoteStore의 answers를 costCalculator에 전달하여 계산
//    - 금액 변동 시 하이라이트 애니메이션
//
// 5. 레이아웃: max-w-4xl 중앙 정렬, 패딩
// =============================================================================

export function WizardShell() {
  // TODO: 구현
  // - useQuoteStore에서 currentStep, answers 읽기
  // - questionCategories에서 현재 카테고리 가져오기
  // - calculateCost(answers)로 실시간 비용 계산
  return (
    <div>
      {/* TODO: 프로그레스 바 */}
      {/* TODO: StepRenderer */}
      {/* TODO: StepNavigation */}
      {/* TODO: 비용 미리보기 사이드바 */}
    </div>
  );
}
