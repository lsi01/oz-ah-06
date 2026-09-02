# 브랜치 전략 정리: Git Flow vs GitHub Flow

## 왜 브랜치 전략이 필요한가

브랜치 전략은 여러 명(혹은 미래의 나)이 하나의 코드베이스를 안전하게 관리하기 위한 브랜치 생성·병합 규칙이다. 핵심 목표는 항상 같다 — **메인 브랜치는 언제나 배포 가능한 안정 상태로 유지한다.** 전략마다 다른 점은 그 안정성을 지키기 위해 절차를 얼마나 세분화하느냐이다.

---

## 1. Git Flow

2010년 Vincent Driessen이 제안한 모델. **5가지 브랜치**를 역할별로 분리해 운영한다.

| 브랜치 | 역할 |
|---|---|
| `main`(`master`) | 항상 배포 가능한 상태를 유지하는 운영 브랜치 |
| `develop` | 다음 릴리스를 위해 기능들을 통합·검증(알파 테스트)하는 브랜치 |
| `feature/*` | 개별 기능 개발용. `develop`에서 분기해 다시 `develop`으로 병합 |
| `release/*` | 배포 준비·베타 테스트용. 최종 검증 후 `main`(과 `develop`)으로 병합 |
| `hotfix/*` | `main` 배포 후 발생한 긴급 버그를 바로 고치는 브랜치 |

**흐름**

```text
feature/* → develop (알파 QA) → release/* (베타 QA) → main (실배포)
                                                          ↓
                                    배포 후 변경분은 develop에도 다시 반영
```

- **장점**: 배포 절차가 명확하고 체계적, 버전별 롤백이 쉬움
- **단점**: 브랜치 종류가 많아 관리가 복잡, 학습 곡선이 높음
- **적합한 상황**: 대규모 팀, 엔터프라이즈, 정기 릴리스 주기가 있는 프로젝트, 여러 버전을 동시에 유지보수해야 하는 경우

---

## 2. GitHub Flow

GitHub이 제안한 단순한 모델. **`main` + `feature` 두 종류의 브랜치**만 사용한다.

**흐름**

```text
main → feature/* 분기 → 개발 완료 후 원격 푸시 → Pull Request 생성
     → 코드 리뷰(승인) → main으로 병합 → 곧바로 배포(지속적 배포)
```

- **장점**: 구조가 단순해 빠른 개발·배포에 적합. PR 기반이라 리뷰·승인·CI 연동이 자연스러움
- **단점**: 별도의 릴리스/검증 단계가 없어 엄격한 관리가 필요한 대규모 프로젝트엔 부적합
- **적합한 상황**: 소규모 팀, 개인 프로젝트, 빠르게 반복 배포하는 서비스

### 실무에서 챙겨야 할 세부 사항

**PR 병합 옵션 3가지**

| 옵션 | 동작 | 특징 |
|---|---|---|
| Create a merge commit (기본값) | 출처 브랜치의 모든 커밋 + 새 병합 커밋 추가 | 병합 이력이 명확하게 남음 |
| Squash and merge | 모든 커밋을 하나로 압축해 추가 | 이력은 깔끔하지만 세부 커밋 손실 |
| Rebase and merge | 커밋을 그대로 직렬로 쌓음 | 병합 커밋 없이 직관적, 충돌 시 주의 필요 |

**브랜치 보호 규칙(Branch Ruleset)** — 여러 명이 개발할 때 `main`으로의 잘못된 병합을 방지
- PR 없이 직접 병합 금지 (`Require a pull request before merging`)
- 최소 승인 리뷰어 수 지정
- 새 커밋 푸시 시 기존 승인 자동 무효화
- 코드 소유자(Code Owner) 승인 필수
- 모든 리뷰 대화 해결 후에만 병합 허용

**GitHub Actions로 테스트 게이트 걸기**
- PR 생성·푸시 시 자동으로 테스트 실행
- `Require status checks to pass` 규칙으로, 테스트 실패 시 병합 자체를 차단

**이슈 연동**
- 커밋 메시지에 `close #번호` / `fix #번호` / `resolve #번호`를 쓰면 병합 시 해당 이슈가 자동으로 닫힘

**충돌(Conflict) 해결**
- 로컬: `main`을 최신화한 뒤 작업 브랜치에서 `git merge main`으로 먼저 충돌을 확인·해결
- GitHub 웹 UI: PR 화면의 `Resolve conflicts` 버튼으로 직접 해결 가능

**release/hotfix 브랜치가 없다면?**
- 긴급 수정: 별도 `hotfix/*` 없이 `main`에서 바로 브랜치(예: `fix/login-crash`)를 따서 PR → 병합 → 배포. "브랜치 종류"가 아니라 "속도"로 대응
- 버전 추적: release 브랜치 없이도 배포 시점마다 Git tag(`git tag v1.2.0`)나 GitHub Releases로 스냅샷을 남기면 Git Flow의 버전 관리 이점을 어느 정도 흡수할 수 있음

---

## 3. 두 전략 비교

| 구분 | Git Flow | GitHub Flow |
|---|---|---|
| 브랜치 종류 | 5개 (main, develop, feature, release, hotfix) | 2개 (main, feature) |
| 배포 빈도 | 정기적(주/월 단위) | 수시 / 지속적 |
| 동시 지원 버전 | 여러 버전 병행 가능 (v1, v2 유지보수 등) | 항상 최신 버전 하나만 운영 |
| 팀 규모 | 여러 명, 역할 분담 | 1인 또는 소수 |
| CI/CD 성숙도 | 낮아도 됨 (수동 검증 단계가 있음) | 자동 테스트/배포 파이프라인이 있으면 좋음 |
| 장점 | 명확한 배포 절차, 체계적 롤백 | 빠른 배포, 간단한 구조 |
| 단점 | 복잡한 브랜치 관리, 높은 학습 곡선 | 별도 검증 단계 부재 |

**요약**: 프로젝트가 표의 왼쪽 특성에 가까우면 Git Flow, 오른쪽에 가까우면 GitHub Flow를 선택한다.

---

## 4. 더 알아두면 좋은 것 (참고용)

- **Trunk-Based Development**: `main` 하나에 거의 바로 커밋하거나 아주 짧은 수명의 브랜치만 사용하고, 미완성 기능은 Feature Flag로 숨겨서 배포. GitHub Flow보다 더 극단적으로 브랜치 수명을 짧게 가져가는 방식
- **GitLab Flow**: GitHub Flow에 `staging` → `production` 같은 환경 브랜치를 추가한 버전. Git Flow만큼 복잡하지 않으면서 배포 전 검증 단계가 필요한 팀에 적합
- **Conventional Commits**: `feat:`, `fix:`, `chore:` 같은 커밋 메시지 규칙. 체인지로그 자동 생성, semantic versioning과 자연스럽게 연결됨

---

## 참고 링크

- https://velog.io/@myoungji-kim/git-flow
- https://devocean.sk.com/blog/techBoardDetail.do?ID=165571&boardType=techBlog
- https://www.heropy.dev/p/6hdJi6
