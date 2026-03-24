// WizardPage — WizardShell 래퍼 + 뒤로가기 처리.

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuoteStore } from '@/store/useQuoteStore';
import { WizardShell } from '@/components/wizard/WizardShell';
import { Seo } from '@/components/seo/Seo';

export function WizardPage() {
  const navigate = useNavigate();
  const { currentStep } = useQuoteStore();

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

  return (
    <>
      <Seo
        title="의뢰 생성 위저드 | 웹사이트 견적 자동 생성기"
        description="프로젝트 유형, 페이지 수, 기능, 디자인, 일정과 예산을 입력해 맞춤형 의뢰를 생성하세요."
        noIndex
      />
      <WizardShell />
    </>
  );
}
