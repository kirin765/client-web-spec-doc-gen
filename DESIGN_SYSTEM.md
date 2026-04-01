# Design System Guide

모든 UI 요소가 일관되게 보이도록 하기 위한 설계 원칙과 토큰 정의서입니다.

---

## 🎨 Color Palette (색상 팔레트)

### Primary - Sky Blue (신뢰성, 주요 행동)
```
primary-50:  #f0f9ff   (매우 밝음)
primary-100: #e0f2fe
primary-200: #bae6fd
primary-300: #7dd3fc
primary-400: #38bdf8
primary-500: #0ea5e9   ← Main primary color
primary-600: #0284c7   ← Interactive states
primary-700: #0369a1   ← Hover
primary-800: #075985
primary-900: #0c3a66   (매우 어두움)
```

**사용 시기:**
- 주요 버튼, 링크
- 포커스 상태
- 중요 정보 강조
- Interactive elements

### Secondary - Slate (중립적, 텍스트, 배경)
```
secondary-50:  #f8fafc (배경)
secondary-100: #f1f5f9
secondary-200: #e2e8f0
secondary-300: #cbd5e1
secondary-400: #94a3b8
secondary-500: #64748b (body text)
secondary-600: #475569
secondary-700: #334155 (headings)
secondary-800: #1e293b
secondary-900: #0f172a (매우 어두움)
```

**사용 시기:**
- 배경색
- 기본 텍스트
- 경계선
- 중성적 요소

### Success - Green (성공, 긍정)
```
success-500: #22c55e
success-600: #16a34a
success-700: #15803d
```

**사용 시기:**
- 성공 메시지
- 확인 버튼
- 완료 상태

### Warning - Amber (주의, 경고)
```
warning-500: #eab308
warning-600: #ca8a04
warning-700: #a16207
```

**사용 시기:**
- 경고 메시지
- 주의 필요한 항목
- 조건부 행동

### Error - Red (오류, 위험)
```
error-500: #ef4444
error-600: #dc2626
error-700: #b91c1c
```

**사용 시기:**
- 오류 메시지
- 삭제 버튼
- 실패 상태

### Neutral - Gray (백그라운드, 보조)
```
neutral-50:  #fafafa
neutral-100: #f5f5f5
neutral-200: #e5e5e5
neutral-500: #737373
neutral-900: #171717
```

**사용 시기:**
- 배경
- 비활성 상태
- 보조 정보

---

## 📝 Typography (타이포그래피)

### Font Family
```css
font-display: Pretendard (제목)
font-body: Pretendard (본문)
font-mono: Monospace (코드, 가격)
```

### Heading Sizes (제목)

| Class | Size | Weight | Use Case |
|-------|------|--------|----------|
| `text-display-lg` | 48px | 700 | 페이지 메인 제목 |
| `text-display-md` | 36px | 700 | 섹션 헤더 |
| `text-display-sm` | 28px | 700 | 서브 섹션 |
| `text-heading-xl` | 24px | 600 | 카드 제목 |
| `text-heading-lg` | 20px | 600 | 모달 제목 |
| `text-heading-md` | 18px | 600 | 서브 헤더 |
| `text-heading-sm` | 16px | 600 | 폼 라벨 |
| `text-heading-xs` | 14px | 600 | 작은 라벨 |

### Body Sizes (본문)

| Class | Size | Weight | Use Case |
|-------|------|--------|----------|
| `text-body-lg` | 16px | 400 | 메인 본문 |
| `text-body-md` | 15px | 400 | 기본 텍스트 |
| `text-body-sm` | 14px | 400 | 설명 텍스트 |
| `text-body-xs` | 12px | 400 | 보조 정보 |

### Caption Sizes (캡션)

| Class | Size | Weight | Use Case |
|-------|------|--------|----------|
| `text-caption-md` | 13px | 500 | 라벨, 메타 정보 |
| `text-caption-sm` | 12px | 500 | 작은 라벨 |

---

## 📐 Spacing Scale (공간)

8px 기본 단위의 일관된 공간 시스템:

```
0   = 0px
1   = 4px   (매우 작은 간격)
2   = 8px   (기본)
3   = 12px
4   = 16px  (카드 내 패딩)
5   = 20px
6   = 24px  (섹션 간 공간)
7   = 28px
8   = 32px  (큰 섹션)
9   = 36px
10  = 40px
12  = 48px  (매우 큼)
16  = 64px
20  = 80px
24  = 96px
```

**사용 예:**
```html
<!-- 패딩: 카드 내부 공간 -->
<div class="p-6">...</div>

<!-- 마진: 요소 간 공간 -->
<div class="mb-8">...</div>

<!-- 갭: 플렉스/그리드 간격 -->
<div class="flex gap-4">...</div>
```

---

## 🎭 Border Radius (모서리)

| Class | Size | Use Case |
|-------|------|----------|
| `rounded-xs` | 4px | 작은 버튼, 작은 입력 필드 |
| `rounded-sm` | 6px | 배지, 라벨 |
| `rounded-md` | 8px | 기본 (입력 필드, 버튼) |
| `rounded-lg` | 12px | 카드, 모달 |
| `rounded-xl` | 16px | 큰 카드, 이미지 |
| `rounded-2xl` | 20px | 큰 컴포넌트 |
| `rounded-full` | 9999px | 아바타, 배지 |

---

## 🌑 Shadows (그림자)

깊이와 고도감을 표현하는 그림자 시스템:

