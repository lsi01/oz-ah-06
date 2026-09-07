# JavaScript DOM 조작법 정리 (2일차 [선택] 과제)

2일차 [필수] 계산기 과제에서 쓴 `querySelector` / `addEventListener` 가
무엇인지, 그 배경이 되는 DOM · Event · Web API 개념을 정리한다.

---

## 1. DOM (Document Object Model) 이란?

- 브라우저가 HTML 문서를 읽어서 만든 **객체 트리**. HTML의 태그 하나하나가 노드(node) 객체가 된다.
- HTML은 그냥 텍스트지만, DOM은 JavaScript로 **읽고 바꿀 수 있는 구조**다.
  브라우저는 DOM이 바뀌면 화면을 다시 그린다 → JS로 DOM을 조작 = 화면을 동적으로 바꾼다.
- 진입점은 전역 객체 `document`.

```
document
 └ html
    ├ head
    │  └ title
    └ body
       └ div.calculator
          ├ input#display
          └ div.buttons
             ├ button.number ...
             └ ...
```

| 용어 | 의미 |
| --- | --- |
| 노드(Node) | 트리의 한 점. 요소·텍스트·주석 등 모두 노드 |
| 요소(Element) | 노드 중 태그에 해당하는 것 (`<div>`, `<button>` …) |
| 부모/자식/형제 | 트리에서의 관계. `parentElement`, `children`, `nextElementSibling` 등으로 이동 |

---

## 2. Selector(선택자)로 DOM 요소 가져오기

DOM을 조작하려면 먼저 **원하는 요소를 손에 넣어야** 한다.

### 2-1. CSS 선택자 기반 (권장)

```js
document.querySelector("#display");        // id 가 display 인 첫 요소
document.querySelector(".buttons");        // class 가 buttons 인 첫 요소
document.querySelector('[data-type="power"]'); // 속성 선택자
document.querySelectorAll("button");       // 조건에 맞는 모든 요소 (NodeList)
```

- `querySelector(선택자)` : 조건에 맞는 **첫 번째** 요소 하나. 없으면 `null`.
- `querySelectorAll(선택자)` : 맞는 **모든** 요소를 담은 `NodeList`. `forEach` 로 순회 가능.
- 선택자 문법이 CSS와 똑같아서 복잡한 조건도 한 줄로 표현된다:
  `querySelectorAll("button:not([data-type='power'])")`

### 2-2. 예전 방식 (지금도 동작함)

| 메서드 | 반환 | 특징 |
| --- | --- | --- |
| `getElementById("display")` | 요소 1개 | `#` 없이 id 문자열만. 가장 빠름 |
| `getElementsByClassName("number")` | HTMLCollection | **실시간(live)** — DOM이 바뀌면 목록도 바뀜 |
| `getElementsByTagName("button")` | HTMLCollection | 위와 동일 |

> `querySelector` 계열은 문법이 일관되고 CSS 지식을 그대로 쓸 수 있어 오늘날 기본 선택이다.
> `querySelectorAll` 의 결과는 **정적(static)** 스냅샷이라는 점만 기억하면 된다.

### 2-3. 가져온 뒤 자주 하는 조작

```js
const display = document.querySelector("#display");
const title = document.querySelector("h1");

display.value = "0";                  // 폼 요소(input 등)의 값은 .value 로 읽고 쓴다
title.textContent = "안녕";           // input 이 아닌 요소 안의 텍스트는 .textContent
display.style.backgroundColor = "#222"; // 인라인 스타일
display.classList.add("on");           // 클래스 추가 / remove / toggle / contains
display.setAttribute("disabled", "");   // 속성
display.dataset.type;                   // data-* 속성 읽기 (data-type → dataset.type)
```

> `<input>` 은 화면에 보이는 값이 `.value` 다. `.textContent` 를 넣어도 표시되지 않는다.

---

## 3. Event(이벤트) 란?

