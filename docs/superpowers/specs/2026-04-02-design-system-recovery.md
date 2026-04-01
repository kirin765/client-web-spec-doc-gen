# 디자인 시스템 복구 계획

**문서 작성일**: 2026-04-02
**예상 소요 시간**: 1-2시간
**산출물**: 1개 PR (인프라 전용)

---

## 개요

현재 프로젝트의 tailwind.config.ts에는 기본 primary 색상만 정의되어 있습니다. 이 단계에서는 메모리에 저장된 종합 디자인 시스템을 완전히 복구하여 모든 페이지 리팩토링의 토대를 마련합니다.

---

## 복구할 디자인 시스템 요소

### 1. tailwind.config.ts 업데이트

#### 색상 팔레트 (완전한 Tailwind 호환)
```
primary (Sky Blue)
├── 50-900 (9단계)
secondary (Slate)
├── 50-900 (9단계)
success (초록색)
├── 50-900 (9단계)
warning (주황색)
├── 50-900 (9단계)
error (빨강색)
├── 50-900 (9단계)
neutral (회색)
├── 50-900 (9단계)
```

#### 타이포그래피 스케일
```
Display: display-lg, display-md, display-sm
Heading: h1-h6 (6단계)
Body: body-lg, body-md, body-sm (3단계)
Caption: caption-lg, caption-sm (2단계)
```

#### 스페이싱 스케일 (8px 기반)
```
0, 4, 8, 12, 16, 20, 24, 32, 40, 48, 56, 64
(기존 Tailwind의 0-96과 호환)
```

#### 추가 토큰
- **Border Radius**: xs (4px) ~ full (9999px)
- **Shadows**: 7단계 깊이 시스템 (카드, 모달 변형 포함)
- **Transitions**: 150ms-500ms 지속 시간 (smooth, bounce 이징)

---

### 2. CSS 컴포넌트 유틸 (src/index.css)

#### 컨테이너 유틸
```css
.container-base   /* 기본 컨테이너 */
.container-lg     /* 큰 컨테이너 */
.container-md     /* 중간 컨테이너 */
```

#### 타이포그래피 클래스
```css
.heading-lg, .heading-md, .heading-sm
.text-body-lg, .text-body-md, .text-body-sm
.text-caption-lg, .text-caption-sm
```

#### 컴포넌트 유틸
```css
.card              /* 카드 스타일 */
.btn-primary       /* 주 버튼 */
.btn-secondary     /* 보조 버튼 */
.btn-ghost         /* 유령 버튼 */
.btn-outline       /* 아웃라인 버튼 */
.btn-danger        /* 위험 버튼 */
.input             /* 입력 필드 */
.badge             /* 뱃지 */
.grid-cols-auto    /* 자동 그리드 */
```

#### 헬퍼 유틸
```css
.flex-center       /* 중앙 정렬 flex */
.flex-between      /* 양쪽 정렬 flex */
.absolute-center   /* 절대 중앙 정렬 */
.bg-fade           /* 배경 페이드 효과 */
```

---

### 3. DESIGN_SYSTEM.md 문서 생성

**위치**: 프로젝트 루트 또는 `docs/` 디렉토리

**포함 내용**:
- 전체 색상 팔레트 + 사용 사례
- 타이포그래피 계층 구조 가이드
- 스페이싱 스케일 설명
- 테두리 반경 및 그림자 토큰 레퍼런스
- 컴포넌트 예시 (버튼, 입력, 카드, 뱃지)
- 일반적인 패턴 및 베스트 프랙티스
- 빠른 참조 템플릿

---

## 구현 체크리스트

### tailwind.config.ts 업데이트
- [ ] 완전한 색상 팔레트 추가 (6개 색상 × 9단계)
- [ ] 타이포그래피 확장 정의
- [ ] 스페이싱, border-radius, shadows, transitions 추가
- [ ] 새로운 CSS 클래스가 제대로 생성되는지 확인

### src/index.css 생성/업데이트
- [ ] 모든 컨테이너 유틸 정의
- [ ] 모든 타이포그래피 클래스 정의
- [ ] 모든 컴포넌트 유틸 정의
- [ ] 모든 헬퍼 유틸 정의
- [ ] PostCSS 에러 없음 확인

### DESIGN_SYSTEM.md 문서 작성
- [ ] 색상 팔레트 가이드 작성
- [ ] 타이포그래피 사용 예시
- [ ] 스페이싱 규칙 설명
- [ ] 컴포넌트별 사용 예시 포함
- [ ] 베스트 프랙티스 정리

---

## 검증 방법

### 로컬 테스트
```bash
npm run dev
# http://localhost:5173 접속
# 개발자 도구에서 클래스 자동완성 확인
```

### 시각적 확인
- ✅ 기존 컴포넌트 (Header, Footer, WizardShell 등)가 여전히 정상 작동
- ✅ 새로운 색상 클래스가 올바르게 렌더링됨
- ✅ 타이포그래피 크기가 정확함
- ✅ 스페이싱이 일관성 있음
- ✅ 콘솔 에러 없음

---

## 커밋 메시지

```
style: restore comprehensive design system tokens and utilities

- Update tailwind.config.ts with complete color palette (primary, secondary, success, warning, error, neutral)
- Add typography system (display, heading, body, caption)
- Define spacing scale (8px base), border-radius, shadows, transitions
- Implement CSS component utilities (.card, .btn-*, .input, .badge, etc.)
- Create DESIGN_SYSTEM.md documentation with usage guide
- No visual changes to existing components
```

---

## 종속성 및 주의사항

### Tailwind CSS 버전
- 최소: v3.0
- 권장: v3.4+

### PostCSS 호환성
- ✅ Tailwind의 `@layer` 지시문 사용 가능
- ✅ CSS 변수 정의 가능
- ⚠️ 기존 tailwind.config.ts의 primary 색상 정의 확인 필요

### 주의사항
- 기존 inline 스타일은 이 단계에서 수정 **불가** (다음 Phase에서)
- 새로운 유틸은 **사용하지 않아도** 기존 페이지에 영향 없음
- 이 PR은 **순수 추가** (제거 없음)

---

## 다음 단계

이 단계가 완료되면:
1. Phase 1 리팩토링 시작 (LandingPage, WizardPage, ResultPage, MyPage)
2. 각 페이지에서 기존 클래스를 새로운 디자인 시스템 토큰으로 변경
3. 시각적 회귀 테스트

---

## 참고 자료

- 🎨 [디자인 시스템 메모리](../../../projects/-Users-kiwankim-client-web-spec-doc-gen/memory/design-system-implementation.md)
- 🔄 [리팩토링 워크플로우](2026-04-02-refactoring-workflow.md)
- 📋 [전체 프로젝트 개요](2026-04-02-page-refactoring-overview.md)
