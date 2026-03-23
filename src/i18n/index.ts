// i18n — i18next 초기화 (ko, 네임스페이스: common, questions).

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
