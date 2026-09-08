# JavaScript 전체 복습 정리 (1~3일차 통합)

day1(기초) · day2(DOM/이벤트) · day3(실전: 실시간 코인 트래커)에서 다룬 개념을
과목 전체 복습용으로 모았다. 예제는 과제 코드 그대로가 아니라, 그 개념 하나만 보여주는
짧은 독립 예제로 새로 작성했다. 각 파트 끝에 직접 풀어보는 문제가 있다 — 답은
`<details>` 로 접어뒀으니 먼저 풀어보고 펼쳐서 확인할 것.
세부 원문: [day1 기초 정리](day1/JavaScript_기초_정리.md) · [day2 DOM 조작 정리](day2/JavaScript_DOM_조작_정리.md)

---

## 1. 기본 문법 (day1)

### 1-1. 자료형 & 변수

| 타입 | 설명 |
| --- | --- |
| `number` | 정수/실수 구분 없음. `NaN`, `Infinity` 포함 |
| `string` | `'`, `"`, `` ` `` (템플릿 리터럴) |
| `boolean` | `true` / `false` |
| `null` | 개발자가 **의도적으로** "없음" 지정 |
| `undefined` | 아직 값이 할당되지 않은 상태 |

```js
let count = 0;     // 재할당 가능
const PI = 3.14;   // 재할당 불가 (기본은 const, 바뀔 때만 let)
```
- `const`는 재할당만 막는다 — 배열/객체 **내부** 값은 여전히 바꿀 수 있다.
- `typeof null === "object"`는 언어 초창기부터 있는 유명한 버그.

### 1-2. 연산자

```js
7 % 3;       // 1     나머지
2 ** 10;     // 1024  거듭제곱
1 == "1";    // true  타입 변환 후 비교 (쓰지 않는다)
1 === "1";   // false 값+타입 비교 (항상 이걸 쓴다)
1 + "2";     // "12"  문자열이 섞이면 이어붙이기
"5" - 2;     // 3     -  *  / 는 반대로 숫자 변환
```
- falsy: `false, 0, -0, 0n, "", null, undefined, NaN` — 나머지는 전부 truthy (`"0"`, `[]`, `{}` 포함).
- 단축 평가: `const name = userName || "손님";` / `isLoggedIn && showDashboard();`

### 1-3. 제어문 & 함수 · 스코프

```js
const grade = score >= 60 ? "합격" : "불합격";   // 삼항 연산자

function add(a, b) { return a + b; }             // 함수 선언문
const sub = function (a, b) { return a - b; };   // 함수 표현식
const mul = (a, b) => a * b;                     // 화살표 함수
```

```js
// 스코프 체인 & 변수 가리기(shadowing)
const level = "전역";
function outer() {
  const level = "outer";           // 전역 level 을 가림
  function inner() {
    console.log(level);            // "outer" — 안쪽에 없으면 바깥으로 올라가며 찾는다
  }
  inner();
}
outer();
console.log(level);                // "전역" — 바깥 값은 그대로
```

### 1-4. 배열 / 객체 고차 함수

```js
const nums = [1, 2, 3, 4, 5];
nums.map((x) => x * 2);            // [2,4,6,8,10]  변환
nums.filter((x) => x % 2 === 0);   // [2,4]         걸러내기
nums.reduce((sum, x) => sum + x, 0); // 15          누적
nums.find((x) => x > 3);           // 4             첫 일치 요소

