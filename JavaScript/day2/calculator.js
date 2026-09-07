// JavaScript 2일차 [필수] - querySelector / addEventListener 로 만드는 GUI 사칙연산 계산기
//
// 화면의 버튼(숫자 · 연산자 · . · C · Enter · ON/OFF)을 눌러 계산식을 만들고
// Enter 를 누르면 결과를 디스플레이에 표시한다. 키보드 입력도 같은 동작으로 처리한다.
//
// 계산 규칙은 1일차 콘솔 계산기와 동일하다.
//   - + - * / 사칙연산,  * / 를 + - 보다 먼저 계산 (연산자 우선순위)
//   - 피연산자 개수 제한 없음,  10진수 소수 지원
//   - 부동소수점 오차 정리 : 0.1 + 0.2  ->  0.3
//   - 음수 리터럴("-3")·괄호는 1일차와 마찬가지로 범위 밖

// ===== 1. 계산 엔진 (1일차 calculator.js 재사용) ======================
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

// 부동소수점 미세 오차 정리 : 0.30000000000000004 -> 0.3
function tidy(value) {
  return Number.parseFloat(value.toFixed(10));
}

// "1+2 * 3"  ->  ["1", "+", "2", "*", "3"]
function tokenize(formula) {
  return String(formula)
    .replace(/([+\-*/])/g, " $1 ") // 연산자 양옆에 공백을 넣고
    .trim()
    .split(/\s+/) // 공백 기준으로 자른다
    .filter((token) => token.length > 0);
}

// 토큰이 "숫자 연산자 숫자 ..." 형태인지 검사. 문제가 있으면 짧은 오류 문자열을 반환
const OPERATORS = ["+", "-", "*", "/"];
const DECIMAL_NUMBER = /^\d+(\.\d+)?$/; //   10진수만: 3, 42, 0.5, 3.14
const SIGNED_NUMBER = /^-?\d+(\.\d+)?$/; // 맨 앞 피연산자만 음수 허용: -5 (음수 결과 이어 계산)

function validate(tokens) {
  if (tokens.length < 3 || tokens.length % 2 === 0) {
    return "형식 오류";
  }
  for (let i = 0; i < tokens.length; i++) {
    const isOperatorPosition = i % 2 === 1; // 홀수 자리 = 연산자 자리
    if (isOperatorPosition) {
      if (!OPERATORS.includes(tokens[i])) return "형식 오류";
    } else if (!(i === 0 ? SIGNED_NUMBER : DECIMAL_NUMBER).test(tokens[i])) {
      return "숫자 오류";
    }
  }
  return null;
}

// 2단계 처리로 우선순위 구현 : (1) * / 먼저  (2) 남은 + - 를 왼쪽부터
function calculate(formula) {
  const tokens = tokenize(formula);

  // 음수 결과를 이어서 계산하는 경우, 맨 앞 "-" 를 다음 숫자와 합친다
  //   "-5 + 3"  ->  ["-5", "+", "3"]   (식 중간의 음수는 1일차와 마찬가지로 범위 밖)
  if (tokens[0] === "-" && tokens.length > 1 && DECIMAL_NUMBER.test(tokens[1])) {
    tokens.splice(0, 2, "-" + tokens[1]);
  }

  const error = validate(tokens);
  if (error) return error;

  const reduced = [];
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    if (token === "*" || token === "/") {
      const left = Number(reduced.pop());
      const right = Number(tokens[i + 1]);
      if (token === "/" && right === 0) return "0 나눗셈";
      reduced.push(token === "*" ? multiply(left, right) : divide(left, right));
      i++; // 오른쪽 피연산자는 방금 소비했으므로 건너뛴다
    } else {
      reduced.push(token);
    }
  }

  let result = Number(reduced[0]);
  for (let i = 1; i < reduced.length; i += 2) {
    const operator = reduced[i];
    const next = Number(reduced[i + 1]);
    result = operator === "+" ? add(result, next) : subtract(result, next);
  }
  return tidy(result);
}

// ===== 2. 계산기 상태 ================================================
let formula = ""; //   지금까지 입력한 계산식 문자열 (예: "12 + 3 * ")
let isResult = false; // 직전에 Enter 로 결과를 표시한 상태인가
let isPowerOn = true; // 전원 ON/OFF

