# 개발 환경·Git 준비와 WHY

최초 작성일: 2026-10-26 (Asia/Seoul). 1~7절은 STEP 02 환경 당시 이력이며 현재 상태는 [진행 기록](work-status.md)을 따른다.

목적은 실행 환경·문서 원본·Git 연결을 준비하고, 서버가 실제 응답하는지 확인하는 것이다. 공통 메뉴·폼·오류 UI는 환경 확인과 첫 커밋 이후의 `02-UI-xx` 범위다.

## 1. 실제 앱과 문서 위치

- 앱 루트: `/Users/sungjaechoi/ToyProject/community-lab-workspace/community-lab`
- 규칙: 앱 `AGENTS.md`. 시작 폴더의 전체 규칙과 생성기의 Next.js 지침 블록을 병합했다.
- 정식 플랜: [work-plan.md](work-plan.md). 현재·다음 작업 원본: [work-status.md](work-status.md).
- 기존 STEP 01 문서 6개와 전체 플랜 1개를 옮긴 직후 SHA-256(파일 내용의 지문)을 대조해 모두 일치함을 확인했다. 이후 위치 안내·링크·현재 상태를 새 경로에 맞게 갱신했다.
- 상위 `docs/work-status.md`, 루트 `work-status.md`, `community-lab-work-plan.md`에는 이동 경로만 남겼다. 이후 앱 내부를 유일한 원본으로 사용한다.
- `01-REVIEW`·`01-RECORD`는 실제 사용자 확인으로 DONE이다. [승인 기록](reviews/step01.md)에 실제 말·기록 시각·정확한 전송 시각 미제공을 구분했다.

## 2. 실제 도구·패키지

| 구분 | 실제 버전·선택 | 역할·WHY |
| --- | --- | --- |
| Node.js | 22.15.1 | Next.js를 실행하는 런타임. Next의 최소 20.9.0 충족 |
| pnpm | 10.29.3 | 설치되어 있고 플랜 예시와 맞아 선택. packageManager·lockfile로 재현 |
| Git | 2.39.5 (Apple Git-154) | 로컬 변경 이력. 기존 작성자 설정 유지 |
| GitHub CLI | 2.86.0 | 최초 준비 당시 미로그인. 후속 로그인 후 sungjaechoi 활성 계정·HTTPS 인증 확인 |
| create-next-app·Next.js | 각각 16.4.3 | registry·CLI 옵션 확인 후 같은 버전으로 생성 |
| React·React DOM | 각각 19.3.0 | 생성기가 고정한 버전 유지 |
| TypeScript | 5.9.3 | 생성기 조합 유지, strict 타입 검사 |
| Tailwind CSS·loader | 각각 4.3.3 | 생성기의 @tailwindcss/turbopack CSS 처리 구성 유지 |
| ESLint·Next 설정 | 9.39.5 · 16.4.3 | 생성기 조합 유지. 지원 종료 경고는 아래 제한에 명시 |

실제 해석 결과는 `pnpm-lock.yaml`에 고정했다. 앱 engines는 현재 검증 기준으로 Node `>=22.15.1`, pnpm `>=10 <11`을 안내한다. 모든 허용 버전·운영체제를 검증했다는 뜻은 아니다.

### 생성 명령과 설정의 WHY

시작 폴더에서 아래 명령을 실제 실행했다. 당시 앱 폴더와 상위 Git 저장소는 없었다.

```bash
NEXT_TELEMETRY_DISABLED=1 pnpm dlx create-next-app@16.4.3 community-lab \
  --ts --eslint --tailwind --app --src-dir --import-alias '@/*' \
  --use-pnpm --disable-git --agents-md --no-react-compiler \
  --no-cache-components --no-agent-feedback --yes
```

