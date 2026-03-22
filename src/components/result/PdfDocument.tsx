// =============================================================================
// PdfDocument — @react-pdf/renderer 기반 PDF 문서 컴포넌트
// =============================================================================
//
// TODO 구현 사항:
// 1. 한국어 폰트 등록:
//    Font.register({
//      family: 'NotoSansKR',
//      src: 'Google Fonts CDN URL for Noto Sans KR Regular',
//    })
//    Font.register({
//      family: 'NotoSansKR',
//      fontWeight: 'bold',
//      src: 'Google Fonts CDN URL for Noto Sans KR Bold',
//    })
//
// 2. 스타일 정의 (StyleSheet.create):
//    - page: A4, padding 40pt, fontFamily 'NotoSansKR'
//    - title: fontSize 24, fontWeight bold, marginBottom 20
//    - sectionTitle: fontSize 16, fontWeight bold, marginTop 20, borderBottom
//    - text: fontSize 11, lineHeight 1.6
//    - table, tableRow, tableCell: 테이블 레이아웃
//    - costHighlight: fontSize 18, color primary, fontWeight bold
//
// 3. Document 구조 (React-PDF 컴포넌트):
//    <Document>
//      <Page> — 표지
//        프로젝트명, 생성일, "웹사이트 요구사항 명세서"
//      </Page>
//      <Page> — 본문
//        프로젝트 개요 섹션
//        작업 범위 섹션 (페이지 테이블, 기능 테이블)
//        디자인 요구사항 섹션
//      </Page>
//      <Page> — 비용
//        예상 비용 섹션 (분해표 테이블)
//        일정 섹션
//        다음 단계 안내
//        면책 조항
//      </Page>
//    </Document>
//
// 4. PDF 다운로드 트리거 함수:
//    export async function downloadPdf(doc: RequirementsDocument) {
//      const blob = await pdf(<PdfDocument document={doc} />).toBlob();
//      const url = URL.createObjectURL(blob);
//      const a = document.createElement('a');
//      a.href = url;
//      a.download = `${doc.clientInfo.projectName}_견적서.pdf`;
//      a.click();
//      URL.revokeObjectURL(url);
//    }
// =============================================================================

import type { RequirementsDocument } from '@/types';

interface PdfDocumentProps {
  document: RequirementsDocument;
}

export function PdfDocument({ document: _document }: PdfDocumentProps) {
  // TODO: @react-pdf/renderer의 Document, Page, Text, View, StyleSheet 사용
  // TODO: Font.register()로 한국어 폰트 등록
  // TODO: 위 구조대로 PDF 문서 컴포넌트 구현
  return null; // TODO: <Document>...</Document> 반환
}

export async function downloadPdf(_document: RequirementsDocument) {
  // TODO: pdf(<PdfDocument />) → blob → download 트리거
}
