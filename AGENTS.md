# community-lab 작업 규칙 · v3

이 프로젝트는 프론트엔드 경험을 바탕으로 백엔드를 학습하는 Next.js 풀스택 포트폴리오다. 한국어로 설명하며 기능, WHY, 검증 근거를 함께 남긴다. 사용자의 현재 요청과 이미 확정한 결정을 먼저 따른다.

## 설명과 학습

- 작업 전에 목적과 WHY, 이번 완료 기준을 짧게 설명한다. 낯선 용어는 처음 나올 때 풀이한다.
- 핵심 코드는 작은 예제로 보여 주고 입력 → 검증 → 처리 → 결과를 설명한다. 설정은 역할과 선택 이유를 설명한다.
- 기능을 마치면 면접 질문 1~2개와 답변의 핵심을 남긴다. 설명 제공과 사용자의 이해 완료를 구분한다.

## 기능별 데이터 설계 학습

- 전체 업무 ERD를 먼저 확정하지 않는다. STEP 04는 현재 구조 읽기·변경 기록 방식, STEP 05는 Drizzle·migration 도구 준비에 한정한다.
- 업무 테이블은 해당 기능에서 처음 설계·생성한다. 사용자 행동과 행 예시 → 필요한 컬럼·관계·제약의 WHY → 변경 전후 후보 → schema·migration·초기 접근 제한 적용·검증 → 현재 ERD 갱신 순서로 설명한다.
- `docs/erd.md`는 실제 적용한 현재 구조만, `docs/erd-history/<기능>.md`는 이전 그림·변경 이유·실제 SQL·검증을 보존한다. 후보와 실제 적용을 구분하고 적용된 migration은 덮어쓰지 않는다.
- 이 데이터 작업은 기존 기능 API 묶음과 API REVIEW·COMMIT에 포함한다. 별도 DATA 승인 묶음을 임의로 만들지 않으며, 아직 만들지 않은 기능의 테이블을 먼저 설계하거나 검증 완료로 표시하지 않는다.

## 문서와 시작 순서

| 용도 | 시작 폴더 | 실제 앱으로 이관한 뒤 |
| --- | --- | --- |
| 지속적인 규칙 | AGENTS.md | AGENTS.md |
| 정식 플랜 | community-lab-work-plan.md | docs/work-plan.md |
| 현재 상태와 다음 작업 | docs/work-status.md | docs/work-status.md |

1. 현재 작업에 적용되는 기존 AGENTS.md, 하위 지침, 사용자의 이번 요청을 읽는다.
2. 진행 기록에서 실제 앱 경로, 정식 플랜 경로, 현재 작업 묶음, 다음 ID, 사용자 확인과 차단 상태를 읽는다.
3. 실제 파일·Git 상태·검증 근거를 확인한다. 기록과 다르면 근거를 조사하고 정정한다.
4. 최초에는 플랜의 범위와 원칙을 읽는다. 이후에는 현재 STEP과 선행 결정·해당 코드·관련 검증을 읽는다.
5. 읽은 규칙 경로, 현재 STEP, 이번 요청 범위, 다음 사용자 확인 지점을 짧게 알린다.

플랜의 초기값으로 실제 기록을 초기화하지 않는다. 긴 플랜을 이 파일에 복제하지 않으며 해당 단계의 완료 기준은 생략하지 않는다.

## 작업 범위와 사용자 확인

- 사용자가 지정한 범위를 따른다. 범위 없이 "계속"이면 현재 또는 다음 미완료 STEP 하나가 기본 범위다.
- 요청 범위 안의 구현·수정·검증은 자율적으로 진행하되 플랜의 사용자 확인 지점에서는 반드시 멈춘다.
- "STEP 01부터"만으로 전체 플랜을 한 번에 구현하지 않는다. 전체 구현 요청에도 정해진 확인 지점은 적용한다.
- 자동 검증 통과, 사용자의 침묵, 과거의 일반적인 진행 요청을 이번 변경 범위의 확인으로 간주하지 않는다.
- 확인할 결과를 완성하고 실행 방법·기대 결과·실제 결과를 제시한 뒤 WAITING_USER_REVIEW로 기록한다.
- 사용자가 해당 범위를 확인하면 같은 범위의 커밋 허가를 다시 묻지 않는다. 커밋 후 이번 요청 범위 안의 다음 작업을 진행한다.
- 수정 요청이면 같은 묶음을 수정·재검증하고 같은 REVIEW ID에서 다시 확인받는다. 확인 후 추가한 동작은 새 범위로 확인받는다.
- 중간 질문에는 답하고 현재 위치를 유지한다. 요구사항의 큰 변화나 미정인 계정 선택은 기존 맥락을 먼저 확인해 필요한 내용만 묻는다.

## 단계별 진행 순서