- 브라우저에서 **일어나는 사건**. 사용자가 클릭·입력·스크롤하거나, 페이지가 로드되거나, 타이머가 끝나는 것 모두 이벤트.
- 이벤트가 발생하면 브라우저는 그 정보를 담은 **이벤트 객체(event object)** 를 만들어 등록된 함수에 전달한다.

자주 쓰는 이벤트

| 분류 | 이벤트 | 발생 시점 |
| --- | --- | --- |
| 마우스 | `click`, `dblclick`, `mouseover`, `mouseout` | 클릭 / 더블클릭 / 올라감 / 벗어남 |
| 키보드 | `keydown`, `keyup` | 키를 누름 / 뗌 |
| 폼 | `input`, `change`, `submit` | 값 입력 중 / 값 확정 / 폼 제출 |
| 문서 | `DOMContentLoaded`, `load` | HTML 파싱 완료 / 이미지까지 로드 완료 |

이벤트 객체에서 자주 쓰는 것

```js
event.target        // 이벤트가 실제로 일어난 요소
event.currentTarget // 리스너가 붙어 있는 요소
event.key           // 눌린 키 ("Enter", "1", "+" …)  ← 계산기 키보드 입력에 사용
event.preventDefault()  // 기본 동작 취소 (예: submit 시 새로고침 막기)
event.stopPropagation() // 상위로 전파 중단
```

### 이벤트 흐름 (버블링)

요소를 클릭하면 이벤트는 **가장 안쪽 요소에서 발생 → 부모로 거슬러 올라간다(버블링).**
그래서 자식 버튼을 클릭해도 부모 `.buttons` 에 붙인 리스너가 반응한다. → **이벤트 위임**의 원리.

---

## 4. EventListener(이벤트 리스너)

### 4-1. EventListener 란?

- 특정 요소에서 **어떤 이벤트가 발생하면 실행할 함수**를 등록해 두는 것.
- `요소.addEventListener("이벤트이름", 콜백함수)` 형태.
- 등록된 콜백을 **이벤트 핸들러(handler)** 라고 부른다.

### 4-2. 사용하는 목적 · 이유

| 방식 | 문제점 |
| --- | --- |
| HTML에 `onclick="fn()"` 직접 작성 | 구조(HTML)와 동작(JS)이 섞임. 한 이벤트에 함수 1개만 가능 |
| `el.onclick = fn` | 역시 **하나만** 등록 가능. 나중 값이 이전 값을 덮어씀 |
| **`addEventListener`** | 구조와 동작 분리 / **여러 개 등록 가능** / `removeEventListener` 로 해제 / 옵션(`once`, `capture` …) 지정 |

> 2일차 계산기에서 버튼에 `onclick` 을 쓰지 않고 `data-*` 속성만 두고,
> JS에서 `addEventListener` 로 동작을 연결한 이유가 바로 이 "구조와 동작 분리"다.

### 4-3. EventListener 정의하기

```js
const button = document.querySelector(".enter");

// 1) 이름 있는 함수
function handleClick(event) {
  console.log("clicked", event.target);
}
button.addEventListener("click", handleClick);

// 2) 익명 화살표 함수
button.addEventListener("click", (event) => {
  console.log(event.type); // "click"
});

// 3) 해제 — 등록할 때와 "같은 함수 참조"를 넘겨야 해제된다
button.removeEventListener("click", handleClick);

// 4) 옵션
button.addEventListener("click", handleClick, { once: true }); // 한 번만 실행되고 자동 해제
```

### 4-4. EventListener 응용

**(a) 이벤트 위임 (event delegation)**
버튼마다(이 계산기는 18개) 각각 리스너를 다는 대신, **부모 하나에만** 달고 `event.target` 으로 판별한다.
리스너가 1개라 가볍고, 버튼을 나중에 추가해도 그대로 동작한다.

```js
buttons.addEventListener("click", (event) => {
  const button = event.target.closest("button"); // 클릭 지점에서 가장 가까운 button
  if (!button) return;                            // 버튼 밖(gap)을 눌렀으면 무시
  const { type, value } = button.dataset;         // data-type, data-value
  if (type === "digit") pressDigit(value);
  // ...
});
```