const user = { name: "성일", age: 20 };
Object.keys(user);    // ["name","age"]
Object.values(user);  // ["성일",20]
Object.entries(user); // [["name","성일"],["age",20]]
```

### ✏️ 연습문제 — 기본 문법

1. `console.log(1 + "1" - 1);` 의 출력 결과는? 왜 그렇게 나오는지 한 줄로 설명하시오.
2. 배열 `[10, 21, 32, 43, 54]` 에서 **짝수만** 골라 각 값을 2배로 만든 새 배열을 만드시오 (`filter` + `map`).
3. 아래 코드의 출력을 예상하시오.
   ```js
   const x = 5;
   function test() {
     const x = 10;
     if (true) {
       const x = 15;
       console.log(x);
     }
     console.log(x);
   }
   test();
   console.log(x);
   ```

<details>
<summary>정답 보기</summary>

1. `10` (숫자). `1 + "1"` 은 문자열이 섞였으니 이어붙이기라 `"11"` 이 되고, `"11" - 1` 은 `-` 연산자가 양쪽을 숫자로 강제 변환하므로 `11 - 1 = 10`. `+` 는 문자열 우선, `- * /` 는 숫자 우선이라는 게 핵심.
2. ```js
   [10, 21, 32, 43, 54].filter((n) => n % 2 === 0).map((n) => n * 2);
   // [20, 64, 108]
   ```
3. `15` → `10` → `5`. `if` 블록도 스코프를 만들기 때문에 안쪽 `x`가 바깥 `x`를 가리고, 블록을 벗어나면 원래 스코프의 값이 그대로 보인다.

</details>

---

## 2. DOM · 이벤트 (day2)

### 2-1. DOM 요소 선택 & 값 읽고 쓰기

```js
const box = document.querySelector("#box");   // 첫 번째 일치 요소
document.querySelectorAll(".item");            // 모든 일치 요소 (NodeList, 정적)

box.textContent = "안녕";                      // 텍스트 (input이 아닌 요소)
box.classList.toggle("active");                // 클래스 add/remove/toggle
box.dataset.status;                             // data-status 속성
```
- `getElementById` / `getElementsByClassName`은 옛날 방식(후자는 live HTMLCollection). 지금은 `querySelector` 계열이 기본.
- `<input>`처럼 값이 있는 요소는 `.value`, 그 외 요소의 텍스트는 `.textContent`.

### 2-2. 이벤트 & 이벤트 리스너, 버블링, 이벤트 위임

```js
document.querySelector("#save").addEventListener("click", (event) => {
  console.log(event.target);   // 실제 이벤트가 일어난 요소
});
```
| 방식 | 문제 |
| --- | --- |
| `onclick="fn()"` (HTML 인라인) | 구조/동작 혼재, 하나만 가능 |
| `el.onclick = fn` | 역시 하나만, 나중 값이 덮어씀 |
| `addEventListener` | 여러 개 등록/해제 가능, 구조·동작 분리 (기본) |

```js
// 이벤트 위임: 버튼 10개마다 리스너 다는 대신 부모 하나에만 달기
document.querySelector("#list").addEventListener("click", (e) => {
  const li = e.target.closest("li");     // 클릭 지점에서 가장 가까운 li
  if (!li) return;                        // li 밖(여백)을 눌렀으면 무시
  console.log("선택:", li.dataset.id);
});
```
- **버블링**: 클릭한 지점(안쪽)에서 시작해 부모로 이벤트가 전파된다 → 그래서 부모에 리스너 하나만 있어도 자식 클릭에 반응한다.
- `DOMContentLoaded`: 스크립트가 DOM보다 먼저 실행돼 `querySelector`가 `null`을 반환하는 문제를 막는다.

### 2-3. Web API

| API | 대표 멤버 |
| --- | --- |
| Timer | `setTimeout`, `setInterval`, `clearInterval` |
| Storage | `localStorage.setItem/getItem/removeItem` (값은 항상 문자열) |
| Fetch | `fetch(url).then((res) => res.json())` |

### ✏️ 연습문제 — DOM·이벤트

1. `<ul id="fruits"><li data-id="1">사과</li><li data-id="2">배</li></ul>` 이 있을 때, `li`를 클릭하면 그 `data-id` 값을 `alert` 대신 `console.log`로 출력하는 코드를, **이벤트 위임** 방식으로 작성하시오.
2. `addEventListener` 대신 `el.onclick = fn`을 쓰면 안 되는 실무적인 이유 한 가지를 설명하시오.
3. 버튼을 누르면 3초 뒤에 "완료!"를 콘솔에 출력하되, 버튼을 두 번 이상 눌러도 메시지가 여러 번 겹쳐 뜨지 않게(이전 예약을 취소하고 다시 예약) 하는 코드를 작성하시오.

<details>
<summary>정답 보기</summary>

1. ```js
   document.querySelector("#fruits").addEventListener("click", (e) => {
     const li = e.target.closest("li");
     if (!li) return;
     console.log(li.dataset.id);
   });
   ```
2. `onclick = fn`은 한 요소에 **하나의 핸들러만** 걸 수 있어서, 나중에 다른 코드가 같은 방식으로 다시 할당하면 이전 핸들러가 조용히 사라진다(디버깅이 어려움). `addEventListener`는 여러 리스너를 동시에 등록/개별 해제할 수 있어 다른 코드와 충돌하지 않는다.
3. ```js
   let timerId = null;
   document.querySelector("#btn").addEventListener("click", () => {
     clearTimeout(timerId);              // 이전 예약 취소
     timerId = setTimeout(() => console.log("완료!"), 3000);
   });
   ```

</details>

---

## 3. 실전 응용 개념 (day3에서 실제로 쓰인 것)

day3 코인 트래커 프로젝트는 아래 개념들 위에서 동작한다. 예제는 프로젝트 코드가 아니라
그 개념만 뽑아낸 미니 버전.

### 3-1. 비동기 처리 — Promise / async·await

```js
async function getUser(id) {
  const res = await fetch(`https://api.example.com/users/${id}`); // Promise 가 풀릴 때까지 대기
  if (!res.ok) throw new Error("HTTP " + res.status);
  return await res.json();
}

