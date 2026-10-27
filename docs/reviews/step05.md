# STEP 05 검토 자료 · 도구와 역할별 연결

2026-10-27 (Asia/Seoul). 후속 응답으로 **05-REVIEW 전체 승인**을 받았다. 아래는 제출 당시 자료·검증 한계이며 커밋·push 결과는 성공 후 기록한다.

실제 응답: “05-REVIEW 전체 확인했어. 커밋·push하고 STEP 06 진행해줘. 내가 해야 할 계정 작업은 구체적으로 안내하고, profiles 설계·생성과 ERD 변경 이유를 설명해줘. 06-API-REVIEW에서 결과를 보여주고 멈춰줘.” 승인 기록 시각은 2026-10-27 10:30:56 +09:00, 정확한 전송 시각은 제공되지 않았다. 05-REVIEW DONE·05-COMMIT APPROVED로 기록하고 실제 커밋·허용된 push 성공 후 STEP06을 진행한다.

## 수행 결과와 WHY

STEP 04 승인 범위 9개 파일을 `560f7c0402bc020d23e578fc5c51c7c8a9f2f2ac` (`docs: establish incremental ERD learning and change records`)로 커밋·같은 브랜치에 push했다. 실제 Git 시각 2026-10-27 10:12:28 +09:00, 원격 해시 일치·직후 clean을 확인한 다음 STEP 05를 시작했다. 성공 기록은 다음 예정 05-COMMIT에 포함한다.

Drizzle ORM 0.45.4·Kit 0.31.11을 고정하고 기존 pg·환경 로더를 재사용했다. 앱의 실행 역할은 `community_lab_runtime`, 구조 변경용 관리 역할은 기존 `postgres`로 분리했다. 업무 테이블·빈 migration·이력 테이블은 만들지 않았다. 역할 생성·CONNECT/USAGE 부여만 기반 SQL로 실제 적용했다.

자세한 설정·파일 역할·WHY·실행 방법·첫 migration 절차·면접 질문은 [DB 도구 안내](../database-migrations.md)를 따른다. 현재 모델은 [기존 ERD](../erd.md), 기능별 그림·SQL·검증 기록은 [이력 기준](../erd-history/README.md)을 유지한다.

## 실제 연결 결과

| 환경 | runtime / migration | 실제 검사 결과 |
| --- | --- | --- |
| 개발 | transaction6543·community_lab_runtime / session5432·postgres | 두 연결 Drizzle 읽기 성공·read_only=on. client 인증서 검증/DB 쪽 TLS 모두 true |
| 분리 테스트 | loopback54322·community_lab_runtime / loopback54322·postgres | 두 연결 Drizzle 읽기 성공·read_only=on. 전용 로컬 연결이며 SSL false |
| 전용 역할 속성 | 두 환경 동일 | LOGIN=true. SUPERUSER/CREATEDB/CREATEROLE/INHERIT/REPLICATION/BYPASSRLS=false |
| 전용 역할의 현재 접근 | 두 환경 동일 | public CREATE=false·auth USAGE=false·public 소유 객체0·상위 membership0·JWT 문맥 없음 |
| 실제 거부 | 두 환경 동일 | Auth `SELECT ... LIMIT 0`와 `SET ROLE postgres`가 각각 42501. Auth 데이터 행 조회 없음 |
| 관리 역할 | 두 환경 postgres | CREATE·BYPASSRLS=true. 앱에서 이 역할을 사용하지 않음. 향후 migration 소유권·테이블별 권한 검증은 별도 |
| 현재 구조 | 두 환경 | public 관계0·drizzle 스키마 없음. 업무 테이블·migration 이력 생성 없음 |

## 직접 실행하고 비교하기

앱 루트에서 다음 읽기 검사를 실행한다. 정상 결과는 `status:ok`, runtime 역할은 community_lab_runtime, migration 역할은 postgres다.

