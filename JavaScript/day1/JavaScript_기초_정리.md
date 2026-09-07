# JavaScript 기초 정리 (1일차 [선택] 과제)

## 1. 자료형 (원시 타입)

| 타입 | 설명 | 예시 |
| --- | --- | --- |
| `number` | 정수 · 실수 구분 없이 하나의 숫자 타입. `NaN`, `Infinity` 도 number | `42`, `3.14`, `-0.5` |
| `string` | 문자열. `'`, `"`, `` ` `` 모두 사용 | `'hi'`, `"hi"`, `` `hi` `` |
| `boolean` | 참 / 거짓 | `true`, `false` |
| `null` | "값이 없음"을 **의도적으로** 지정 | `let x = null;` |
| `undefined` | 값이 **아직 할당되지 않음** (선언만 하고 값을 안 줌) | `let y; // undefined` |

```js
typeof 42;          // "number"
typeof "hi";        // "string"
typeof true;        // "boolean"
typeof undefined;   // "undefined"
typeof null;        // "object"  ← 언어 초기의 유명한 버그. null 은 원시값이다.
```

- `null` vs `undefined`: 개발자가 "비었다"고 명시하면 `null`, 시스템이 값을 안 넣은 상태면 `undefined`.

---

## 2. 변수 선언 — `let` / `const`

```js
let count = 0;      // 재할당 가능
count = 1;          // OK

const PI = 3.14;    // 재할당 불가
// PI = 3;          // TypeError: Assignment to constant variable.
```

- 기본은 `const`, 값을 바꿔야 할 때만 `let` 을 쓰는 것이 관례.
- `const` 는 **재할당**만 막는다. 객체·배열의 **내부 값 변경**은 가능.
  ```js
  const arr = [1, 2];
  arr.push(3);       // OK → [1, 2, 3]
  // arr = [4];      // Error
  ```
- `var` 는 함수 스코프 + 호이스팅 문제로 현재는 사용하지 않는다.

---

## 3. 산술 연산

```js
7 + 3;   // 10   더하기
7 - 3;   // 4    빼기
7 * 3;   // 21   곱하기
7 / 3;   // 2.333...  나누기 (몫만 주지 않음 — 항상 실수 나눗셈)
7 % 3;   // 1    나머지
2 ** 10; // 1024 거듭제곱
```

- 파이썬과 달리 `/` 는 정수끼리 나눠도 소수를 반환한다. 몫만 필요하면 `Math.floor(7 / 3)` → `2`.

### Math 내장 객체

```js
Math.floor(3.7);   // 3    내림
Math.ceil(3.2);    // 4    올림
Math.round(3.5);   // 4    반올림
Math.trunc(-3.7);  // -3   소수부 버림
Math.abs(-5);      // 5    절댓값
Math.max(1, 9, 4); // 9
Math.min(1, 9, 4); // 1
Math.pow(2, 10);   // 1024 (2 ** 10 과 동일)
Math.sqrt(16);     // 4
Math.random();     // 0 이상 1 미만 난수
```

---

## 4. 비교 연산

```js
3 < 5;    // true
3 <= 3;   // true
5 > 5;    // false
5 >= 4;   // true
```

### `==` vs `===`

```js
1 == "1";    // true   ← 타입을 맞춰서 비교 (동등 연산자)
1 === "1";   // false  ← 값 + 타입 둘 다 비교 (일치 연산자)
0 == false;  // true
0 === false; // false
null == undefined;  // true
null === undefined; // false
```

- **항상 `===` 를 쓴다.** MDN 도 "`===` 가 거의 항상 올바른 비교 연산"이라고 명시한다. `==` 는 예측하기 어려운 형변환이 일어나 버그의 원인이 된다.
- `NaN` 은 `==`, `===` 모두 자기 자신과도 `false`. `NaN` 여부는 `Number.isNaN(x)` 로 확인한다.

---

## 5. 타입 확인 — `typeof`

```js
typeof 42;         // "number"
typeof "hi";       // "string"
typeof true;       // "boolean"
typeof undefined;  // "undefined"
typeof null;       // "object"   (버그로 알려진 예외)
typeof [1, 2];     // "object"   (배열도 object)
typeof { a: 1 };   // "object"
typeof function () {}; // "function"
```

- 배열인지 확인하려면 `Array.isArray([1,2])` → `true` 를 쓴다.

---

## 6. 논리 연산

