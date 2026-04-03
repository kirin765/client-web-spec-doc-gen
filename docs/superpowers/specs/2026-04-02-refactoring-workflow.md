# 페이지 리팩토링 워크플로우

**문서 작성일**: 2026-04-02
**적용 대상**: Phase 1, 2, 3 모든 페이지

---

## 리팩토링 프로세스

### 각 페이지마다 반복할 단계

#### 1단계: 준비
```
1. 페이지 파일 열기 (예: src/pages/LandingPage.tsx)
2. DESIGN_SYSTEM.md 문서 참고용으로 나란히 열기
3. 현재 페이지의 스타일 클래스 목록 파악
```

#### 2단계: 토큰 매핑
기존 클래스를 새로운 디자인 시스템 토큰으로 변환합니다.

**Search & Replace 패턴**:

##### 색상 변환
```
text-gray-900          → text-secondary-900
text-gray-700          → text-secondary-700
text-gray-600          → text-secondary-600
text-gray-500          → text-secondary-500

bg-blue-600            → bg-primary-600
bg-blue-500            → bg-primary-500
bg-red-600             → bg-error-600
bg-green-600           → bg-success-600
bg-yellow-600          → bg-warning-600

text-white             → text-secondary-50 (또는 유지)
```

##### 타이포그래피 변환
```
text-xs                → text-caption-sm
text-sm                → text-body-sm
text-base              → text-body-md
text-lg                → text-body-lg
text-xl                → text-heading-sm
text-2xl               → text-heading-md
text-3xl               → text-heading-lg
text-4xl               → text-display-sm
text-5xl               → text-display-md
```

##### 스페이싱 변환 (일반적으로 그대로)
```
p-4, p-6, p-8, p-12   (8px 스케일과 일치 → 유지)
m-4, m-6, m-8, m-12   (일치 → 유지)
gap-4, gap-6, gap-8   (일치 → 유지)
```

---

#### 3단계: 컴포넌트 유틸 적용

여러 클래스를 단일 유틸로 통합합니다.

**Before**:
```tsx
<div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
  <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
    클릭
  </button>
</div>
```

**After**:
```tsx
<div className="card">
  <button className="btn-primary">
    클릭
  </button>
</div>
```

##### 일반적인 유틸 변환표

| 기존 패턴 | 새 유틸 | 설명 |
|----------|--------|------|
| `bg-white rounded-lg shadow p-6` | `.card` | 카드 컨테이너 |
| `bg-blue-600 text-white px-4 py-2 rounded` | `.btn-primary` | 주 버튼 |
| `bg-gray-100 text-gray-900 px-4 py-2 rounded border border-gray-300` | `.btn-secondary` | 보조 버튼 |
| `bg-transparent border border-blue-600 text-blue-600` | `.btn-outline` | 아웃라인 버튼 |
| `border rounded px-3 py-2 focus:outline-none` | `.input` | 입력 필드 |
| `bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs` | `.badge` | 뱃지 |
| `flex items-center justify-center` | `.flex-center` | 중앙 정렬 |
| `flex items-center justify-between` | `.flex-between` | 양쪽 정렬 |

---

#### 4단계: 시각적 검증

```bash
npm run dev
# http://localhost:5173 접속
```

**검증 체크리스트**:
- [ ] 페이지가 에러 없이 로드됨
- [ ] 색상이 올바르게 렌더링됨
- [ ] 타이포그래피 크기가 적절함
- [ ] 스페이싱이 일관성 있음
- [ ] 버튼, 입력, 링크가 작동함
- [ ] 반응형 레이아웃이 유지됨 (모바일/태블릿/데스크톱)
- [ ] 호버 상태가 정상 작동함
- [ ] 로딩 상태가 정상 작동함 (있다면)
- [ ] 개발자 도구 콘솔에 에러 없음

---

#### 5단계: 커밋

```bash
git add src/pages/[PageName].tsx
git commit -m "refactor: apply design system to [PageName]"
```

**커밋 메시지 예시**:
```
refactor: apply design system to LandingPage

- Replace gray-* colors with secondary palette
- Replace blue-* colors with primary palette
- Update typography classes to design system scale
- Apply component utilities (.card, .btn-primary, .input)
- Maintain all existing functionality and responsiveness
```

---

## Phase별 페이지 순서

### Phase 1: 핵심 사용자 흐름
1. **LandingPage** (간단, 15-20분)
   - Hero, 기능, 프로세스, CTA 섹션
   - 색상: primary, secondary
   - 타이포: heading, body, button

2. **WizardPage** (간단, 10-15분)
   - 마법사 래퍼만 (내부 컴포넌트는 이미 리팩토링됨)
   - 기존 컴포넌트와의 호환성 확인

3. **ResultPage** (중간, 30-40분)
   - 비용 요약, 개발자 매칭, 테이블 스타일
   - 색상: primary, success, warning
   - 복잡한 데이터 시각화

4. **MyPage** (복잡, 45-60분)
   - 가장 큰 페이지 (55KB)
   - 탭, 테이블, 카드, 폼 등 다양한 컴포넌트
   - 여러 섹션으로 나누어 진행 권장

---

### Phase 2: 마켓플레이스 기능
각 페이지 15-30분:
- **CustomerMatchesPage** — 매칭 카드 그리드
- **CustomerProposalsPage** — 제안 테이블
- **DeveloperWorkspacePage** — 복잡한 대시보드 (30-40분)
- **ExpertDirectoryPage** — 전문가 그리드
- **ExpertReceivedQuotesPage** — 견적 목록

---

### Phase 3: 관리자 및 유틸
각 페이지 15-30분:
- **AdminPage** — 관리 대시보드
- **UserQuotesPage** — 사용자 견적 목록
- **ExpertDetailPage** — 전문가 상세 정보

---

## 일반적인 함정 및 해결책

### 함정 1: 색상이 너무 밝거나 어두움
**증상**: 변환 후 텍스트가 읽기 어려워짐
**해결**: 색상 레벨 조정 (예: `-700` → `-600`)

### 함정 2: 스페이싱이 맞지 않음
**증상**: 요소들이 너무 가깝거나 멀어짐
**해결**: 8px 스케일에 맞게 조정 (가능하면)

### 함정 3: 버튼 상태 (hover, active, disabled)가 작동하지 않음
**증상**: 호버 효과가 없음
**해결**: 컴포넌트 유틸이 이미 상태를 포함했는지 확인

### 함� 4: 기존 inline 스타일과 충돌
**증상**: Tailwind 클래스가 inline 스타일에 의해 무시됨
**해결**: inline 스타일을 제거하거나 `!` 프리픽스 사용 (`!text-primary-600`)

---

## 성능 팁

### 병렬 작업
여러 페이지를 동시에 리팩토링할 수 있습니다 (같은 기능은 아니지만).

### 자동화 도구 활용
VSCode의 **Find and Replace**를 사용하여 대량 변환:
- `Ctrl+H` (또는 `Cmd+H`)
- 정규식 사용 가능
- 문맥을 고려하여 조정

---

## 다음 단계

각 Phase 완료 후:
1. 전체 페이지 smoke test
2. PR 작성 및 코드 리뷰
3. PR 병합

→ [검증 및 병합 전략](2026-04-02-qa-validation.md)

---

## 참고 자료

- 📖 [DESIGN_SYSTEM.md](../../../DESIGN_SYSTEM.md) (참고용)
- 🎨 [디자인 시스템 복구](2026-04-02-design-system-recovery.md)
- ✅ [검증 및 병합 전략](2026-04-02-qa-validation.md)
- 📋 [전체 프로젝트 개요](2026-04-02-page-refactoring-overview.md)