async function main() {
  try {
    const user = await getUser(1);
    console.log(user);
  } catch (err) {
    console.error("실패:", err.message);   // .catch() 콜백과 동급
  }
}
```
- `async` 함수는 항상 Promise를 반환한다. `await`는 `async` 함수 안에서만 쓸 수 있다.
- `setTimeout` 체인으로 폴링을 만들면 `setInterval`과 달리 **이전 요청이 끝난 뒤에만** 다음 요청을 예약해서 요청이 밀리는(중첩되는) 걸 막는다:
  ```js
  function poll() {
    fetch("/api/ping").then(() => setTimeout(poll, 1000));
  }
  ```

### 3-2. 컬렉션 — `Map` / `Set`

```js
const cache = new Map();          // key-value, 순서 보장, 어떤 타입이든 key 가능
cache.set("apple", 3);
cache.get("apple");                // 3

const tags = new Set(["js", "css"]); // 중복 없는 값 모음
tags.has("js");                    // true
tags.add("js");                    // 이미 있으므로 무시됨, size 그대로
[...tags];                          // Set → 배열 변환 (spread)
```
- 일반 객체(`{}`)는 키가 문자열/심볼만 가능하고 크기(`size`)나 순회가 번거롭다. `Map`/`Set`은 어떤 타입이든 key로 쓸 수 있고, `size`·`forEach`·`for...of`가 삽입 순서대로 동작한다.

### 3-3. 구조분해 할당 & 전개 연산자(spread)

```js
const { name, age } = { name: "성일", age: 20 };   // 객체 구조분해
const [first, ...rest] = [1, 2, 3, 4];              // 배열 구조분해 + 나머지
const merged = { ...{ a: 1 }, ...{ b: 2 } };        // 객체 병합 → {a:1, b:2}
const copy = [...[1, 2, 3]];                        // 배열 얕은 복사
```

### 3-4. 클로저(closure) — 상태를 기억하는 함수

```js
function makeCounter() {
  let count = 0;                 // 이 스코프의 count 를 함수가 계속 기억한다
  return function () {
    count += 1;
    return count;
  };
}
const counter = makeCounter();
counter();  // 1
counter();  // 2
counter();  // 3  — 매번 호출해도 count 가 초기화되지 않는다
```
- 클로저 = 함수가 자신이 **정의된 시점의 스코프**를 기억하는 것. day3에서는 이걸로 "탭이 빠르게 전환돼도 오래된 폴링 체인이 스스로 멈추게" 하는 세대 번호(generation) 패턴을 만들었다.

### 3-5. 안전한 값 처리 — JSON / try-catch

```js
localStorage.setItem("user", JSON.stringify({ name: "성일" })); // 저장은 항상 문자열
const raw = localStorage.getItem("user");
const user = raw ? JSON.parse(raw) : null;