```bash
pnpm db:config:check
pnpm test:db:config:check
pnpm db:drizzle:check
pnpm test:db:drizzle:check
```

config 두 검사는 `connected:false`로 실제 연결 검사와 구분된다. 테스트 스택이 중지됐다면 `pnpm test:env:start` 후 실행한다. 계정 로그인·새 비밀번호 입력 등 현재 추가 사용자 작업은 없다. 관리 비밀번호와 DBeaver는 기존 값을 유지하며 앱 역할의 별도 값은 로컬에서 자동 준비했다.

개발 앱에서는 [DB 진단](http://127.0.0.1:3001/api/dev/db-check)이 200 `{"status":"ok"}`를 반환한다. 실제 Drizzle·전용 역할의 읽기이며 응답에 내부 역할·주소·비밀값은 없다. 화면 기능이나 사용자 로그인 구현 성공을 의미하지 않는다.

## 자동·실제 검증과 남은 검증

- `pnpm typecheck`·`pnpm lint`·`pnpm build` 통과. `pnpm test:setup` 17/17 통과. 환경 미지정/production·역할 혼동·다른 프로젝트·테스트의 클라우드 연결·오류 전문 노출 경계 포함.
- 입력 도구의 별도 가상 5경우에서 기존 값 보존·비밀 출력 방지 확인. 실제 `.env.local`도 `env:configure` 후 내용 지문 불변. 역할 준비 재실행·테스트 env sync 뒤 runtime 보존과 재연결도 성공.
- 개발3001 DB 진단200·no-store·health200·posts200. 검사용 프로덕션3002는 DB 진단404·빈 본문·health200·POST405·posts200. 검사용3002만 종료했고 기존3001/3000은 유지했다.
- 실제 환경·복구 파일4개는0600·Git 제외. 공개JS13개에서 실제 DB URI/비밀번호 문자열 미발견. `server-only` 선언·현재 클라이언트 import 경로를 검토했으며 고의로 잘못된 클라이언트 import를 넣은 실패 빌드는 미실행이다.
- `db:generate`·`db:migrations:check`·`db:migrate`·`test:db:migrate`는 **skipped**다. schema/SQL이 없어 Kit 본 실행·DB 접속을 하지 않았다. 빈 파일·snapshot·journal도 없다. CLI 버전과 세 명령의 도움말만 실제 실행했다.
- 업무 테이블 생성·RLS/제약·사용자별 권한·migration 적용/실패/재적용·노출 공백은 **미검증**이다. 첫 profiles 설계·SQL·검증을 06-API-01부터 진행한다. 테스트 사용자도 그때 Auth 방식으로 준비한다.

최종 문서 검사도 통과했다. Markdown23개·내부 링크/이미지123개 정상, 기존 작업ID259개 순서 보존·체크66개, 허용 변경 외 기존 소스/설정/이미지47개 내용 일치를 확인했다. 현재 ERD·이력 기준을 보존했으며 변경27개는 미커밋·staged0이다. HEAD와 원격은 STEP04 커밋560f7c0으로 일치한다. 검토 자료 기록 시각은 2026-10-27 10:22:35 +09:00이다.

## 이번 확인 항목

1. schema 코드·SQL 생성·실제 DB 적용·검증이 서로 다른 단계라는 설명.
2. 앱 실행과 관리 역할의 목적·실제 연결/거부 결과·현재 검증 한계.
3. 업무 테이블 없이 도구를 준비하고, 첫 SQL과 초기 권한 제한을 같은 변경에 넣어 분리 검증하는 절차.
4. 기능마다 변경 전·후보·적용 후 ERD와 실제 SQL·검증을 함께 남기는 방식.

현재·다음 재개 ID는 **05-REVIEW**다. 수정 요청은 같은 REVIEW에서 보완하며, 확인 후 ID는 **05-COMMIT**이다. 성공 후 다음 STEP 시작 ID는 `06-AUTH-01`이다. STEP 06은 아직 시작하지 않았다.
