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
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
  pdf,
} from '@react-pdf/renderer';
import { formatRange } from '@/lib/utils';

// 한국어 폰트 등록
Font.register({
  family: 'NotoSansKR',
  src: 'https://fonts.gstatic.com/s/noto/v21/noto-sans-kr_korean-900.0.woff2',
  fontWeight: 900,
});

Font.register({
  family: 'NotoSansKR',
  src: 'https://fonts.gstatic.com/s/noto/v21/noto-sans-kr_korean-700.0.woff2',
  fontWeight: 700,
});

Font.register({
  family: 'NotoSansKR',
  src: 'https://fonts.gstatic.com/s/noto/v21/noto-sans-kr_korean-400.0.woff2',
  fontWeight: 400,
});

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'NotoSansKR',
    fontSize: 11,
    lineHeight: 1.6,
    color: '#000',
  },
  title: {
    fontSize: 24,
    fontWeight: 700,
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 5,
    textAlign: 'center',
    color: '#666',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 700,
    marginTop: 20,
    marginBottom: 10,
    paddingBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  subsectionTitle: {
    fontSize: 13,
    fontWeight: 700,
    marginTop: 15,
    marginBottom: 8,
  },
  text: {
    fontSize: 11,
    marginBottom: 5,
  },
  table: {
    width: '100%',
    marginTop: 10,
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#ddd',
  } as any,
  tableRow: {
    margin: 'auto' as any,
    flexDirection: 'row' as any,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  tableHeaderRow: {
    margin: 'auto' as any,
    flexDirection: 'row' as any,
    backgroundColor: '#f5f5f5',
    borderBottomWidth: 2,
    borderBottomColor: '#999',
    fontWeight: 700,
  },
  tableCell: {
    flex: 1,
    padding: 8,
    fontSize: 10,
  },
  tableCellHeader: {
    flex: 1,
    padding: 8,
    fontSize: 10,
    fontWeight: 700,
  },
  costHighlight: {
    fontSize: 18,
    fontWeight: 700,
    color: '#0066cc',
    marginTop: 10,
  },
  row: {
    flexDirection: 'row' as any,
    marginBottom: 8,
  },
  label: {
    fontWeight: 700,
    flex: 0.3,
  },
  value: {
    flex: 0.7,
  },
  disclaimer: {
    fontSize: 9,
    color: '#666',
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#ccc',
    paddingTop: 10,
  },
});

interface PdfDocumentProps {
  document: RequirementsDocument;
}

