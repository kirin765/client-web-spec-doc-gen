// =============================================================================
// i18next 설정
// =============================================================================
//
// TODO 구현 사항:
// 1. i18next 초기화:
//    - 기본 언어: 'ko'
//    - fallback 언어: 'ko'
//    - 네임스페이스: 'common', 'questions'
//    - 기본 네임스페이스: 'common'
// 2. react-i18next의 initReactI18next 플러그인 연결
// 3. 리소스 번들: ko/common.json, ko/questions.json import
// 4. interpolation.escapeValue: false (React가 이미 XSS 방지)
// =============================================================================

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import commonKo from './locales/ko/common.json';
import questionsKo from './locales/ko/questions.json';

i18n.use(initReactI18next).init({
  resources: {
    ko: {
      common: commonKo,
      questions: questionsKo,
    },
  },
  lng: 'ko',
  fallbackLng: 'ko',
  defaultNS: 'common',
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
