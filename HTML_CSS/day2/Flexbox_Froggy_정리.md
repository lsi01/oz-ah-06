# Flexbox Froggy 정리 (flexboxfroggy.com)

24개 스테이지를 모두 직접 풀면서, 단계별로 사용한 flexbox 속성과 값을 정리했다.
CSS Diner가 "선택자"를 익히는 게임이었다면, Flexbox Froggy는 "정렬/배치" 속성을 익히는 게임이다.

## 전체 요약표

| 단계 | 사용 속성 | 값 | 핵심 개념 |
|---|---|---|---|
| 1 | justify-content | flex-end | 메인축(가로) 끝 정렬 |
| 2 | justify-content | center | 메인축 가운데 정렬 |
| 3 | justify-content | space-around | 아이템 사이+양끝에 균등 여백 |
| 4 | justify-content | space-between | 아이템 사이에만 균등 여백, 양끝은 붙음 |
| 5 | align-items | flex-end | 교차축(세로) 끝 정렬 |
| 6 | align-items | center | 교차축 가운데 정렬 |
| 7 | align-items, justify-content | flex-end, center | 세로 끝 + 가로 가운데 조합 |
| 8 | flex-direction | column | 메인축을 세로로 전환 |
| 9 | flex-direction | column-reverse | 세로 + 아이템 순서 역방향 |
| 10 | flex-direction | row-reverse | 가로 + 아이템 순서 역방향 |
| 11 | justify-content, align-items | space-around, flex-end | 두 축 정렬 동시 사용 |
| 12 | align-self | flex-end (개별 요소) | 특정 아이템만 교차축 정렬 다르게 |
| 13 | align-self | flex-end / flex-start (개별) | 개별 요소마다 다른 정렬값 |
| 14 | order | 음수/양수 | DOM 순서와 무관하게 렌더 순서 변경 |
| 15 | order | 각 프로그마다 지정 | 여러 요소 순서 재배치 |
| 16 | flex-wrap | wrap | 한 줄을 넘으면 다음 줄로 넘김 |
| 17 | flex-wrap, align-content | wrap, flex-end | wrap된 여러 줄을 교차축 끝으로 |
| 18 | flex-wrap, align-content | wrap, center | wrap된 여러 줄을 교차축 가운데로 |
| 19 | flex-wrap, align-content | wrap, space-between | wrap된 줄 사이 균등 여백 |
| 20 | flex-flow | column wrap (단축 속성) | flex-direction + flex-wrap 한번에 |
| 21 | flex-flow, justify-content | row wrap, center | 여러 줄 + 각 줄 내부 정렬 |
| 22 | flex-flow, align-content, justify-content | column wrap, space-between, center | 세로 wrap 조합 |
| 23 | flex-flow, justify-content, align-items | row wrap, space-around, center | 종합 조합 문제 |
| 24 | flex-direction, flex-wrap, justify-content, align-content | column-reverse, wrap-reverse, center, space-between | 최종 종합 문제 |

## 스테이지별 상세 메모

### 1~4단계: justify-content (메인축 정렬)
연못이 `display: flex` 상태(기본 `flex-direction: row`)일 때, `justify-content`는 프로그들을 **가로 방향(메인축)**으로 어떻게 배치할지 결정한다.
- `flex-start`(기본값) / `flex-end`: 시작/끝에 몰아서 배치
- `center`: 가운데로 몰아서 배치
- `space-around`: 각 아이템 양옆에 동일한 여백 (때문에 아이템 사이 간격이 양끝 간격의 2배처럼 보임)
- `space-between`: 아이템 사이에만 여백을 배분, 첫/마지막 아이템은 컨테이너 끝에 붙음

### 5~7단계: align-items (교차축 정렬)
`flex-direction: row`일 때 교차축은 **세로**. `align-items`는 세로 방향 정렬을 담당하며, `justify-content`와 동시에 써서 가로·세로를 각각 다르게 제어할 수 있다.

### 8~10단계: flex-direction
메인축 자체를 바꾸는 속성.
- `column`: 메인축이 세로로 바뀜 → 이후 `justify-content`가 세로, `align-items`가 가로를 담당하게 됨
- `row-reverse` / `column-reverse`: 축은 그대로지만 시작점(main-start)과 끝점(main-end)이 반대로 뒤집힘 → DOM 순서상 첫 번째 요소가 반대쪽 끝에서 시작