| 대상 | 지켜야 할 순서 |
| --- | --- |
| STEP 01 | 01-01부터 요구사항 정리 → 01-REVIEW 대기 → 01-RECORD. Git 저장소를 만들지 않고 STEP 02 첫 커밋에 포함 |
| STEP 02 | 02-ENV-xx·02-GIT-xx 준비 → 02-ENV-REVIEW → 02-ENV-COMMIT → 02-GIT-PUSH(허용 시) → 02-UI-xx → 02-UI-REVIEW → 02-UI-COMMIT |
| STEP 03 | 03-SETUP-xx → 03-REVIEW → 03-COMMIT |
| STEP 06~09, 12~13 | NN-API-xx → NN-API-REVIEW → NN-API-COMMIT → NN-UI-xx → NN-UI-REVIEW → NN-UI-COMMIT |
| STEP 10 | 10-FRIEND-API·10-FRIEND-UI → 10-INBOX-API·10-INBOX-UI. 각 묶음의 REVIEW·COMMIT을 순서대로 수행 |
| STEP 11 | HTTP API·Realtime 서버 설정(11-API-xx) → 11-API-REVIEW → 11-API-COMMIT → 11-UI-xx → 11-UI-REVIEW → 11-UI-COMMIT |
| 그 밖의 STEP | 정식 플랜의 결과 확인·기록·커밋 순서를 적용. 의미 없는 API/UI 작업을 추가하지 않음 |

정확한 세부 ID는 정식 플랜을 따른다. 커밋이 필요한 묶음은 사용자 확인과 커밋 성공까지 끝나야 다음 묶음으로 넘어간다. STEP 12 RBAC는 선택 심화다.

## 검토 자료와 상태

- API 확인에는 요청 방법, 입력 예시, 정상 응답과 중요한 실패·권한 사례, 실제 검사 결과를 제공한다.
- UI 확인에는 실행 주소, 사용자 행동, 기대 화면, 로딩·빈 결과·오류·권한 상태, 실제 API 연결 여부를 제공한다.
- 상태는 TODO / IN_PROGRESS / VERIFYING / WAITING_USER_ACTION / WAITING_USER_REVIEW / APPROVED / DONE / BLOCKED / DEFERRED를 사용한다. 미확인은 초기 템플릿에만 쓴다.
- REVIEW는 사용자의 확인이 있어야 DONE이다. 구현·자동 검증이 끝나도 전체 묶음은 COMMIT 성공 전 완료로 기록하지 않는다.
- 차단되면 원인, 가능한 작업, 해제 담당자, 필요한 행동, 재개 ID를 남긴다. 확인이나 계정 작업을 완료한 것으로 추정하지 않는다.

## Git과 외부 계정

- 먼저 기존 브랜치·remote·변경 파일·staged 내용을 확인한다. 사용자 변경과 기존 staged 상태를 보존하며 관련 없는 변경을 섞지 않는다.
- 확인된 범위의 파일·변경만 stage한다. 무조건 git add . 또는 git commit -a를 실행하지 않는다. 커밋 직전 실제 diff를 확인한다.
- 커밋 실패 시 실제 오류를 기록하고 BLOCKED로 둔다. Git 사용자 정보를 만들거나 서명·훅·보호 정책을 해제해서 통과시키지 않는다.
- commit은 로컬 기록, push는 원격 반영이다. 첫 Git 준비에서 대상 remote·브랜치와 push 정책을 확인·기록한다. 미정이면 로컬 커밋까지만 한다.
- 이미 허용된 push는 같은 범위에서 재승인받지 않는다. 원격 이력이 다르거나 보호 정책이 있으면 원인을 확인하며 강제 push로 덮어쓰지 않는다.
- Git·대시보드 작업은 인증된 도구와 권한이 있으면 수행한다. 일괄적으로 "에이전트가 불가능한 작업"으로 분류하지 않는다.
- 로그인·MFA·조직 권한 등 사용자 작업이 필요하면 화면, 설정 항목, WHY, 완료 기준, 다음 검증을 안내한다. 비밀번호·PAT·인증 코드를 채팅으로 요구하지 않는다.
- DB 비밀번호·서버 비밀키·사용자 토큰은 코드·문서·Git·로그에 남기지 않는다. 보안 입력란이나 환경 파일을 사용하고 .gitignore로 실제 제외되는지 확인한다. 예시 파일은 자리표시자로 작성한다.
- Supabase 프로젝트 준비, 환경 값 입력, DB 실제 연결, 앱 연결 검증을 각각 구분한다. 대시보드의 실제 연결 정보를 사용하고 런타임·마이그레이션 연결 방식을 확인한다.

## 코드와 실제 검증

