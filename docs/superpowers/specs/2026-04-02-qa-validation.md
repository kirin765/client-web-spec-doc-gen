# 검증 및 병합 전략

**문서 작성일**: 2026-04-02
**적용 대상**: 모든 Phase

---

## 개요

각 Phase별로 PR을 생성하여 관리하고, 엄격한 검증을 거쳐 병합합니다. 이렇게 하면 품질을 유지하고 문제 발생 시 롤백이 쉬워집니다.

---

## PR 전략

### PR 구성
- **Phase 1**: 1개 PR (4개 페이지)
- **Phase 2**: 1개 PR (5개 페이지)
- **Phase 3**: 1개 PR (3개 페이지)

**이유**: 각 Phase는 독립적이며, 한 번에 병합되어야 일관성이 유지됩니다.

---

### PR 이름 및 설명

#### Phase 1 PR
**Title**:
```
refactor: apply design system to core user flow
```

**Body**:
```markdown
## 변경 내용

4개 페이지를 새로운 디자인 시스템 토큰으로 리팩토링합니다.

- LandingPage: 색상, 타이포그래피 업데이트
- WizardPage: 마법사 래퍼 스타일 통합
- ResultPage: 비용 요약 및 매칭 카드 스타일 통합
- MyPage: 탭, 테이블, 카드 컴포넌트 통합

## 검증 사항

- [x] 모든 색상이 디자인 시스템 팔레트 사용
- [x] 타이포그래피가 정의된 스케일 준수
- [x] 스페이싱이 8px 스케일 일관성 유지
- [x] 모든 기능이 정상 작동 (로그인, 폼, 네비게이션 등)
- [x] 반응형 레이아웃 유지 (모바일/태블릿/데스크톱)
- [x] 콘솔 에러 없음
- [x] 시각적 회귀 없음

## 스크린샷 (선택)

변경 전후 비교 이미지 추가 (필요시)
```

#### Phase 2, 3 PR
동일한 템플릿 사용, 페이지명만 변경.

---

## 검증 체크리스트

### 각 페이지마다 (커밋 전)

```markdown
## 시각적 검증
- [ ] 로컬 dev 서버에서 페이지 로드
- [ ] 색상이 정의된 팔레트와 일치
  - [ ] Primary (파란색) 사용 확인
  - [ ] Secondary (회색) 사용 확인
  - [ ] Success, Warning, Error 색상이 적절히 사용됨
- [ ] 타이포그래피 크기가 일관성 있음
  - [ ] 제목, 본문, 캡션 구분 명확
  - [ ] 폰트 크기가 가독성 좋음
- [ ] 스페이싱이 균일함
  - [ ] 요소 간 간격이 일관성 있음
  - [ ] 가로 여백, 세로 여백이 대칭적
- [ ] 컴포넌트 상태가 정상 작동
  - [ ] 버튼 호버 상태 확인
  - [ ] 입력 필드 focus 상태 확인
  - [ ] 버튼 disabled 상태 확인
  - [ ] 로딩 애니메이션 확인 (있다면)

## 반응형 검증
- [ ] 모바일 (375px) 레이아웃 정상
- [ ] 태블릿 (768px) 레이아웃 정상
- [ ] 데스크톱 (1280px) 레이아웃 정상
- [ ] 텍스트 오버플로우 없음
- [ ] 이미지 비율 유지

## 기능 검증
- [ ] 모든 링크가 작동함
- [ ] 모든 버튼이 작동함
- [ ] 폼 입력이 작동함 (있다면)
- [ ] API 호출이 정상 작동 (있다면)
- [ ] 페이지 전환이 부드러움

## 콘솔 검증
- [ ] 개발자 도구 콘솔에 에러 없음
- [ ] 경고 메시지 최소화
- [ ] 타입 에러 없음 (TypeScript)
```

---

### Phase 완료 후 (PR 생성 전)

```markdown
## 1. 전체 Phase Smoke Test

- [ ] Phase의 모든 페이지를 순차적으로 방문
- [ ] 각 페이지가 에러 없이 로드
- [ ] 페이지 간 네비게이션이 부드러움
- [ ] 인터랙션이 정상 작동

## 2. 색상 일관성 검증

- [ ] Primary 색상이 모든 CTA 버튼에 사용됨
- [ ] Secondary 색상이 텍스트/배경에 일관성 있게 사용됨
- [ ] Status 색상 (success, warning, error)이 적절히 사용됨
- [ ] 색상 대비가 WCAG AA 기준 충족 (가독성)

## 3. 타이포그래피 일관성 검증

- [ ] Heading은 일관된 크기로 표시
- [ ] Body 텍스트는 일관된 크기로 표시
- [ ] Caption은 일관되게 작음
- [ ] 라인 높이가 가독성 좋음

## 4. 스페이싱 일관성 검증

- [ ] Padding이 8px 스케일에 맞춤
- [ ] Margin이 일관성 있음
- [ ] Gap (flex/grid)이 일관성 있음

## 5. 브라우저 호환성 검증 (선택)

- [ ] Chrome 최신 버전
- [ ] Firefox 최신 버전
- [ ] Safari 최신 버전 (macOS)
- [ ] 모바일 Safari (iOS)

## 6. 접근성 검증

- [ ] 모든 버튼에 alt 텍스트 또는 aria-label 있음
- [ ] 색상만으로 정보를 전달하지 않음
- [ ] 포커스 상태가 명확함
- [ ] 키보드 네비게이션 가능
```

