# CSS 정리

HTML/CSS 2일차 선택 과제 — CSS의 기본 개념부터 적용 방식, 선택자, 텍스트 속성, 박스 모델까지 정리.

## 1. CSS란?

**CSS(Cascading Style Sheets)**는 HTML로 작성된 문서의 **모양(레이아웃, 색상, 글꼴, 여백 등)을 정의**하는 스타일 언어다.

- HTML이 문서의 **구조와 의미**(무엇이 제목이고, 무엇이 목록인지)를 담당한다면, CSS는 그 요소들이 **화면에 어떻게 보일지**를 담당한다.
- "Cascading(계단식)"이라는 이름처럼, 여러 스타일 규칙이 충돌할 때 **우선순위(specificity)**와 **작성 순서**에 따라 위에서 아래로 적용되며 마지막/더 구체적인 규칙이 이긴다.
- 기본 문법:
  ```css
  선택자 {
    속성: 값;
  }
  ```

## 2. CSS를 적용하는 3가지 방법

### 2-1. Inline CSS (인라인 스타일)
HTML 태그의 `style` 속성에 직접 작성.

```html
<p style="color: red; font-size: 16px;">인라인으로 스타일 적용</p>
```

- 장점: 해당 요소에만 즉시 적용, 빠르게 테스트할 때 편함
- 단점: 재사용 불가능, HTML과 CSS가 뒤섞여 유지보수 어려움, 우선순위가 가장 높아서 다른 CSS를 덮어써버리기 쉬움

### 2-2. Internal CSS (내부 스타일시트)
문서의 `<head>` 안에 `<style>` 태그로 작성.

```html
<head>
  <style>
    p {
      color: blue;
    }
  </style>
</head>
```

- 장점: 해당 HTML 문서 전체에 규칙 재사용 가능
- 단점: 다른 HTML 문서와는 공유 불가능 → 문서가 여러 개면 매번 중복 작성해야 함

### 2-3. External CSS (외부 스타일시트)
별도의 `.css` 파일로 작성 후 `<link>` 태그로 연결.

```html
<head>
  <link rel="stylesheet" href="style.css">
</head>
```

```css
/* style.css */
p {
  color: green;
}
```

- 장점: 여러 HTML 문서에서 하나의 CSS 파일을 공유 → 유지보수 가장 쉬움, 실무에서 기본적으로 사용하는 방식
- 단점: 파일을 하나 더 요청해야 해서 첫 로딩에 약간의 시간이 걸림 (다만 브라우저 캐싱으로 보완됨)

> 실습한 이력서(`resume.html`)에서도 1일차에는 별도 스타일 없이 순수 HTML만 작성했고, 2일차에 `resume_style.css`를 External CSS로 연결해 스타일을 적용했다.

### 2-4. (참고) @import 규칙
`<style>` 태그 내부에서 다른 CSS 파일을 불러오는 방법도 있다.

```html
<style>
  @import url("style.css");
</style>
```

- 반드시 스타일시트의 다른 규칙보다 **먼저** 작성되어야 동작한다.
- 파일을 순차적으로 불러오기 때문에 `<link>` External CSS보다 로딩이 느려질 수 있어, 실무에서는 `<link>` 방식을 더 권장한다.

## 3. CSS Selector (선택자)

어떤 HTML 요소에 스타일을 적용할지 지정하는 방법. (CSS Diner에서 32단계에 걸쳐 연습한 내용과 이어짐 → `CSS_Diner_정리.md` 참고)

| 선택자 | 예시 | 의미 |
|---|---|---|
| 전체 선택자 | `*` | 모든 요소 |
| 태그(타입) 선택자 | `p` | 모든 `<p>` 요소 |
| 클래스 선택자 | `.title` | `class="title"`인 요소 (여러 개에 재사용 가능) |
| id 선택자 | `#header` | `id="header"`인 단 하나의 요소 |
| 자손 선택자 | `div p` | `div` 내부에 있는 모든 `p` (몇 단계든 상관없이) |
| 자식 선택자 | `div > p` | `div`의 바로 아래 자식인 `p`만 |
| 인접 형제 선택자 | `h1 + p` | `h1` 바로 다음에 오는 형제 `p` |
| 일반 형제 선택자 | `h1 ~ p` | `h1` 뒤에 오는 모든 형제 `p` |
| 속성 선택자 | `input[type="text"]` | 특정 속성/값을 가진 요소 |
| 가상 클래스 | `a:hover`, `li:first-child` | 특정 상태이거나 특정 위치에 있는 요소 |

- id는 문서 내에서 유일해야 하므로 재사용이 필요 없는 특정 요소 하나를 지정할 때, class는 여러 요소에 같은 스타일을 반복 적용할 때 사용한다.

### 3-1. 선택자 우선순위 (구체성/명시도, Specificity)
같은 요소에 여러 규칙이 겹칠 때, 어떤 선택자가 이길지는 **구체성(명시도)** 점수로 결정된다. `(인라인, id, class/속성/가상클래스, 태그/가상요소)` 4자리 값으로 계산한다.

| 선택자 종류 | 점수 |
|---|---|
| 인라인 스타일 (`style="..."`) | 1,0,0,0 |
| id 선택자 (`#id`) | 0,1,0,0 |
| class·속성·가상클래스 (`.class`, `[type]`, `:hover`) | 0,0,1,0 |
| 태그·가상요소 (`p`, `::before`) | 0,0,0,1 |
| 전체 선택자 (`*`) | 0,0,0,0 (영향 없음) |