// ===== 3. DOM 요소 가져오기 (querySelector) ==========================
const display = document.querySelector("#display");
const buttons = document.querySelector(".buttons");
const powerButton = document.querySelector('[data-type="power"]');

// ===== 4. 디스플레이 갱신 ===========================================
function render(text) {
  display.value = text === "" ? "0" : text;
}

// ===== 5. 입력 종류별 처리 ==========================================
function pressDigit(value) {
  if (isResult) {
    // 결과가 떠 있는 상태에서 숫자를 누르면 새 계산을 시작한다
    formula = "";
    isResult = false;
  }
  // 지금 입력 중인 숫자가 "0" 하나뿐이면 "05" 가 되지 않도록 첫 자리를 교체한다
  const lastNumber = formula.split(/[\s+\-*/]+/).pop();
  if (lastNumber === "0") {
    formula = formula.slice(0, -1) + value;
  } else {
    formula += value;
  }
  render(formula);
}

function pressOperator(value) {
  if (formula === "") formula = "0"; // 연산자로 시작하면 앞에 0 을 붙인다
  // 연산자를 연속으로 누르면 마지막 연산자를 교체한다
  formula = formula.trimEnd().replace(/[+\-*/]$/, "");
  formula = formula.trimEnd() + " " + value + " ";
  isResult = false;
  render(formula);
}

function pressDot() {
  if (isResult) {
    formula = "";
    isResult = false;
  }
  // 지금 입력 중인 마지막 숫자에 이미 소수점이 있으면 무시
  const lastNumber = formula.split(/[\s+\-*/]+/).pop();
  if (lastNumber.includes(".")) return;
  formula += lastNumber === "" ? "0." : "."; // ". 5" 대신 "0.5" 로
  render(formula);
}

function pressClear() {
  formula = "";
  isResult = false;
  render(formula);
}

function pressEnter() {
  if (formula === "") return;
  const trimmed = formula.trim().replace(/[+\-*/]$/, "").trim(); // 끝에 남은 연산자 제거
  const result = calculate(trimmed);
  render(String(result));
  // 숫자 결과면 이어서 계산할 수 있게 formula 에 남기고, 오류면 비운다
  formula = typeof result === "number" ? String(result) : "";
  isResult = true;
}

// ===== 6. 전원 ON/OFF ===============================================
function togglePower() {
  isPowerOn = !isPowerOn;
  powerButton.classList.toggle("on", isPowerOn);
  // 전원 버튼을 뺀 나머지 버튼을 활성/비활성화
  document
    .querySelectorAll("button:not([data-type='power'])")
    .forEach((button) => {
      button.disabled = !isPowerOn;
    });

  if (isPowerOn) {
    formula = "";
    isResult = false;
    render("");
  } else {
    display.value = "";
  }
}

// ===== 7. 이벤트 연결 (addEventListener) =============================
// 버튼이 여러 개이므로 각각에 등록하지 않고 부모(.buttons)에 한 번만 등록한 뒤
// event.target 으로 실제 눌린 버튼을 찾는다 (이벤트 위임).
buttons.addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) return;

  const { type, value } = button.dataset;

  if (type === "power") {
    togglePower();
    return;
  }
  if (!isPowerOn) return;

  if (type === "digit") pressDigit(value);
  else if (type === "operator") pressOperator(value);
  else if (type === "dot") pressDot();
  else if (type === "clear") pressClear();
  else if (type === "enter") pressEnter();
});

// 키보드로도 같은 동작을 할 수 있게 document 에 keydown 리스너를 추가 (EventListener 응용)
document.addEventListener("keydown", (event) => {
  if (!isPowerOn) return;
  const key = event.key;

  if (key >= "0" && key <= "9") pressDigit(key);
  else if (["+", "-", "*", "/"].includes(key)) pressOperator(key);
  else if (key === ".") pressDot();
  else if (key === "Enter" || key === "=") pressEnter();
  else if (key === "Escape") pressClear();
  else return; // 계산기와 무관한 키는 브라우저 기본 동작을 그대로 둔다

  event.preventDefault(); // "/" 빠른 검색 등 처리한 키의 기본 동작은 막는다
});

// ===== 8. 초기 상태 =================================================
powerButton.classList.add("on");
render("");