- 기본 스택은 Next.js App Router·TypeScript·Route Handlers, Supabase PostgreSQL·Auth·Realtime, Drizzle이다. 변경 시 이유와 영향을 설명한다.
- 기존 코드·지침·생성기가 만든 AGENTS.md를 읽고 필요한 부분만 병합한다. 새 도구·추상화는 현재 문제를 해결할 때 도입한다.
- 서버에서 입력·인증·대상 권한을 검증한다. Drizzle 직접 연결, Data API, Realtime의 권한 경계를 구분한다.
- DB 변경은 migration으로 관리하고 테스트는 분리된 환경을 사용한다. 새 테이블 생성과 필요한 초기 GRANT·REVOKE·RLS를 함께 적용한다. 브라우저 코드에 DB 연결 문자열이나 서버 비밀값을 넣지 않는다.
- 실제 package.json과 설정을 읽고 사용 가능한 명령으로 타입·린트·빌드·관련 테스트를 검증한다. 현재 변경의 위험과 완료 기준에 맞게 범위를 정한다.
- 권한·무결성·트랜잭션·동시성·실시간 복구는 해당 기능의 중요한 실패 사례도 확인한다. UI 상태와 실제 API 연결도 별도로 검증한다.
- 코드 작성, 명령 실행, 검증 성공을 구분한다. 실행하지 못한 검사·서비스 연결·성능 측정은 미검증으로 남긴다.

## 기록과 재개

- 진행 기록에는 현재 STEP·묶음·작업 ID, 변경 파일, 실제 검증, 사용자 확인 범위·실제 말·시각, 차단 이유, 다음 ID를 갱신한다.
- 확인 대기 중 현재·다음 재개 ID는 해당 REVIEW로 유지하고 확인 후의 COMMIT ID를 별도로 적는다. STEP 01만 확인 후 01-RECORD를 수행한다. 커밋을 건너뛰어 다음 UI를 시작 위치로 적지 않는다.
- 커밋 성공 후 실제 해시를 기록한다. 이 기록 변경은 다음 예정된 커밋에 포함하며 해시를 기록하려고 커밋을 무한 반복하지 않는다.
- push 정책·실제 결과, 외부 계정 인계, 기존 ID와 새 ID의 대응 관계를 보존한다. 기존 완료를 새 UI 항목의 완료로 자동 승계하지 않는다.
- 긴 설계·WHY·학습 내용은 해당 문서에 두고 여기에는 요약·경로를 남긴다. 증거를 확인한 뒤 플랜 체크박스도 맞춘다.
- 마지막 응답은 수행한 일 → WHY → 실제 검증 → 사용자 확인 항목 또는 차단 → 다음 작업 ID로 정리한다.

## STEP 02 생성과 문서 이관

기존 앱이 있으면 재생성하지 않는다. 새 앱은 문서가 있는 시작 폴더 아래 community-lab 하위 폴더에 만든다. 생성기의 현재 옵션을 확인하고 create-next-app의 --disable-git를 사용해 사용자 확인 전 자동 Git 초기화·초기 커밋을 방지한다.

앱 루트의 기존 AGENTS.md와 이 규칙을 병합한다. 전체 플랜은 docs/work-plan.md로, 진행 기록·STEP 01 문서는 앱의 docs/로 이관한다. 내용과 경로를 확인한 뒤 앱 내부를 유일한 진행 원본으로 지정하고 상위 진행 기록에는 이동 경로만 남긴다. 다음 작업부터 실제 앱 루트를 선택하도록 안내한다.

실제 성공한 명령(앱 루트, 2026-10-26~27):

- 개발: `pnpm dev --hostname 127.0.0.1 --port 3001` — 기본 화면·health 응답 확인.
- 타입: `pnpm typecheck` — `next typegen && tsc --noEmit` 통과.
- 린트: `pnpm lint` — `eslint . --max-warnings=0` 통과.
- 빌드: `pnpm build` — Turbopack 프로덕션 빌드 통과.
- 프로덕션 실행: `pnpm start --hostname 127.0.0.1 --port 3001` — 준비 화면·리다이렉트·개발 전용 경로 404·health 확인.
- 설정 검사: `pnpm test:setup` — 환경값·대상·TLS·비밀 출력·개발/테스트 경계 10개 통과.
- 개발 DB: `pnpm env:check`·`pnpm db:check` — 공식 CA 적용 후 runtime/migration 읽기·TLS 인증서 검증 통과. Next.js 개발 진단도 실제 DB 연결 200 확인. 자세한 결과는 STEP 03 검토 자료를 따른다.
- 분리 테스트: `pnpm test:env:start`·`pnpm test:env:check`·`pnpm test:env:stop` — 로컬 DB/Auth 기동·읽기·중지/재기동 확인. `.env.test.local`과 `test-infra/README.md`를 사용하며 개발 DB로 대체하지 않는다.
- 업무 통합 테스트 명령은 아직 없다. Node 22.15.1·pnpm 10.29.3에서 확인했고 자세한 근거·제한은 `docs/development-setup.md`, 현재 상태는 `docs/work-status.md`를 따른다.

## 생성기가 제공한 Next.js 지침

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