```css
h2         /* 0,0,0,1 */
.title     /* 0,0,1,0 */
#header    /* 0,1,0,0 */
p.title#id /* 0,1,1,1 — 가장 구체적 */
```

- 점수가 높은 선택자가 우선 적용되고, 점수가 같으면 **나중에 선언된(코드 상 아래에 있는) 규칙**이 이긴다.
- `!important`를 붙이면 이 구체성 계산과 무관하게 최우선으로 적용된다 (단, `!important`끼리 겹치면 그 안에서 다시 구체성으로 비교). 예외적인 경우가 아니면 남용하지 않는 것이 좋다.

## 4. style 속성

HTML 요소에 `style="속성: 값;"` 형태로 직접 스타일을 지정하는 인라인 방식의 속성 자체를 가리킨다 (2번의 Inline CSS와 동일한 내용). 세미콜론(`;`)으로 여러 선언을 구분한다.

```html
<div style="background-color: #cad2c5; padding: 12px;">...</div>
```

## 5. Text 관련 속성

| 속성 | 설명 | 예시 값 |
|---|---|---|
| `font-size` | 글자 크기 | `16px`, `1rem`, `1.2em` |
| `font-weight` | 글자 굵기 | `normal`, `bold`, `100~900` |
| `text-align` | 텍스트 정렬(가로) | `left`, `center`, `right`, `justify` |
| `font-family` | 글꼴 종류 | `"Pretendard", sans-serif` |
| `line-height` | 줄 간격 | `1.5`, `24px` |
| `color` | 글자 색상 | `#333`, `rgb(0,0,0)` |

- `font-size`의 단위는 `px`(고정 크기)와 `rem`/`em`(상대 크기)로 나뉜다. `rem`은 루트(`html`)의 font-size를 기준으로, `em`은 부모 요소의 font-size를 기준으로 계산되어 반응형 디자인에 더 유리하다.
- `font-weight`는 숫자(`400`=normal, `700`=bold)로도 쓸 수 있으며, 실제로 그 굵기를 지원하는 폰트 파일이 로드돼 있어야 정확히 반영된다.

## 6. Box Model (박스 모델)

모든 HTML 요소는 브라우저에서 하나의 **사각형 박스**로 렌더링되며, 이 박스는 안쪽에서 바깥쪽으로 4개의 영역으로 구성된다.

```
┌─────────────────────────────┐
│           margin             │  ← 요소 바깥 여백 (다른 요소와의 간격)
│  ┌─────────────────────────┐ │
│  │        border           │ │  ← 테두리
│  │  ┌─────────────────────┐│ │
│  │  │      padding        ││ │  ← 테두리와 내용 사이 여백
│  │  │  ┌─────────────────┐││ │
│  │  │  │     content     │││ │  ← 실제 텍스트/이미지 등 내용
│  │  │  └─────────────────┘││ │
│  │  └─────────────────────┘│ │
│  └─────────────────────────┘ │
└─────────────────────────────┘
```

- **content**: 텍스트, 이미지 등 실제 내용이 표시되는 영역. `width`/`height`로 크기 지정
- **padding**: content와 border 사이의 내부 여백. 배경색이 적용되는 영역에 포함됨
- **border**: 요소의 테두리. `border-width`, `border-style`, `border-color`로 구성
- **margin**: border 바깥, 다른 요소와의 거리를 만드는 외부 여백. 배경색이 적용되지 않음

### width / height
`content` 영역만의 크기를 지정. 기본적으로 `width: 100px`이라고 써도 실제 요소가 차지하는 전체 너비는 `width + padding + border`만큼 더 커진다 (아래 `box-sizing` 참고).

### box-sizing
`width`/`height`가 어느 영역을 기준으로 계산될지 결정하는 속성.

- `content-box` (기본값): `width`/`height`가 content 영역만의 크기. padding/border는 별도로 추가됨 → 요소의 실제 크기를 예측하기 어려움
- `border-box`: `width`/`height`가 content+padding+border를 모두 포함한 크기. padding이나 border를 늘려도 요소의 전체 크기가 변하지 않음 → 레이아웃을 훨씬 예측하기 쉬워서 실무에서는 보통 전체 요소에 일괄 적용한다.

```css
* {
  box-sizing: border-box;
}
```

> 이번 이력서(`resume_style.css`)에서도 `* { box-sizing: border-box; }`를 최상단에 선언해서, 이후 padding/border 값을 추가해도 프로젝트 카드나 버튼의 전체 너비가 틀어지지 않도록 했다.

## 참고
- 선택자 실습: [`CSS_Diner_정리.md`](../day1/CSS_Diner_정리.md)
- 정렬/배치 실습: [`Flexbox_Froggy_정리.md`](./Flexbox_Froggy_정리.md)
- [코딩에브리바디 - CSS 카테고리](https://codingeverybody.kr/category/css/)
- [코딩에브리바디 - HTML에 CSS 적용과 연결하는 방법](https://codingeverybody.kr/html%ec%97%90-css-%ec%a0%81%ec%9a%a9%ed%95%98%ea%b8%b0/)
- [코딩에브리바디 - CSS 선택자의 구체성 값(명시도)](https://codingeverybody.kr/css-%ec%84%a0%ed%83%9d%ec%9e%90%ec%9d%98-%ea%b5%ac%ec%b2%b4%ec%84%b1-%ea%b0%92/)