| 설정 | 역할·선택 이유 |
| --- | --- |
| TypeScript·App Router | 플랜 기본 스택. 파일 경로로 화면·API를 나누고 타입으로 코드 형태 검사 |
| src/·@/* | 코드와 설정을 구분하고 긴 상대 경로를 줄임. 실제 별칭은 tsconfig.json에 정의 |
| ESLint·strict TypeScript | 코드 규칙과 타입 오류를 별도로 발견. 외부 입력 검증은 이후 서버에서 별도 수행 |
| Tailwind·기본 Turbopack | 생성기 구성만 사용. 별도 UI 라이브러리·스타일 추상화는 추가하지 않음 |
| React Compiler·Cache Components 끔 | 초기 학습에 불필요한 최적화·캐시 모델을 추가하지 않음 |
| --disable-git | 자동 초기화·최초 커밋 방지. 실제 생성 출력의 Skipping git initialization 확인 |
| --agents-md | 설치 버전 문서를 먼저 읽도록 안내하는 생성기 지침 보존 |
| --no-agent-feedback | 선택적 에이전트 피드백 준비 끔 |
| 시스템 글꼴·lang=ko | 승인된 방향을 반영하고 외부 글꼴 다운로드 없이 한국어 준비 화면 표시 |

생성기 지침에 따라 설치된 `node_modules/next/dist/docs/`의 Route Handlers·Layouts and Pages·CSS·ESLint·TypeScript 안내를 코드 작성 전에 읽었다. 실제 CLI·설정·설치 버전 문서와 대조했다. [생성 옵션](https://nextjs.org/docs/app/api-reference/cli/create-next-app), [설치](https://nextjs.org/docs/app/getting-started/installation)

## 3. 실행·검증과 작은 예제

| 명령 | 역할·실제 결과 |
| --- | --- |
| pnpm dev --hostname 127.0.0.1 --port 3001 | 개발 서버. 3000번의 기존 프로세스를 건드리지 않고 준비 화면·health 확인 |
| pnpm typecheck | next typegen && tsc --noEmit. 경로 타입 생성 후 검사, exit 0 |
| pnpm lint | eslint . --max-warnings=0. Next·React·TypeScript 규칙 검사, exit 0 |
| pnpm build | next build. Turbopack 프로덕션 빌드·타입 검사·페이지 생성, exit 0 |

LayoutProps는 typegen으로 준비하는 전역 경로 타입이다. 빌드 성공이 린트를 대신하지 않으므로 각각 실행했다. [TypeScript](https://nextjs.org/docs/app/api-reference/config/typescript), [ESLint](https://nextjs.org/docs/app/api-reference/config/eslint)

```ts
// src/app/api/health/route.ts
export function GET() {
  return Response.json({ status: "ok" });
}
```

입력은 GET 요청이며 사용자 입력·인증·DB 검증은 필요 없다. 처리에서 DB·환경값을 읽지 않고 JSON을 반환한다. 지원하지 않는 POST는 Next.js가 405로 거부한다. 실제로 GET 200·JSON content-type·정확한 응답과 POST 405를 확인했다. HTTP 응답을 DB 연결 성공으로 바꾸어 기록하지 않는다. [Route Handlers](https://nextjs.org/docs/app/api-reference/file-conventions/route)

GET `/`도 200·한국어 lang·제목·본문을 확인했다. 브라우저에서 실제 제목과 준비 문구를 확인하고 [화면 이미지](reviews/assets/step02-env.png)를 저장했다. 이미지의 배치만 확인했으며 모바일·키보드·공통 UI 완료 검증은 후속 범위다.

## 4. 환경 파일과 테스트 범위

`.env.example`에는 변수 이름·빈 자리와 로컬 URL만 있다. STEP 02는 환경 파일 없이 실행했다. STEP 03에서 Supabase·DB 값을 준비한다. 실제 git check-ignore로 `.env`, `.env.local`, `.env.production`, `.env.test.local` 제외와 `.env.example` 허용을 확인했다. 비밀값 작성·stage·커밋은 없다.

준비 화면과 health는 실제 HTTP·브라우저 확인으로 검증했다. Vitest·Playwright는 지금 설치하지 않았다. 입력·권한·DB 무결성이 생기는 기능에서 위험에 맞게 도입하고 STEP 14에서 통합한다. DB·Auth·Realtime·성능은 미검증이다.

## 5. Git·원격 접근·push 정책

| 항목 | 실제 상태 |
| --- | --- |
| 시작 전 | 상위 Git·기존 staged/commit 없음 |
| 로컬 저장소 | 앱 안에서 직접 초기화. 브랜치 codex/step02-environment. 환경 첫 커밋 d9b9f8ffdfef542d47c60d24fb6a5f4770cca011 성공 |
| 작성자·정책 | 기존 user.name·user.email 있음. 신원·서명·훅·보호 정책 변경 없음 |
| 사용자 지정 원격 | [sungjaechoi/community-lab](https://github.com/sungjaechoi/community-lab), origin HTTPS 등록 |
| 공개 범위 | GitHub 메타데이터상 public, archived/disabled 아님 |
| 기존 이력·현재 원격 | 최초 ls-remote/fetch는 ref 없는 빈 원격이었다. 환경 첫 push 후 origin/codex/step02-environment에 같은 커밋 반영 확인 |
| 기본 브랜치 메타데이터 | 최초 main → 첫 push 후 GitHub API 조회는 codex/step02-environment. 별도 기본 브랜치 변경 명령은 실행하지 않음 |
| 실제 push 대상 | origin/codex/step02-environment. --set-upstream push 성공, HEAD·upstream·ls-remote 해시 일치 |
| push 정책 | 사용자 실제 답변: “확인 후 커밋하면 지정한 원격 브랜치로 push 허용” |
| 인증 구분 | 공개 읽기·sungjaechoi 로그인·API permissions.push=true 확인에 이어 실제 push 성공까지 구분해 검증함 |

최초 요청대로 `02-ENV-REVIEW`에서 멈춘 뒤 후속 “진행해줘”를 현재 환경 범위 승인으로 해석해 `02-ENV-COMMIT → 02-GIT-PUSH`를 완료했다. 같은 확인 범위의 커밋·허용된 push를 다시 묻지 않았으며 강제 push나 보호 정책 변경은 하지 않았다. 실제 승인·실행 이력은 [환경 검토 기록](reviews/step02-env.md) 7~8절에 보존했다.

- 커밋: `d9b9f8ffdfef542d47c60d24fb6a5f4770cca011`, `chore: initialize Next.js environment and project docs`, 31개 파일. Git 기록 시각은 2026-10-26 16:08:33 +09:00이다.
- 실행: `git push --set-upstream origin codex/step02-environment` exit 0. HEAD·upstream·원격 조회 해시 일치, push 직후 작업 트리 clean 확인.
- 결과 기록 시각: 2026-10-26 16:09:59 +09:00 (clock 07:09:59 UTC 변환). 현재·다음 ID는 `02-UI-01 / IN_PROGRESS`, 다음 확인은 `02-UI-REVIEW`다.
- 해시·push 결과를 적은 이 후속 문서 변경은 다음 예정 `02-UI-COMMIT`에 포함한다. 해시 기록만을 위한 재커밋은 만들지 않는다.

## 6. 필요한 계정 작업의 인계

최초 로컬 실행과 공개 원격 읽기에는 추가 계정 작업이 필요하지 않았다. 이후 사용자가 CLI 로그인을 완료했고 gh 상태·인증 사용자 API·저장소 API로 sungjaechoi 계정과 쓰기 권한을 확인한 뒤 허용된 환경 push도 성공했다. 현재 추가 로그인 작업은 없으며 아래 절차는 향후 인증 만료·실패 시의 인계다. 권한 조회와 실제 push 성공은 각각의 검증 결과로 구분한다.

| 조건·담당 | 사용자 행동·화면 | WHY·완료 기준 | 에이전트의 다음 검증 |
| --- | --- | --- | --- |
| CLI 계정 연결을 원하는 경우 또는 push 인증 실패 시 · 사용자 | 터미널 gh auth login → GitHub.com → HTTPS → Login with a web browser. 브라우저에서 sungjaechoi 또는 저장소 쓰기 권한이 있는 계정으로 로그인·허용. MFA는 해당 화면에서 입력 | push에는 쓰기 인증이 필요. 도구가 로그인 완료를 표시하면 “로그인 완료”만 알려 줌 | gh auth status·해당 저장소 권한·원격 이력 확인 후 허용된 push 재개 |
| 계정/조직 권한 부족이 실제 확인된 경우 · 사용자 | [저장소 설정](https://github.com/sungjaechoi/community-lab/settings)에서 소유자가 접근 권한 확인. 조직이면 실제 필요한 승인을 그 화면에서 처리 | 로그인만으로 쓰기 권한이 생기지 않음. 대상 계정의 저장소 쓰기 권한 필요 | 실제 권한·보호 오류 재확인. 보호 정책을 끄지 않음 |
| Supabase·Google OAuth | 이번 STEP의 사용자 작업 없음 | STEP 03·06에서 각각 안내 | 지금 완료로 기록하지 않음 |

비밀번호·PAT·인증 코드·토큰을 채팅에 보내지 않는다. 브라우저나 터미널의 보안 입력으로 처리한다. [GitHub CLI 로그인](https://cli.github.com/manual/gh_auth_login)

## 7. 알려진 제한·면접 질문

- ESLint 9.39.5 설치 시 지원 종료 경고가 있었다. 실제 Next 설정과 플러그인 peer 선언을 조사했고 import/react/jsx-a11y의 설치·최신 배포는 ESLint 10 지원을 아직 선언하지 않았다. 생성기 조합을 유지해 린트는 통과했다. 의존성 강제 지정·검사 해제는 하지 않았으며 호환성 갱신 대상으로 기록한다. ESLint 10 실행은 미검증이며 동작 불가로 단정하지 않는다. [ESLint 지원 현황](https://eslint.org/version-support/), [Next 호환 안내](https://nextjs.org/docs/app/api-reference/config/eslint)
- 생성기 pnpm 설정은 sharp·unrs-resolver 설치 스크립트를 제외한다. 현재 기기의 타입·린트·빌드는 통과했으나 다른 OS·이미지 처리까지 검증하지 않았다.
- `/posts` 등 기능 API·화면은 아직 없고 공통 UI는 진행 중이다. 환경 단계에서 프로덕션 빌드를 확인했으며 UI 변경 후 검증은 별도 수행한다. 배포·pnpm start 서버 실행은 미검증이다.

1. **health 성공이면 DB도 정상인가요?** DB를 사용하지 않아 HTTP 경로만 확인한다. STEP 03에서 DB 연결을 따로 검사한다.
2. **커밋과 push는 왜 구분하나요?** 로컬 이력과 원격 반영은 다르다. 사용자 확인·인증·명령 성공·원격 결과를 각각 기록한다.

설명은 제공했지만 사용자의 이해·복습 완료는 확인하지 않았다. [02-ENV-REVIEW 기록](reviews/step02-env.md)의 환경 확인·커밋·push는 완료했고 공통 UI를 진행한다. 다음 사용자 확인은 `02-UI-REVIEW`다.

## 8. STEP 02 공통 UI 확인·커밋·원격 반영 후속 기록

사용자가 2026-10-27 후속 응답에서 개정 플랜과 `02-UI-REVIEW`를 명시적으로 확인했다. 실제 응답과 승인 기록 시각은 [UI 검토 자료](reviews/step02-ui.md)에 보존했다. UI·개정 플랜·환경 후속 문서 33개 파일을 `50c7f91ac1d518f47a73bb7ddc6877f5bdb182eb`로 커밋했고, Git 기록 시각은 2026-10-27 08:36:59 +09:00이다. 허용된 `origin/codex/step02-environment` push exit 0, 원격 해시 일치·직후 clean을 확인했다.

이 해시·push 결과를 적는 후속 변경은 다음 예정 `03-COMMIT`에 포함한다. STEP 03의 새 코드는 아직 승인·커밋하지 않았다.

## 9. STEP 03 Supabase·환경 변수·실제 연결

현재 계정 상태, 개발 프로젝트 준비, 공개값/비밀값의 역할, runtime·migration 연결 방식, 서버 검사 코드, SQL Editor·DBeaver, 분리 테스트 환경·Data API 원칙은 [Supabase 설정·WHY·계정 인계](supabase-setup.md)에 정리했다. [STEP 03 준비 결과](reviews/step03.md)는 자동 검사 성공과 실제 DB 미연결을 구분한다.

초기 ENV_MISSING·자리표시자 ENV_INVALID 이후 실제 값이 입력된 것을 확인했다. 입력 도구의 기존 값 보존 안내를 보완하고 공식 CA·SSL 강제를 적용해 두 DB 주소·Next.js의 실제 읽기를 성공시켰다. 별도 로컬 Supabase DB/Auth도 읽기·Auth HTTP200·중지/재기동을 확인했다. DBeaver Test Connection 성공·Finish도 사용자 보고로 확인했으며 현재 `03-REVIEW` 전체 확인을 기다린다. STEP 03은 아직 전체 사용자 승인·커밋하지 않았다.
