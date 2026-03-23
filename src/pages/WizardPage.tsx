// WizardPage — WizardShell 래퍼 + 뒤로가기 처리.

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