export function PdfDocument({ document }: PdfDocumentProps) {
  return (
    <Document>
      {/* 표지 */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>{document.clientInfo.projectName}</Text>
        <Text style={styles.subtitle}>웹사이트 요구사항 명세서</Text>
        <Text style={[styles.subtitle, { marginTop: 20 }]}>
          생성일: {new Date(document.generatedAt).toLocaleDateString('ko-KR')}
        </Text>
      </Page>

      {/* 프로젝트 개요 */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.sectionTitle}>프로젝트 개요</Text>

        <View style={styles.row}>
          <Text style={styles.label}>사이트 유형:</Text>
          <Text style={styles.value}>{document.projectOverview.siteType}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>설명:</Text>
          <Text style={styles.value}>{document.projectOverview.description}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>타겟 고객:</Text>
          <Text style={styles.value}>{document.projectOverview.targetAudience}</Text>
        </View>

        {/* 작업 범위 */}
        <Text style={styles.sectionTitle}>작업 범위</Text>

        {document.scopeOfWork.pages.length > 0 && (
          <>
            <Text style={styles.subsectionTitle}>필요 페이지</Text>
            <View style={styles.table}>
              <View style={styles.tableHeaderRow}>
                <Text style={[styles.tableCellHeader, { flex: 0.4 }]}>페이지명</Text>
                <Text style={[styles.tableCellHeader, { flex: 0.6 }]}>설명</Text>
              </View>
              {document.scopeOfWork.pages.map((page, idx) => (
                <View key={idx} style={styles.tableRow}>
                  <Text style={[styles.tableCell, { flex: 0.4 }]}>{page.name}</Text>
                  <Text style={[styles.tableCell, { flex: 0.6 }]}>{page.description}</Text>
                </View>
              ))}
            </View>
          </>
        )}

        {document.scopeOfWork.features.length > 0 && (
          <>
            <Text style={styles.subsectionTitle}>필요 기능</Text>
            <View style={styles.table}>
              <View style={styles.tableHeaderRow}>
                <Text style={[styles.tableCellHeader, { flex: 0.4 }]}>기능명</Text>
                <Text style={[styles.tableCellHeader, { flex: 0.6 }]}>설명</Text>
              </View>
              {document.scopeOfWork.features.map((feature, idx) => (
                <View key={idx} style={styles.tableRow}>
                  <Text style={[styles.tableCell, { flex: 0.4 }]}>{feature.name}</Text>
                  <Text style={[styles.tableCell, { flex: 0.6 }]}>{feature.description}</Text>
                </View>
              ))}
            </View>
          </>
        )}

        {document.scopeOfWork.integrations.length > 0 && (
          <>
            <Text style={styles.subsectionTitle}>외부 서비스 연동</Text>
            <Text style={styles.text}>{document.scopeOfWork.integrations.join(', ')}</Text>
          </>
        )}

        {/* 디자인 요구사항 */}
        <Text style={styles.sectionTitle}>디자인 요구사항</Text>
        <View style={styles.row}>
          <Text style={styles.label}>복잡도:</Text>
          <Text style={styles.value}>{document.designRequirements.complexity}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>스타일:</Text>
          <Text style={styles.value}>{document.designRequirements.style}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>반응형 대상:</Text>
          <Text style={styles.value}>{document.designRequirements.responsiveTargets.join(', ')}</Text>
        </View>
      </Page>

      {/* 일정 및 비용 */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.sectionTitle}>일정</Text>
        <View style={styles.row}>
          <Text style={styles.label}>긴급도:</Text>
          <Text style={styles.value}>{document.timeline.urgency}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>예상 기간:</Text>
          <Text style={styles.value}>
            {document.timeline.estimatedWeeks.min}주 ~ {document.timeline.estimatedWeeks.max}주
          </Text>
        </View>

        {/* 예상 비용 */}
        <Text style={styles.sectionTitle}>예상 비용</Text>
        <Text style={styles.costHighlight}>
          {formatRange(document.costEstimate.totalMin, document.costEstimate.totalMax)}
        </Text>

        <View style={[styles.table, { marginTop: 15 }]}>
          <View style={styles.tableHeaderRow}>
            <Text style={[styles.tableCellHeader, { flex: 0.3 }]}>카테고리</Text>
            <Text style={[styles.tableCellHeader, { flex: 0.4 }]}>항목</Text>
            <Text style={[styles.tableCellHeader, { flex: 0.3 }]}>비용</Text>
          </View>
          {document.costEstimate.breakdown.map((item, idx) => (
            <View key={idx} style={styles.tableRow}>
              <Text style={[styles.tableCell, { flex: 0.3 }]}>{item.category}</Text>
              <Text style={[styles.tableCell, { flex: 0.4 }]}>{item.label}</Text>
              <Text style={[styles.tableCell, { flex: 0.3 }]}>
                {formatRange(item.minAmount, item.maxAmount)}
              </Text>
            </View>
          ))}
        </View>

        {/* 추가 메모 */}
        {document.additionalNotes && (
          <>
            <Text style={styles.sectionTitle}>추가 메모</Text>
            <Text style={styles.text}>{document.additionalNotes}</Text>
          </>
        )}

        {/* 다음 단계 */}
        <Text style={styles.sectionTitle}>다음 단계</Text>
        <Text style={styles.text}>1. 본 명세서 검토 및 피드백 제공</Text>
        <Text style={styles.text}>2. 상세 요구사항 협의 (약 30분 ~ 1시간)</Text>
        <Text style={styles.text}>3. 최종 계약 및 프로젝트 착수</Text>
        <Text style={styles.text}>4. 정기적인 진행 상황 공유 및 리뷰</Text>

        {/* 면책 조항 */}
        <Text style={styles.disclaimer}>
          본 견적은 자동 산출된 예상 범위이며, 실제 비용은 상세 상담 후 확정됩니다. 추가 요구사항이
          발생할 경우 비용이 변동될 수 있습니다.
        </Text>
      </Page>
    </Document>
  );
}

export async function downloadPdf(reqDoc: RequirementsDocument) {
  const blob = await pdf(<PdfDocument document={reqDoc} />).toBlob();
  const url = URL.createObjectURL(blob);
  const link = globalThis.document.createElement('a') as HTMLAnchorElement;
  link.href = url;
  link.download = `${reqDoc.clientInfo.projectName}_견적서.pdf`;
  link.click();
  URL.revokeObjectURL(url);
}