```js
true && false;  // false   AND: 둘 다 참이어야 참
true || false;  // true    OR: 하나라도 참이면 참
!true;          // false   NOT: 부정
```

- **단축 평가(short-circuit)**: `&&` 는 앞이 거짓이면 뒤를 보지 않고, `||` 는 앞이 참이면 뒤를 보지 않는다.
  ```js
  const name = userName || "손님";   // userName 이 falsy 면 "손님"
  isLoggedIn && showDashboard();      // isLoggedIn 이 true 일 때만 호출
  ```
- falsy 값 (불리언 문맥에서 `false` 로 취급): `false`, `0`, `-0`, `0n`(BigInt), `""`, `null`, `undefined`, `NaN`.
  그 외 유일한 falsy 객체로 `document.all` 이 있다. **나머지는 전부 truthy** — `"0"`, `"false"`, `[]`, `{}` 도 truthy 다.

---

## 7. 문자열 연산

```js
"Hello" + " " + "World";   // "Hello World"  이어붙이기

const name = "성일";
const age = 20;
`이름: ${name}, 나이: ${age}`;   // "이름: 성일, 나이: 20"  템플릿 리터럴 (백틱)
```

- 템플릿 리터럴은 `` ` `` 으로 감싸고 `${표현식}` 안에 변수·연산식을 넣을 수 있으며 줄바꿈도 그대로 유지된다.

### number + string — 파이썬과의 차이

```js
// JavaScript: 자동으로 문자열로 변환해서 이어붙인다
1 + "2";      // "12"
"3" + 4 + 5;  // "345"
3 + 4 + "5";  // "75"  (왼쪽부터: 3+4=7, 7+"5"="75")
"5" - 2;      // 3     (- , * , / 는 반대로 숫자로 변환)
```

```python
# Python: 타입이 다르면 에러
1 + "2"       # TypeError: unsupported operand type(s)
```

- JS 는 `+` 에서 한쪽이 문자열이면 **문자열 이어붙이기**로 처리한다. 의도치 않은 `"12"` 를 막으려면 `Number("2")` 또는 `String(1)` 로 명시적 변환.

---

## 8. 조건문

```js
const score = 82;

if (score >= 90) {
  console.log("A");
} else if (score >= 80) {   // JS 는 elif 가 아니라 else if
  console.log("B");
} else {
  console.log("C");
}
```

- 삼항 연산자: `조건 ? 참일때 : 거짓일때`
  ```js
  const grade = score >= 60 ? "합격" : "불합격";
  ```

---

## 9. 반복문

```js
// for
for (let i = 0; i < 5; i++) {
  console.log(i);          // 0 1 2 3 4
}

// while
let n = 3;
while (n > 0) {
  console.log(n);          // 3 2 1
  n--;
}

// 배열 순회
const fruits = ["사과", "배", "감"];
for (const fruit of fruits) {   // for...of : 값
  console.log(fruit);
}
fruits.forEach((fruit, idx) => console.log(idx, fruit));
```

- `break` 로 즉시 종료, `continue` 로 다음 반복으로 건너뜀.

---

## 10. 배열 (array)

```js
const arr = [1, 2, 3];

arr[0];          // 1        인덱스로 접근
arr.length;      // 3        길이
arr.push(4);     // 끝에 추가 → [1, 2, 3, 4]
arr.pop();       // 끝 요소 제거 후 반환 → 4
arr.unshift(0);  // 앞에 추가 → [0, 1, 2, 3]
arr.shift();     // 앞 요소 제거 후 반환 → 0
arr.includes(2); // true
arr.indexOf(3);  // 2
```

### 활용 (고차 함수)

```js
const nums = [1, 2, 3, 4, 5];

nums.map((x) => x * 2);          // [2, 4, 6, 8, 10]   변환
nums.filter((x) => x % 2 === 0); // [2, 4]             걸러내기
nums.reduce((sum, x) => sum + x, 0); // 15             누적
nums.find((x) => x > 3);         // 4                  첫 일치 요소
```

---

## 11. 객체 (object)

```js
// 선언
const user = {
  name: "성일",
  age: 20,
  isStudent: true,
};
```

```js
// 속성 읽기
user.name;        // "성일"       점 표기법
user["age"];      // 20           대괄호 표기법 (키가 변수/특수문자일 때)

// 속성 추가
user.email = "test@example.com";