try {
  JSON.parse("이건 JSON이 아님");
} catch (err) {
  console.log("파싱 실패:", err.message);   // 앱이 죽지 않고 대처 가능
}
```

### 3-6. DOM 심화 — 동적 렌더링 & Web Animations API

```js
const li = document.createElement("li");     // 요소 새로 생성
li.textContent = "새 항목";
list.appendChild(li);

li.animate(
  [{ backgroundColor: "yellow" }, { backgroundColor: "transparent" }],
  { duration: 700, easing: "ease-out" }
);   // CSS 없이 JS만으로 하이라이트 애니메이션
```
- 데이터가 자주 갱신될 때 요소를 통째로 새로 만들지 않고 **기존 요소를 재사용 + 필요한 부분만 갱신**하면 스크롤 위치·클릭 대상이 흔들리지 않는다 (day3 테이블 렌더링 방식).

### 3-7. 브라우저 상태 이벤트 — `visibilitychange`

```js
document.addEventListener("visibilitychange", () => {
  if (document.hidden) console.log("탭 백그라운드 → 폴링 중지");
  else console.log("탭 복귀 → 폴링 재개");
});
```

### ✏️ 연습문제 — 실전 응용

1. `async function`을 `try/catch` 없이 호출했는데 내부에서 `fetch`가 실패(네트워크 오류)하면 어떤 일이 벌어지는가? (힌트: Promise가 reject 되면?)
2. `makeCounter()` 예제를 참고해서, 호출할 때마다 `"손님1"`, `"손님2"`, `"손님3"`... 처럼 번호가 붙는 이름을 반환하는 `makeGuestNamer()` 함수를 작성하시오.
3. "어떤 유저가 즐겨찾기한 상품 목록"을 저장할 때 일반 객체(`{}`)보다 `Set`을 쓰는 게 더 적합한 이유를 한 가지 드시오.

<details>
<summary>정답 보기</summary>

1. `await`가 실패한 Promise를 그대로 던지므로(throw), `try/catch`로 감싸지 않으면 **잡히지 않은 예외(Unhandled Promise Rejection)**가 되어 콘솔에 에러가 찍히고, 그 async 함수 안에서 `await` 뒤에 있던 코드는 실행되지 않는다.
2. ```js
   function makeGuestNamer() {
     let n = 0;
     return function () {
       n += 1;
       return `손님${n}`;
     };
   }
   const nextName = makeGuestNamer();
   nextName(); // "손님1"
   nextName(); // "손님2"
   ```
3. "즐겨찾기 여부"는 있음/없음만 중요하고 **중복이 없어야** 하므로 `Set`의 `has`/`add`/`delete`가 자연스럽다. 객체를 쓰면 `{ "상품1": true }`처럼 의미 없는 값을 억지로 채워야 하고, 중복 방지도 직접 신경 써야 한다.

</details>

---

## 참고자료

- MDN — [JavaScript 안내서](https://developer.mozilla.org/ko/docs/Web/JavaScript/Guide)
- MDN — [async function](https://developer.mozilla.org/ko/docs/Web/JavaScript/Reference/Statements/async_function)
- MDN — [Map](https://developer.mozilla.org/ko/docs/Web/JavaScript/Reference/Global_Objects/Map) / [Set](https://developer.mozilla.org/ko/docs/Web/JavaScript/Reference/Global_Objects/Set)
- MDN — [구조 분해 할당](https://developer.mozilla.org/ko/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment)
- MDN — [클로저](https://developer.mozilla.org/ko/docs/Web/JavaScript/Guide/Closures)
- MDN — [Element.animate()](https://developer.mozilla.org/ko/docs/Web/API/Element/animate)
- day1/day2 세부 정리: [JavaScript_기초_정리.md](day1/JavaScript_기초_정리.md), [JavaScript_DOM_조작_정리.md](day2/JavaScript_DOM_조작_정리.md)