### 11단계: 두 축 조합
`justify-content`와 `align-items`를 동시에 적용해 2차원 배치를 완성하는 연습. 값이 여러 개 조합될 수 있어 실제로는 시행착오로 "다음" 버튼의 활성화 여부(진한 빨강 = 정답)를 기준으로 검증했다.

### 12~13단계: align-self
컨테이너 전체가 아니라 **개별 프로그(자식 요소)**에 지정하는 속성. 같은 줄에 있어도 특정 요소만 다른 교차축 위치를 가질 수 있다. `align-items`가 전체 기본값이라면, `align-self`는 그 값을 개별 요소에서 덮어쓴다.

### 14~15단계: order
기본값은 모든 요소가 `order: 0`이며, DOM에 나온 순서대로 배치된다. `order` 값을 음수로 주면 앞으로, 양수로 주면 뒤로 이동한다. 즉 **HTML 마크업 순서를 바꾸지 않고도 시각적 순서만 바꿀 수 있다.**

### 16~19단계: flex-wrap / align-content
- `flex-wrap: wrap`: 한 줄(main axis 길이)에 다 들어가지 않는 아이템을 다음 줄로 넘긴다. 기본값 `nowrap`은 강제로 한 줄에 욱여넣거나 넘친다.
- 줄바꿈이 생기면 여러 개의 "line"이 생기는데, 이 line들을 교차축 방향으로 어떻게 배치할지 정하는 것이 `align-content`이다. (`align-items`는 한 line 안에서의 정렬, `align-content`는 line들 사이의 정렬 — 헷갈리기 쉬운 부분)

### 20~23단계: flex-flow (단축 속성)
`flex-flow: <flex-direction> <flex-wrap>` 형태로 두 속성을 한 줄로 합쳐 쓸 수 있다. 실제 동작은 각각 따로 쓴 것과 동일하다.

### 24단계 (최종): 종합 문제
개구리 7마리(빨강 1 + 초록 4 + 노랑 2, DOM 순서도 이 순서)를 두 개의 세로줄로 나누어 집으로 보내야 했다.
- 왼쪽 줄: 노랑 2마리
- 오른쪽 줄: 초록 4마리(위) + 빨강 1마리(맨 아래)

이 단계는 편집기에 `#pond` 규칙 하나만 존재해서(개별 색상별 선택자 블록이 없음) `order`로 DOM 순서를 바꾸는 방식이 아니라, **컨테이너 속성만으로 축의 시작/끝을 반대로 뒤집는 방식**으로 풀었다.

```css
#pond {
  display: flex;
  flex-direction: column-reverse;
  flex-wrap: wrap-reverse;
  justify-content: center;
  align-content: space-between;
}
```

풀이 논리:
1. `flex-direction: column-reverse` → 메인축(세로)의 시작점을 아래쪽으로 뒤집는다. DOM 순서(빨강→초록×4→노랑×2)대로 아래에서 위로 채워나간다.
2. 이 상태에서 앞의 5개(빨강+초록×4)가 한 줄(line)을 다 채우고, 남은 2개(노랑×2)는 다음 줄로 넘어간다(`flex-wrap`이 있어야 줄바꿈이 일어남).
3. `flex-wrap: wrap-reverse` → 줄(line)들이 쌓이는 교차축(가로)의 시작점도 뒤집는다. 그 결과 첫 번째 줄(빨강+초록×4)이 **오른쪽**에, 두 번째 줄(노랑×2)이 **왼쪽**에 배치된다.
4. 첫 번째 줄 내부는 `column-reverse`로 인해 아래에서부터 채워졌으므로, 위쪽이 초록(마지막에 채워진 요소), 맨 아래가 빨강(가장 먼저 채워진 요소)이 되어 정확히 목표 배치와 일치한다.
5. `justify-content: center`, `align-content: space-between`으로 각 줄의 세로 위치와 줄 사이 가로 간격을 목표 연잎 위치에 맞춘다.

즉, 이 문제는 `order`를 쓰지 않고도 **두 축의 방향을 각각 반대로 뒤집는 조합**만으로 원하는 시각적 순서를 만들 수 있다는 것을 보여주는 문제였다.

## 완료 화면
> "해냈습니다! 당신의 능숙한 Flexbox 솜씨 덕분에 모든 개구리들이 수련잎 위로 돌아가는 것을 도울 수 있었습니다."

24/24 스테이지 완료.