---

## 병합 프로세스

### 1단계: PR 생성
```bash
git push origin feature/phase-1-refactoring
# GitHub에서 PR 생성
```

### 2단계: 코드 리뷰
- PR 설명이 명확한가?
- 커밋 메시지가 명확한가?
- 변경 사항이 설계와 일치하는가?
- 불필요한 변경이 없는가? (주석, 공백, etc.)

### 3단계: 승인 및 병합
- 모든 검증 완료 확인
- PR 승인
- `main` 또는 `develop` 브랜치로 병합
- 커밋 메시지: Squash 또는 Rebase (팀 규칙에 따라)

---

## 롤백 계획

문제 발생 시 즉시 롤백 가능:

```bash
# PR이 병합된 경우
git revert <commit-hash>
git push origin main

# 또는 전체 PR 되돌리기 (GitHub UI)
# PR → Revert → Create Revert PR
```

---

## 배포 전 최종 검증

모든 Phase가 완료되어 병합된 후:

### 1. 전체 앱 Smoke Test
```bash
npm run dev
# http://localhost:5173 접속

# 모든 페이지 방문 체크리스트
- [ ] LandingPage
- [ ] WizardPage (전체 플로우)
- [ ] ResultPage
- [ ] MyPage
- [ ] CustomerMatchesPage
- [ ] CustomerProposalsPage
- [ ] DeveloperWorkspacePage
- [ ] ExpertDirectoryPage
- [ ] ExpertReceivedQuotesPage
- [ ] AdminPage
- [ ] UserQuotesPage
- [ ] ExpertDetailPage
```

### 2. 핵심 기능 검증
```bash
# 핵심 사용자 경로
1. 랜딩 페이지 → 마법사 시작
2. 마법사 모든 단계 완료
3. 결과 페이지 확인
4. 전문가와의 상호작용 (해당 경로)
5. 프로필 관리 (해당 경로)
```

### 3. 성능 검증 (선택)
```bash
npm run build
npm run preview
# Lighthouse 점수 확인 (Performance, Accessibility, Best Practices)
```

### 4. 최종 배포
```bash
git push origin main
# Vercel 자동 배포 트리거
# Preview URL 테스트
# Production 배포 승인
```

---

## 문제 해결

### 문제: 색상이 너무 밝거나 어두움
**원인**: 색상 레벨 선택 오류
**해결**:
1. DESIGN_SYSTEM.md에서 색상 대비 확인
2. 한 레벨 위/아래로 변경
3. 재검증

### 문제: 타이포그래피 크기가 맞지 않음
**원인**: 기존 스타일과 새 스케일의 불일치
**해결**:
1. 기존 px 값과 새 폰트 크기 비교
2. 가장 가까운 레벨 선택
3. 필요시 custom font-size 추가

### 문제: 레이아웃이 깨짐
**원인**: 스페이싱 변경으로 인한 오버플로우
**해결**:
1. 컨테이너 width 확인
2. 내부 요소의 마진/패딩 조정
3. 반응형 브레이크포인트 확인

### 문제: 콘솔 에러 발생
**원인**: 존재하지 않는 클래스 또는 구문 오류
**해결**:
1. 오류 메시지 읽기
2. 해당 파일에서 오류 원인 찾기
3. Tailwind 클래스명 확인
4. 재빌드 (`npm run dev`)

---

## 성공 기준

모든 항목이 충족되어야 배포 가능:

✅ 모든 12개 페이지가 새 디자인 시스템 토큰 사용
✅ 시각적 회귀 없음 (모든 기능 정상 작동)
✅ 색상, 타이포, 스페이싱 일관성
✅ 콘솔 에러 없음
✅ 모든 PR이 코드 리뷰 승인됨
✅ 전체 앱 smoke test 완료

---

## 다음 단계

모든 검증 완료 후:
1. Production 배포
2. A/B 테스트 (선택, 사용자 영향 없는 변경)
3. 성능 모니터링 (Vercel Analytics)

→ [타임라인 및 리소스](2026-04-02-timeline-resources.md)

---

## 참고 자료

- 🔄 [리팩토링 워크플로우](2026-04-02-refactoring-workflow.md)
- 📋 [전체 프로젝트 개요](2026-04-02-page-refactoring-overview.md)