// 속성 수정
user.age = 21;

// 속성 제거
delete user.isStudent;

// 속성 존재 확인 (in)
"name" in user;       // true
"isStudent" in user;  // false (위에서 delete 함)
```

```js
// 순회
for (const key in user) {
  console.log(key, user[key]);
}
Object.keys(user);    // ["name", "age", "email"]
Object.values(user);  // ["성일", 21, "test@example.com"]
Object.entries(user); // [["name","성일"], ["age",21], ...]
```

---

## 12. 함수 (Function)

### 구성 요소

- **함수명**: 함수를 부를 이름
- **매개변수(parameter)**: 함수가 받는 입력 (호출 시 넘기는 값은 인자/argument)
- **반환값(return)**: 함수가 돌려주는 결과. `return` 이 없으면 `undefined` 반환

### 정의 방법 3가지

```js
// 1) 네임드 함수 (함수 선언문)
function add(a, b) {
  return a + b;
}

// 2) 익명 함수 (함수 표현식) — 변수에 할당
const subtract = function (a, b) {
  return a - b;
};

// 3) 화살표 함수
const multiply = (a, b) => a * b;          // 한 줄이면 return 생략 가능
const greet = (name) => {
  return `안녕, ${name}`;                   // 본문이 여러 줄이면 중괄호 + return
};
```

### 호출 방법

```js
add(2, 3);                    // 5   기본 호출

const f = add;                // 함수를 값에 할당
f(2, 3);                      // 5

[1, 2, 3].map((x) => x + 1);  // 다른 함수의 인자로 전달해서 호출 (콜백)
```

### 함수의 특징 — scope (스코프)

- **스코프** = 변수가 유효한 범위. `{ }` 블록 / 함수 단위로 생긴다.

```js
function outer() {
  const a = 1;
  function inner() {
    const b = 2;
    console.log(a, b); // 1 2  ← inner 는 바깥(outer)의 a 를 볼 수 있다
  }
  inner();
  // console.log(b);   // ReferenceError — 바깥에서는 안쪽 b 를 못 봄
}
```

- **스코프 연쇄(scope chain)**: 변수를 찾을 때 현재 스코프 → 바깥 스코프 → 그 바깥 → ... 전역까지 차례로 올라가며 찾는다.

```js
const g = "전역";
function a() {
  const x = "a 지역";
  function b() {
    // 여기서 g 를 쓰면: b 스코프에 없음 → a 스코프에 없음 → 전역에서 찾음
    console.log(g, x); // "전역" "a 지역"
  }
  b();
}
```

- **변수 가리기(Variable Shadowing)**: 안쪽 스코프에 바깥과 **같은 이름**의 변수를 선언하면, 안쪽에서는 안쪽 것이 바깥 것을 가린다.

```js
const value = "바깥";
function test() {
  const value = "안쪽";   // 바깥 value 를 가림 (shadowing)
  console.log(value);     // "안쪽"
}
test();
console.log(value);       // "바깥"  (바깥 것은 그대로)
```

---

## 참고자료

### 과제 지정 참고자료
- 이웅모, 『JavaScript로 만나는 세상』 — https://helloworldjavascript.net/
- MDN Web Docs · JavaScript 안내서 — https://developer.mozilla.org/ko/docs/Web/JavaScript/Guide

### 그 외 참고 자료 (MDN)
- 자료형과 자료구조 — https://developer.mozilla.org/ko/docs/Web/JavaScript/Guide/Data_structures
- `typeof` 연산자 — https://developer.mozilla.org/ko/docs/Web/JavaScript/Reference/Operators/typeof
- 같음 비교와 동일성 — https://developer.mozilla.org/ko/docs/Web/JavaScript/Guide/Equality_comparisons_and_sameness
- Falsy — https://developer.mozilla.org/ko/docs/Glossary/Falsy
- 클로저 — https://developer.mozilla.org/ko/docs/Web/JavaScript/Guide/Closures
- 템플릿 리터럴 — https://developer.mozilla.org/ko/docs/Web/JavaScript/Reference/Template_literals
- `Array` — https://developer.mozilla.org/ko/docs/Web/JavaScript/Reference/Global_Objects/Array
- `Math` — https://developer.mozilla.org/ko/docs/Web/JavaScript/Reference/Global_Objects/Math
- 함수 — https://developer.mozilla.org/ko/docs/Web/JavaScript/Guide/Functions
