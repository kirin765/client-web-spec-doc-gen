// =============================================================================
// WizardPage — 질문 위저드 페이지
// =============================================================================
//
// TODO 구현 사항:
// 1. <WizardShell />을 렌더링하는 래퍼 페이지
// 2. 페이지 진입 시:
//    - answers가 비어있으면 정상 시작
//    - answers가 이미 있으면 이어서 진행 (currentStep 유지)
// 3. 브라우저 뒤로가기 처리:
//    - 위저드 내부에서는 prevStep()으로 처리
//    - 첫 스텝에서 뒤로가기 시 /로 이동 (확인 다이얼로그 선택적)
// 4. 레이아웃: Header + WizardShell + Footer
// 5. 페이지 타이틀 설정 (document.title)
// =============================================================================

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuoteStore } from '@/store/useQuoteStore';
import { WizardShell } from '@/components/wizard/WizardShell';

export function WizardPage() {
  const navigate = useNavigate();
  const { currentStep } = useQuoteStore();

  useEffect(() => {
    document.title = '웹사이트 견적 생성기 - 위저드';
  }, []);

  // 첫 스텝에서 브라우저 뒤로가기 시 홈으로 이동
  useEffect(() => {
    const handlePopState = () => {
      if (currentStep === 0) {
        navigate('/');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [currentStep, navigate]);

  return <WizardShell />;
}
