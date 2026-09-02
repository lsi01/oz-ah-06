# CSS Diner 정리 (flukeout.github.io/)

CSS Diner는 접시 위 음식 요소를 CSS 선택자로 골라내는 실습 게임이다. 32단계를 모두 풀어 완료했다(완료 화면: "You did it! You rock at CSS.").

## 단계별 선택자 정리

| 단계 | 개념 | 사용한 선택자 | 설명 |
|---|---|---|---|
| 1 | 타입 선택자 | `plate` | 태그 이름으로 모든 `<plate>` 요소 선택 |
| 2 | 타입 선택자 | `bento` | 태그 이름으로 모든 `<bento>` 요소 선택 |
| 3 | id 선택자 | `#fancy` | `id="fancy"`인 단일 요소 선택 |
| 4 | 자손 선택자 | `plate apple` | `plate` 내부에 있는 모든 `apple` 선택 |
| 5 | id + 자손 | `#fancy pickle` | `id="fancy"` 요소 내부의 `pickle` 선택 |
| 6 | 클래스 선택자 | `.small` | `class="small"`인 모든 요소 선택 |
| 7 | 타입+클래스 | `orange.small` | `orange`이면서 `small` 클래스인 요소만 선택 |
| 8 | 복합(자손+타입+클래스) | `bento orange.small` | `bento` 내부의 `orange.small`만 선택 |
| 9 | 그룹 선택자 | `plate, bento` | `plate`와 `bento`를 한 번에 선택 |
| 10 | 전체 선택자 | `*` | 문서의 모든 요소 선택 |
| 11 | 자손 + 전체 | `plate *` | `plate` 내부의 모든 요소 선택 |
| 12 | 인접 형제 | `plate + apple` | `plate` 바로 다음에 오는 `apple`만 선택 |
| 13 | 일반 형제 | `bento ~ pickle` | `bento` 이후에 오는 모든 형제 `pickle` 선택 |
| 14 | 자식 결합자 | `plate > apple` | `plate`의 직계 자식인 `apple`만 선택(자손 전체 아님) |
| 15 | `:first-child` | `orange:first-child` | 부모의 첫 번째 자식이면서 `orange`인 요소 |
| 16 | `:only-child` | `plate :only-child` | `plate` 내부에서 형제 없이 혼자인 자식 요소 |
| 17 | `:last-child` | `.small:last-child` | `small` 클래스이면서 부모의 마지막 자식인 요소 |
| 18 | `:nth-child(A)` | `plate:nth-child(3)` | 전체 형제 중 3번째 자식이면서 `plate`인 요소 |
| 19 | `:nth-last-child(A)` | `bento:nth-last-child(3)` | 뒤에서 3번째 자식이면서 `bento`인 요소 |
| 20 | `:first-of-type` | `apple:first-of-type` | 같은 태그(`apple`) 중 부모 내에서 첫 번째로 나오는 요소 |
| 21 | `:nth-of-type(A)` | `plate:nth-of-type(even)` | 같은 태그 중 짝수 번째에 오는 `plate` |
| 22 | `:nth-of-type(An+B)` | `plate:nth-of-type(2n+3)` | 같은 태그 중 3번째부터 2개씩 건너뛴 `plate` |
| 23 | `:only-of-type` | `apple:only-of-type` | 부모 내에 같은 태그 형제가 없는 유일한 `apple` |
| 24 | `:last-of-type` | `orange:last-of-type, apple:last-of-type` | 같은 태그 중 마지막에 오는 `orange`와 `apple` |
| 25 | `:empty` | `bento:empty` | 자식 요소나 텍스트가 전혀 없는 `bento` |
| 26 | `:not(X)` | `apple:not(.small)` | `small` 클래스가 **아닌** `apple`만 선택 |
| 27 | `[attribute]` | `[for]` | `for` 속성을 가진 모든 요소(값 무관) |
| 28 | `A[attribute]` | `plate[for]` | `plate` 태그이면서 `for` 속성을 가진 요소 |
| 29 | `[attribute="value"]` | `[for="Vitaly"]` | `for` 속성값이 정확히 `Vitaly`인 요소 |
| 30 | `[attribute^="value"]` | `[for^="Sa"]` | `for` 속성값이 `Sa`로 **시작**하는 요소 |
| 31 | `[attribute$="value"]` | `[for$="ato"]` | `for` 속성값이 `ato`로 **끝**나는 요소 |
| 32 | `[attribute*="value"]` | `[for*="obb"]` | `for` 속성값에 `obb`가 **포함**된 요소 |

## 정리하며 든 생각

가장 헷갈렸던 부분은 자식 결합자(`>`)와 자손 결합자(공백)의 차이, 그리고 `:nth-child`와 `:nth-of-type`의 차이였다. `plate apple`(자손)은 몇 단계를 거쳐 안에 있든 다 선택하지만 `plate > apple`(자식)은 바로 한 단계 아래에 있는 것만 선택한다. `:nth-child(3)`은 "부모의 3번째 자식인데 그게 마침 plate인가"를 보는 것이고, `:nth-of-type(3)`은 "같은 종류(plate) 중에서 3번째인가"를 보는 것이라 형제 요소 종류가 섞여 있을 때 결과가 달라진다는 점을 실습으로 확인했다.

속성 선택자(`^=`, `$=`, `*=`)는 정규식의 시작·끝·포함 패턴과 개념이 같아서, `for` 속성값(이름)으로 대상을 필터링하는 마지막 4단계가 실무에서 특정 데이터 속성(`data-*`)을 다룰 때 바로 쓸 수 있을 것 같다.
