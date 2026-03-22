// =============================================================================
// RequirementsPreview — 요구사항 명세서 HTML 미리보기
// =============================================================================
//
// TODO 구현 사항:
// 1. props로 RequirementsDocument를 받음
//
// 2. 섹션별 HTML 렌더링 (스크롤 가능한 미리보기):
//    a. 표지: 프로젝트명, 생성일, "웹사이트 요구사항 명세서" 제목
//    b. 프로젝트 개요: 사이트 유형, 목적, 타겟 고객
//    c. 작업 범위:
//       - 페이지 목록 (이름 + 설명 테이블)
//       - 기능 목록 (이름 + 설명 테이블)
//       - 외부 연동 서비스 목록
//    d. 디자인 요구사항: 복잡도, 스타일, 반응형 대상
//    e. 기능 명세: 선택된 각 기능의 상세 설명
//    f. 연동 및 인프라: 호스팅, 외부 서비스
//    g. 일정: 긴급도, 예상 주수
//    h. 예상 비용: CostSummary와 동일한 분해표
//    i. 다음 단계: 표준 안내 텍스트
//
// 3. 인쇄 스타일 고려 (print-friendly CSS)
// 4. 스타일: prose 클래스 활용, 섹션 간 구분선
// =============================================================================

import type { RequirementsDocument } from '@/types';
import { formatRange } from '@/lib/utils';

interface RequirementsPreviewProps {
  document: RequirementsDocument;
}

export function RequirementsPreview({ document }: RequirementsPreviewProps) {
  return (
    <div className="space-y-8 rounded-lg border bg-white p-8 prose prose-sm max-w-none">
      {/* 표지 */}
      <section className="border-b pb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900">{document.clientInfo.projectName}</h1>
        <p className="mt-2 text-lg text-gray-600">웹사이트 요구사항 명세서</p>
        <p className="mt-4 text-sm text-gray-500">
          생성일: {new Date(document.generatedAt).toLocaleDateString('ko-KR')}
        </p>
      </section>

      {/* 프로젝트 개요 */}
      <section className="border-b pb-6">
        <h2 className="text-2xl font-bold text-gray-900">프로젝트 개요</h2>
        <div className="mt-4 space-y-2">
          <div>
            <span className="font-semibold text-gray-700">사이트 유형:</span>{' '}
            <span className="text-gray-600">{document.projectOverview.siteType}</span>
          </div>
          <div>
            <span className="font-semibold text-gray-700">설명:</span>{' '}
            <span className="text-gray-600">{document.projectOverview.description}</span>
          </div>
          <div>
            <span className="font-semibold text-gray-700">타겟 고객:</span>{' '}
            <span className="text-gray-600">{document.projectOverview.targetAudience}</span>
          </div>
        </div>
      </section>

      {/* 작업 범위 */}
      <section className="border-b pb-6">
        <h2 className="text-2xl font-bold text-gray-900">작업 범위</h2>

        {/* 페이지 목록 */}
        {document.scopeOfWork.pages.length > 0 && (
          <div className="mt-4">
            <h3 className="text-lg font-semibold text-gray-900">페이지</h3>
            <div className="mt-2 overflow-hidden rounded-lg border">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="border-b px-4 py-2 text-left font-semibold text-gray-700">
                      페이지명
                    </th>
                    <th className="border-b px-4 py-2 text-left font-semibold text-gray-700">
                      설명
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {document.scopeOfWork.pages.map((page, idx) => (
                    <tr key={idx} className="border-b">
                      <td className="px-4 py-2 text-gray-900">{page.name}</td>
                      <td className="px-4 py-2 text-gray-600">{page.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 기능 목록 */}
        {document.scopeOfWork.features.length > 0 && (
          <div className="mt-4">
            <h3 className="text-lg font-semibold text-gray-900">기능</h3>
            <div className="mt-2 overflow-hidden rounded-lg border">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="border-b px-4 py-2 text-left font-semibold text-gray-700">
                      기능명
                    </th>
                    <th className="border-b px-4 py-2 text-left font-semibold text-gray-700">
                      설명
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {document.scopeOfWork.features.map((feature, idx) => (
                    <tr key={idx} className="border-b">
                      <td className="px-4 py-2 text-gray-900">{feature.name}</td>
                      <td className="px-4 py-2 text-gray-600">{feature.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 외부 연동 */}
        {document.scopeOfWork.integrations.length > 0 && (
          <div className="mt-4">
            <h3 className="text-lg font-semibold text-gray-900">외부 서비스 연동</h3>
            <ul className="mt-2 list-inside list-disc space-y-1 text-gray-600">
              {document.scopeOfWork.integrations.map((integration, idx) => (
                <li key={idx}>{integration}</li>
              ))}
            </ul>
          </div>
        )}
      </section>

      {/* 디자인 요구사항 */}
      <section className="border-b pb-6">
        <h2 className="text-2xl font-bold text-gray-900">디자인 요구사항</h2>
        <div className="mt-4 space-y-2">
          <div>
            <span className="font-semibold text-gray-700">복잡도:</span>{' '}
            <span className="text-gray-600">{document.designRequirements.complexity}</span>
          </div>
          <div>
            <span className="font-semibold text-gray-700">스타일:</span>{' '}
            <span className="text-gray-600">{document.designRequirements.style}</span>
          </div>
          <div>
            <span className="font-semibold text-gray-700">반응형 대상:</span>{' '}
            <span className="text-gray-600">{document.designRequirements.responsiveTargets.join(', ')}</span>
          </div>
        </div>
      </section>

      {/* 일정 */}
      <section className="border-b pb-6">
        <h2 className="text-2xl font-bold text-gray-900">일정</h2>
        <div className="mt-4 space-y-2">
          <div>
            <span className="font-semibold text-gray-700">긴급도:</span>{' '}
            <span className="text-gray-600">{document.timeline.urgency}</span>
          </div>
          <div>
            <span className="font-semibold text-gray-700">예상 소요 기간:</span>{' '}
            <span className="text-gray-600">
              {document.timeline.estimatedWeeks.min}주 ~ {document.timeline.estimatedWeeks.max}주
            </span>
          </div>
        </div>
      </section>

      {/* 예상 비용 */}
      <section className="border-b pb-6">
        <h2 className="text-2xl font-bold text-gray-900">예상 비용</h2>
        <div className="mt-4 rounded-lg bg-blue-50 p-4">
          <div className="text-lg font-bold text-blue-600">
            {formatRange(document.costEstimate.totalMin, document.costEstimate.totalMax)}
          </div>
          <p className="mt-2 text-sm text-blue-900">
            본 금액은 자동 산출된 예상 범위이며, 실제 비용은 상세 상담 후 확정됩니다.
          </p>
        </div>
      </section>

      {/* 추가 메모 */}
      {document.additionalNotes && (
        <section className="border-b pb-6">
          <h2 className="text-2xl font-bold text-gray-900">추가 메모</h2>
          <p className="mt-4 whitespace-pre-wrap text-gray-600">{document.additionalNotes}</p>
        </section>
      )}

      {/* 다음 단계 */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900">다음 단계</h2>
        <div className="mt-4 space-y-2 text-gray-600">
          <p>1. 본 명세서 검토 및 피드백 제공</p>
          <p>2. 상세 요구사항 협의 (시간: 약 30분 ~ 1시간)</p>
          <p>3. 최종 계약 및 프로젝트 착수</p>
          <p>4. 정기적인 진행 상황 공유 및 리뷰</p>
        </div>
      </section>
    </div>
  );
}