**(b) 서로 다른 입력을 같은 처리로 묶기**
계산기는 마우스 클릭과 키보드 입력을 **같은 함수**(`pressDigit`, `pressOperator` …)로 처리한다.
`click` 리스너와 `keydown` 리스너가 동일한 로직을 공유한다.

```js
document.addEventListener("keydown", (event) => {
  const key = event.key;
  if (key >= "0" && key <= "9") pressDigit(key);
  else if (["+", "-", "*", "/"].includes(key)) pressOperator(key);
  else if (key === "Enter" || key === "=") pressEnter();
  else if (key === "Escape") pressClear();
});
```

**(c) 로드 시점 제어**
스크립트가 DOM보다 먼저 실행되면 `querySelector` 가 `null` 을 반환한다.
`<script>` 를 `<body>` 끝에 두거나, `DOMContentLoaded` 리스너 안에서 초기화한다.

```js
document.addEventListener("DOMContentLoaded", () => {
  // 여기서 querySelector / addEventListener 초기화
});
```

---

## 5. Web API

### 5-1. Web API 의 정의

- **브라우저가 JavaScript에 제공하는 기능 모음**. 언어(JavaScript 문법·`Math`·`Array` 등) 자체가 아니라,
  브라우저 환경이 추가로 얹어주는 도구다.
- `window` 객체를 통해 접근한다 (`window.document`, `window.localStorage`, `window.fetch` …).
  전역이라 보통 `window.` 을 생략한다.
- Node.js 환경에는 `document` 나 `localStorage` 가 없다 → Web API는 **브라우저 한정**.

### 5-2. Web API 의 예시

| API | 역할 | 대표 멤버 | 계산기에서 |
| --- | --- | --- | --- |
| **DOM API** | 문서 구조 읽기·수정 | `document.querySelector`, `element.classList`, `textContent` | 버튼·디스플레이 선택, 클래스 토글 |
| **Event API** | 이벤트 등록·처리 | `addEventListener`, `removeEventListener`, `Event` 객체 | 클릭·키보드 입력 처리 |
| **Timer API** | 일정 시간 뒤/주기적 실행 | `setTimeout`, `setInterval`, `clearTimeout` | (미사용) 결과 잠깐 표시 후 초기화 등에 활용 가능 |
| **Storage API** | 브라우저에 key-value 저장 | `localStorage`(영구), `sessionStorage`(탭 단위) | (미사용) 마지막 계산식 기억 등에 활용 가능 |
| **Fetch API** | 네트워크 요청 (HTTP) | `fetch(url)` → `Promise<Response>` | (미사용) 서버와 데이터 주고받기 |

```js
// Timer
const id = setTimeout(() => console.log("2초 뒤 실행"), 2000);
clearTimeout(id); // 예약 취소

const tick = setInterval(() => console.log("1초마다"), 1000);
clearInterval(tick);

// Storage — 값은 항상 문자열로 저장됨
localStorage.setItem("lastResult", "42");
localStorage.getItem("lastResult"); // "42"
localStorage.removeItem("lastResult");

// Fetch — 비동기
fetch("https://api.example.com/data")
  .then((response) => response.json())
  .then((data) => console.log(data))
  .catch((error) => console.error(error));
```

---

## 참고자료

- MDN — [문서 객체 모델 (DOM)](https://developer.mozilla.org/ko/docs/Web/API/Document_Object_Model)
- MDN — [선택자로 DOM 요소 선택하기](https://developer.mozilla.org/ko/docs/Web/API/Document_Object_Model/Selection_and_traversal_on_the_DOM_tree)
- MDN — [EventTarget.addEventListener()](https://developer.mozilla.org/ko/docs/Web/API/EventTarget/addEventListener)
- MDN — [이벤트 입문](https://developer.mozilla.org/ko/docs/Learn_web_development/Core/Scripting/Events)
- MDN — [Web API 목록](https://developer.mozilla.org/ko/docs/Web/API)
