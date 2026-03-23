// 서버 타입: Answers, NormalizedSpec.

/** 사용자 답변을 담는 맵: questionId → 선택된 값(들) */
export type Answers = Record<string, string | string[] | number>;

/** 서버가 rawAnswers를 해석하여 만든 표준화 스펙 */
export interface NormalizedSpec {
  projectType: string;
  scope: {
    pageCount: number;
    featureSet: string[];
    designTier: string;
    designStyle?: string;
    integrations: string[];
    contentProvision?: string;
  };
  delivery: {
    timelineWeeks: { min: number; max: number };
    urgency: string;
  };
  budget?: {
    min: number;
    max: number;
  };
}