| Class | Use Case |
|-------|----------|
| `shadow-xs` | 매우 미묘한 요소 |
| `shadow-sm` | 기본 요소 |
| `shadow-md` | 카드, 팝오버 |
| `shadow-lg` | 드롭다운, 토스트 |
| `shadow-card` | 카드 기본 상태 |
| `shadow-card-hover` | 카드 호버 상태 |
| `shadow-modal` | 모달, 바텀 시트 |

---

## ⏱️ Transitions (전환 효과)

부드러운 상호작용을 위한 전환:

```css
duration-fast: 150ms     (클릭, 즉각적 반응)
duration-base: 200ms     (기본, 상호작용)
duration-slow: 300ms     (느린 애니메이션)
duration-slower: 500ms   (매우 느린 애니메이션)

timing-ease-smooth: cubic-bezier(0.4, 0, 0.2, 1)  (자연스러움)
timing-ease-bounce: cubic-bezier(0.34, 1.56, 0.64, 1)  (탄성)
```

**사용 예:**
```html
<button class="transition-colors duration-base hover:bg-primary-600">
  Hover me
</button>
```

---

## 🔘 Components (컴포넌트)

### Button Styles

```html
<!-- Primary button -->
<button class="btn btn-primary">
  Action Button
</button>

<!-- Secondary button -->
<button class="btn btn-secondary">
  Secondary Action
</button>

<!-- Ghost button -->
<button class="btn btn-ghost">
  Tertiary Action
</button>

<!-- Outline button -->
<button class="btn btn-outline">
  Outlined
</button>

<!-- Danger button -->
<button class="btn btn-danger">
  Delete
</button>

<!-- Size variants -->
<button class="btn btn-sm btn-primary">Small</button>
<button class="btn btn-lg btn-primary">Large</button>
```

### Input Fields

```html
<input type="text" class="input" placeholder="Enter text" />
<input type="text" class="input input-error" />
<input type="text" class="input input-success" />
```

### Cards

```html
<!-- Basic card -->
<div class="card p-6">
  <h3 class="heading-md">Card Title</h3>
  <p class="text-body-md">Card content</p>
</div>

<!-- Interactive card -->
<div class="card card-interactive p-6 hover:cursor-pointer">
  <h3 class="heading-md">Click me</h3>
</div>
```

### Badges

```html
<span class="badge badge-primary">Primary</span>
<span class="badge badge-success">Success</span>
<span class="badge badge-warning">Warning</span>
<span class="badge badge-error">Error</span>
```

### Containers

```html
<!-- Standard container -->
<div class="container-base">...</div>

<!-- Large container -->
<div class="container-lg">...</div>

<!-- Medium container -->
<div class="container-md">...</div>
```

---

## 🏗️ Common Patterns (공통 패턴)

### Typography Hierarchy

```html
<!-- Page title -->
<h1 class="heading-display-lg text-secondary-900">Main Title</h1>

<!-- Section title -->
<h2 class="heading-xl text-secondary-900">Section Title</h2>

<!-- Subsection -->
<h3 class="heading-lg text-secondary-800">Subsection</h3>

<!-- Body text -->
<p class="text-body-md text-secondary-700">
  This is regular body text with proper hierarchy.
</p>

<!-- Secondary text -->
<p class="text-body-sm text-secondary-600">
  This is secondary information.
</p>
```

### Card Layout

```html
<div class="card">
  <div class="p-6 border-b border-secondary-200">
    <h3 class="heading-lg">Card Header</h3>
  </div>

  <div class="p-6">
    <p class="text-body-md">Card content</p>
  </div>

  <div class="p-6 border-t border-secondary-200 flex-between">
    <button class="btn btn-ghost">Cancel</button>
    <button class="btn btn-primary">Save</button>
  </div>
</div>
```

### Form Layout

```html
<form class="space-y-6">
  <div>
    <label class="text-heading-sm text-secondary-900 mb-2 block">
      Email
    </label>
    <input type="email" class="input w-full" placeholder="you@example.com" />
    <p class="text-body-xs text-secondary-500 mt-2">Help text here</p>
  </div>

  <div class="flex-between gap-4">
    <button class="btn btn-ghost flex-1">Cancel</button>
    <button class="btn btn-primary flex-1">Submit</button>
  </div>
</form>
```

---

## ✅ Best Practices

1. **일관된 색상 사용** - 정의된 색상만 사용하세요
2. **계층적 타이포그래피** - 명확한 제목/본문 구분
3. **넉넉한 공간** - 최소 16px(2단위) 이상 여유
4. **카드 우위** - 중요한 정보는 카드로 감싸기
5. **초점 상태** - 모든 인터랙티브 요소에 focus 상태 추가
6. **모바일 우선** - sm/lg 반응형 클래스 활용
7. **전환 효과** - hover/active에 transition-colors 추가
8. **접근성** - 충분한 색상 대비 (AA 표준 이상)

---

## 🚀 Quick Reference

```html
<!-- 전형적인 페이지 구조 -->
<div class="min-h-screen bg-neutral-50">
  <header class="bg-white border-b border-secondary-200">
    <div class="container-base py-6">
      <h1 class="heading-display-md">Page Title</h1>
    </div>
  </header>

  <main class="container-base py-12">
    <section class="mb-12">
      <h2 class="heading-xl mb-6">Section</h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div class="card card-interactive p-6">
          <h3 class="heading-lg mb-4">Item</h3>
          <p class="text-body-md text-secondary-600">Description</p>
        </div>
      </div>
    </section>
  </main>
</div>
```

---

## 📞 Support

새로운 토큰이 필요하거나 개선 사항이 있으면 팀에 알려주세요!
