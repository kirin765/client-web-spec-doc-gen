import { pdf } from '@react-pdf/renderer';
import type { RequirementsDocument } from '@/types';
import { PdfDocument } from '@/components/result/PdfDocument';

export async function downloadPdf(reqDoc: RequirementsDocument) {
  try {
    const blob = await pdf(<PdfDocument document={reqDoc} />).toBlob();
    const url = URL.createObjectURL(blob);
    const link = globalThis.document.createElement('a') as HTMLAnchorElement;
    link.href = url;
    link.download = `${reqDoc.clientInfo.projectName || '견적서'}_견적서.pdf`;
    link.click();
    URL.revokeObjectURL(url);
  } catch (err) {
    console.error('PDF 생성 실패:', err);
    alert('PDF 생성에 실패했습니다. 잠시 후 다시 시도해주세요.');
  }
}
