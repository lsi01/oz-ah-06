// 웹 브라우저 콘솔에서 실행하는 사칙연산 계산기 (JavaScript 1일차 [필수])
//
// 사용법
//   1. calculator.html 을 브라우저로 연다
//   2. 개발자도구 콘솔을 연다  (Windows: F12  /  Mac: Option + Command + I)
//   3. start()              -> 계산식을 물어본다 (prompt)
//      start("1 + 2 * 3")   -> 바로 계산해서 콘솔에 출력
//      calculate("2*3+4")   -> 결과값만 반환 (10)
//      runExamples()        -> 여러 예시를 한 번에 확인
//
// 규칙
//   - + - * / 사칙연산
//   - * , / 를 + , - 보다 먼저 계산한다 (연산자 우선순위)
//   - 피연산자 개수 제한 없음 -> 긴 계산식도 처리
//   - 공백은 있어도 없어도 된다 : "1 + 2" 와 "1+2" 모두 인식
//   - 숫자는 10진수만 : 3, 42, 0.5, 3.14
//     (".5", "1.", "1e3", "0x10" 같은 형태와 음수 리터럴 "-3", 괄호는 범위 밖)
//   - 소수 지원 : "1.5 * 2"  -> 3
//   - 부동소수점 오차 정리 : "0.1 + 0.2"  -> 0.3  (JS 기본값은 0.30000000000000004)

// --- 기본 연산 함수 --------------------------------------------------------
function add(a, b) {
  return a + b;
}
function subtract(a, b) {
  return a - b;
}
function multiply(a, b) {
  return a * b;
}
function divide(a, b) {
  return a / b;
}

// 부동소수점 연산에서 생기는 미세 오차를 정리한다.
//   0.1 + 0.2  ->  0.30000000000000004  ->  0.3
// 정수부는 그대로 두고 소수 10자리에서 반올림한다.
function tidy(value) {
  return Number.parseFloat(value.toFixed(10));
}

// --- 계산식 문자열 -> 토큰 배열 -----------------------------------------
//   "1+2 * 3"  ->  ["1", "+", "2", "*", "3"]
function tokenize(formula) {
  return String(formula)
    .replace(/([+\-*/])/g, " $1 ") // 연산자 양옆에 공백을 넣고
    .trim()
    .split(/\s+/) // 공백 기준으로 자른다
    .filter((token) => token.length > 0);
}

// --- 토큰이 "숫자 연산자 숫자 연산자 숫자 ..." 형태인지 검사 ----------
//   문제가 있으면 에러 메시지(문자열), 없으면 null 을 반환한다.
const OPERATORS = ["+", "-", "*", "/"];
const DECIMAL_NUMBER = /^\d+(\.\d+)?$/; // 10진수만: 3, 42, 0.5, 3.14

function validate(tokens) {
  if (tokens.length < 3 || tokens.length % 2 === 0) {
    return "계산식 형식이 올바르지 않습니다. (예: 1 + 2 * 3)";
  }
  for (let i = 0; i < tokens.length; i++) {
    const isOperatorPosition = i % 2 === 1; // 홀수 자리 = 연산자 자리
    if (isOperatorPosition) {
      if (!OPERATORS.includes(tokens[i])) {
        return `연산자 자리에 '${tokens[i]}' 가 있습니다.`;
      }
    } else if (!DECIMAL_NUMBER.test(tokens[i])) {
      return `'${tokens[i]}' 는 올바른 숫자가 아닙니다. (10진수만: 3, 0.5)`;
    }
  }
  return null;
}

// --- 실제 계산 : 2단계 처리로 우선순위를 구현한다 --------------------
function calculate(formula) {
  const tokens = tokenize(formula);

  const error = validate(tokens);
  if (error) {
    return error;
  }

  // 1단계 : * , / 를 먼저 계산해서 새 토큰 배열(reduced)을 만든다
  //   예) ["2", "+", "3", "*", "4"]  ->  ["2", "+", 12]
  const reduced = [];
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    if (token === "*" || token === "/") {
      const left = Number(reduced.pop()); // 직전에 쌓아둔 왼쪽 피연산자
      const right = Number(tokens[i + 1]); // 다음 토큰 = 오른쪽 피연산자
      if (token === "/" && right === 0) {
        return "0 으로 나눌 수 없습니다.";
      }
      reduced.push(token === "*" ? multiply(left, right) : divide(left, right));
      i++; // 오른쪽 피연산자는 방금 소비했으므로 건너뛴다
    } else {
      reduced.push(token);
    }
  }

  // 2단계 : 남은 + , - 를 왼쪽부터 순서대로 계산한다
  //   예) ["2", "+", 12]  ->  14
  let result = Number(reduced[0]);
  for (let i = 1; i < reduced.length; i += 2) {
    const operator = reduced[i];
    const next = Number(reduced[i + 1]);
    result = operator === "+" ? add(result, next) : subtract(result, next);
  }
  return tidy(result); // 부동소수점 오차 정리 후 반환
}

// --- 콘솔 진입점 --------------------------------------------------------
function inputFormula() {
  return prompt("계산식을 입력하세요. (예: 1 + 2 * 3)");
}

function start(formula) {
  const input = formula || inputFormula();
  if (!input) {
    console.log("계산식이 입력되지 않았습니다.");
    return;
  }
  const result = calculate(input);
  if (typeof result === "string") {
    console.log(`에러: ${result}`); // calculate 가 문자열을 반환하면 에러 메시지
  } else {
    console.log(`${input.trim()} = ${result}`);
  }
}

// --- 동작 확인용 : 콘솔에서 runExamples() 로 실행 (기대값과 대조) ------
function runExamples() {
  const cases = [
    ["1 + 2", 3],
    ["10 - 4 - 3", 3], //                 왼쪽부터
    ["2 * 3 + 4", 10], //                 * 먼저: 6 + 4
    ["2 + 3 * 4", 14], //                 * 먼저: 2 + 12
    ["100 / 5 / 2", 10], //               왼쪽부터: 20 / 2
    ["1 + 2 * 3 - 4 / 2 + 10", 15], //    긴 식: 1 + 6 - 2 + 10
    ["1.5 * 2 + 0.5", 3.5], //            소수
    ["0.1 + 0.2", 0.3], //                부동소수점 오차 정리
    ["1+2*3", 7], //                      공백이 없어도 인식
    ["5 / 0", "0 으로 나눌 수 없습니다."],
    ["1 + a", "'a' 는 올바른 숫자가 아닙니다. (10진수만: 3, 0.5)"],
    ["1e3 + 1", "'1e3' 는 올바른 숫자가 아닙니다. (10진수만: 3, 0.5)"],
    ["3", "계산식 형식이 올바르지 않습니다. (예: 1 + 2 * 3)"],
  ];
  let pass = 0;
  for (const [formula, expected] of cases) {
    const actual = calculate(formula);
    const ok = actual === expected;
    if (ok) pass++;
    console.log(`${ok ? "OK  " : "FAIL"}  ${formula}  ->  ${actual}`);
  }
  console.log(`\n${pass}/${cases.length} 통과`);
}
