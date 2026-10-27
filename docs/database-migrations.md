# DB 도구·역할별 연결과 첫 migration 준비

STEP 05 · 2026-10-27 (Asia/Seoul). 업무 테이블·업무 migration은 아직 없다. 현재는 **도구 설정·실제 역할별 읽기 연결**까지 확인했다. [현재 ERD](erd.md)와 [기능별 변경 기록 기준](erd-history/README.md)을 유지한다.

## 목적과 파일의 역할

ORM은 코드에서 DB 조회를 작성·실행하는 도구다. SQL은 DB가 처리할 명령, DDL은 구조 변경, DML은 데이터 조회·추가·수정·삭제를 가리킨다. migration은 구조 변경 SQL을 순서 있는 파일과 적용 이력으로 관리하는 방식이다.

| 위치 | 역할과 WHY |
| --- | --- |
| `src/db/schema/index.ts` | 기능 schema의 공개 목록. 지금은 빈 export이며 테이블을 정의하지 않음. 첫 파일·export는 06-API-01에서 추가 |
| `src/db/client.ts` | Node.js의 pg Pool과 Drizzle 생성. 앱과 CLI가 같은 설정 검증·TLS 옵션을 사용하고 SQL 로깅은 끔 |
| `src/db/index.ts` | 앱의 서버 전용 진입점. `server-only`로 클라이언트 컴포넌트의 잘못된 import를 막고 실제 요청 때 연결 생성 |
| `src/db/settings.ts` | 환경·대상·역할 검사. 다른 프로젝트/운영·잘못된 역할·테스트의 클라우드 연결을 접속 전에 거부 |
| `drizzle.config.ts` | schema 위치·SQL 출력 경로·migration용 관리 연결. 파일을 읽는 것과 DB 접속·적용은 별개 |
| `drizzle/` | 향후 생성 SQL·snapshot·journal 위치. 현재는 폴더 자체를 생성하지 않음 |
| `infra/database/runtime-role.sql` | 전용 DB 역할의 기반 SQL. 업무 migration이 아니며 업무 테이블을 만들지 않음 |
| `scripts/prepare-database-role.ts` | 역할 생성·별도 비밀번호 준비·실제 인증 확인 후 환경 파일의 runtime 주소 교체. 기존 관리 비밀번호 유지 |

schema 파일을 작성해도 DB는 바뀌지 않는다. `generate`는 변경 SQL 파일을 만들고, `migrate`가 의도한 DB에 적용한다. 이후 실제 구조·제약·접근 결과를 따로 확인해야 한다.

## 설치한 버전과 선택 이유

Drizzle ORM **0.45.4**, Kit **0.31.11**을 정확한 버전으로 고정했다. npm 기본 배포 버전을 조회했고 기존 pg **8.23.1**·@types/pg **8.23.1**·@next/env **16.4.3**·tsx **4.23.15**를 재사용했다. ORM의 pg peer 조건은 `>=8`이다. 공식 문서의 RC 예제는 참고하되 이번에는 사전 배포 버전으로 바꾸지 않았다. 타입·린트·빌드와 실제 연결이 이 조합에서 통과했다. [Drizzle의 node-postgres 연결](https://orm.drizzle.team/docs/get-started-postgresql)

설치 시 기존 ESLint 지원 종료, Kit의 전이 의존성 @esbuild-kit 지원 종료, esbuild 설치 스크립트 제외 안내가 있었다. 현재 기기의 CLI·타입·린트·빌드는 동작했으며 설치 정책을 해제하지 않았다. 다른 OS의 재현은 미검증이다.

## 환경과 DB 역할

DB 역할은 접속한 코드가 무엇을 할 수 있는지를 정한다. Auth 사용자 계정이나 서비스의 관리자/일반 회원 구분과는 다른 개념이다.

| 환경·용도 | 실제 접속 방식 | 실제 역할 | 현재 범위 |
| --- | --- | --- | --- |
| 개발 앱 | transaction pooler 6543 | community_lab_runtime | public USAGE·DB CONNECT, 업무 테이블 권한 없음 |
| 개발 migration·관리 | session pooler 5432 | postgres | 구조 변경 가능한 기존 관리 역할. BYPASSRLS=true |
| 분리 테스트 앱 | 127.0.0.1:54322 direct | community_lab_runtime | 같은 제한 역할, 개발과 별도 자격 증명 |
| 분리 테스트 migration·관리 | 127.0.0.1:54322 direct | postgres | 로컬 스택의 관리 역할 |

개발 프로젝트는 `community-lab-dev` / `awqctedxgsjyqkswogdu`만 허용한다. direct IPv6 제약 때문에 관리 연결은 기존 session 방식을 유지한다. 공식 CA·`rejectUnauthorized=true`와 실제 두 구간 TLS=true를 확인했다. 로컬은 정확한 loopback·전용 포트·프로젝트 표시를 검사한 뒤 SSL 없이 연결하며 클라우드 설정과 구분한다. [Supabase 연결 방식](https://supabase.com/docs/guides/database/connecting-to-postgres)

전용 역할은 LOGIN=true, SUPERUSER/CREATEDB/CREATEROLE/INHERIT/REPLICATION/BYPASSRLS=false다. 실제 소유 public 객체·상위 역할 membership은 각각 0, public CREATE·auth USAGE도 false였다. 관리형 Auth 조회(`LIMIT 0`, 데이터 행 없음)와 `SET ROLE postgres`가 두 환경 모두 42501로 거부되었다. 관리 역할 postgres의 높은 권한은 앱 연결에 사용하지 않는다. DBeaver는 기존 관리 연결을 유지한다. [Supabase 역할 안내](https://supabase.com/docs/guides/database/postgres/roles)

아직 업무 테이블이 없어 **테이블별 최소권한·RLS·행 권한은 검증하지 않았다.** RLS를 켰더라도 소유자·BYPASSRLS 역할·정책 구성에 따라 결과가 다르므로 각 기능에서 검사한다. `request.jwt.claims`가 비어 있음을 확인했으며 직접 DB 접속에 Auth JWT나 사용자 신원이 자동 전달된다고 가정하지 않는다.

## 값 로딩과 비밀값 보관

- 앱은 Next.js가 앱 루트의 `.env.local`을 읽는다. CLI·Kit는 명시한 `COMMUNITY_LAB_DB_ENV`와 @next/env로 같은 환경을 읽는다. 테스트는 `NODE_ENV=test`·`.env.test.local`을 요구해 개발 파일로 대체하지 않는다. 운영 연결은 아직 지원하지 않는다.
- `DATABASE_URL`은 전용 runtime 역할, `MIGRATION_DATABASE_URL`은 postgres 관리 역할이다. 비밀번호는 서로 다르다. 기존 `env:configure`도 이를 정상으로 안내하고 값을 보존한다.
- 역할 준비 도구가 환경별 별도 난수 비밀번호를 만들었다. DB에는 SCRAM 검증값을 전송하고 원문은 출력하지 않는다. 제외된 `.secrets/runtime-development.json`·`runtime-test.json`에 복구 주소를 먼저 저장하므로 중간 실패 뒤 같은 자격 증명으로 재개할 수 있다. 이미 있는 미확인 역할은 덮어쓰지 않는다.
- 실제 환경·복구 파일 4개는 0600·Git 제외를 확인했다. `.env.example`만 빈 값으로 추적한다. 실제 값이나 복구 파일 내용을 채팅·Git에 옮기지 않는다.
- 앱은 `src/db/index.ts`만 서버 코드에서 import한다. 공용 Node.js 생성기는 CLI에서 쓰며 클라이언트 컴포넌트에서 참조하지 않는다. 빌드된 공개 JS 13개에서도 실제 DB URI·비밀번호 문자열이 없음을 확인했다. 전체 보안 감사나 클라이언트 import 실패 빌드를 실행했다는 뜻은 아니다.

환경 로딩·server-only 선택은 설치된 Next.js 16.4.3의 `node_modules/next/dist/docs/01-app/02-guides/environment-variables.md`와 `01-getting-started/05-server-and-client-components.md`를 확인했다.

## 실행 방법과 현재 실제 결과

앱 루트에서 실행한다. 첫 두 명령은 **역할 기반 설정을 변경하는 준비 명령**이며 일반적인 읽기 검사와 구분한다. 다른 기기에서는 기존 관리 주소·공식 CA와 로컬 Supabase 기반을 먼저 준비한다. 현재 기기의 계정/비밀번호 추가 입력은 필요 없다.

```bash
pnpm db:role:prepare
pnpm test:db:role:prepare
pnpm db:config:check
pnpm test:db:config:check
pnpm db:drizzle:check
pnpm test:db:drizzle:check
```

역할 준비는 두 환경에서 실제 생성·인증 성공, 재실행도 성공했다. config 검사 둘은 설정 로딩 성공이며 `connected:false`다. Drizzle 검사 둘은 runtime/migration 총 4연결의 읽기 전용 쿼리·실제 역할·소유권·권한 속성을 확인하고 runtime 거부 사례도 검증했다. 테스트 환경 sync 이후에도 전용 runtime 주소·연결이 보존되는 것을 확인했다. 분리 스택 기동은 [테스트 안내](../test-infra/README.md)를 따른다.

```bash
pnpm db:generate
pnpm db:migrations:check
pnpm db:migrate
pnpm test:db:migrate
```

위 네 명령의 **현재 실제 결과는 `status:skipped`, `NO_BUSINESS_SCHEMA_OR_MIGRATIONS`, `connected:false`**다. 감싼 실행기가 빈 schema/SQL을 확인해 Kit 본 실행 전에 멈췄다. 성공적인 SQL 생성·migration 적용·재현 검사로 해석하지 않는다. 설치한 CLI의 `--version`과 generate/check/migrate `--help`는 실제 실행했다. 첫 테이블이 생기면 검토한 SQL로 같은 명령을 사용한다. 이름은 명령 뒤 옵션을 추가하기 전에 실행기 지원 범위를 함께 수정·확인한다.

`check`는 migration 이력 파일의 일관성 검사이며 실제 DB와 schema의 일치, 제약·RLS·기존 행의 정상 이행까지 보장하지 않는다. [Kit check](https://orm.drizzle.team/docs/drizzle-kit-check), [Kit 설정](https://orm.drizzle.team/docs/drizzle-config-file)

## 첫 기능에서 수행할 순서 · 06-API-01부터

1. 사용자 행동·가상 행에서 profiles의 컬럼·참조·제약 이유를 설명하고 이전 그림과 **미적용 후보**를 해당 기능 이력에 남긴다. 지금 컬럼·삭제 정책을 확정하지 않는다.
2. schema 파일을 추가하고 index에서 export한다. SQL 생성 → 실제 생성 SQL 검토 → 필요한 초기 REVOKE/GRANT/RLS를 **같은 테이블 생성 migration**에 포함한다. 관리형 auth를 재생성하지 않는다.
3. 기본 ACL의 잔존 권한과 Data API 노출을 확인한다. 생성 SQL·초기 제한이 커밋되기 전 불필요한 접근이 생기지 않도록 같은 트랜잭션에서 처리한다. 역할별 정책·서버의 인증/대상 권한 경계는 기능 요구에 맞춰 결정한다.
4. 분리 테스트에 적용하고 실제 정상·잘못된 입력·참조/중복/NULL·권한 거부를 검사한다. Auth 사용자는 지원되는 Auth 경로로 준비한다. 임의 UUID로 업무 행을 채우지 않는다.
5. **명시적으로 준비한 깨끗한 분리 대상**에 처음부터 재적용하고 중요한 거부 사례를 다시 확인한다. 데이터가 있는 대상의 이행·호환성도 필요한 경우 검증한다. 무조건 reset하는 명령을 현재 단계에 추가하지 않는다.
6. 분리 검증 뒤 의도한 개발 대상에 적용·실제 구조를 재확인한다. 현재 ERD와 적용 후 그림·SQL·검증을 연결하고 기존 API REVIEW에서 함께 확인받는다.

### 트랜잭션·실패·이력의 실제 구현 조사

설치한 Kit 0.31.11의 pg 경로는 ORM의 `node-postgres/migrator`를 호출한다. ORM 0.45.4 `pg-core/dialect.js`를 읽어 확인한 동작은 다음과 같다. [Kit migrate 개요](https://orm.drizzle.team/docs/drizzle-kit-migrate)

- 먼저 `drizzle` 스키마·`__drizzle_migrations` 이력 테이블을 준비한다. 이 준비는 뒤의 변경 SQL 트랜잭션 바깥이다. 첫 실패 뒤에도 이 메타데이터가 남을 수 있다.
- 마지막 이력의 시각을 읽고 새 SQL 실행과 이력 INSERT를 한 트랜잭션으로 묶는다. pg session 구현은 오류 시 ROLLBACK한다. 실제 생성 SQL과 초기 제한 SQL을 같은 변경에 넣어 검토할 이유다.
- `drizzle/meta/_journal.json`의 순서·시각과 SQL 파일을 읽고 hash를 계산한다. 적용 판단은 마지막 시각을 기준으로 하므로 **과거 SQL을 수정하면 자동으로 거부해 준다고 기대하지 않는다.** 적용한 SQL/snapshot/journal은 보존하고 새 migration으로 보완한다.
- 자동 down/실패 복구를 제공한다고 가정하지 않는다. 실패 시 대상·실제 구조·이력·트랜잭션 밖 작업을 확인하고 원인을 고친 뒤 재검증한다. 이미 적용된 변경의 수정은 새 SQL로 남긴다. 적용 실행은 한 번에 하나로 직렬화하고, 데이터 손실 가능성이 있으면 보정·백업·복구 계획을 먼저 검토한다.

위 내용은 **설치 소스 조사 결과**다. 실제 업무 migration의 원자성·노출 공백·실패 복구·깨끗한 DB 재현 검증은 아직 수행하지 않았다. `CREATE INDEX CONCURRENTLY`처럼 트랜잭션 제약이 다른 작업이 필요해지면 해당 기능에서 실행 방식부터 재검토한다.

## 작은 읽기 예와 면접 질문

```ts
// 서버 내부 흐름의 축약 예. 실제 연결 생성은 src/db/index.ts를 사용한다.
const result = await getDatabase().execute(sql`SELECT current_user AS role`);
```

입력은 서버 환경 설정 → 환경·대상·역할·TLS 검증 → 전용 역할로 SQL 실행 → 서버에서 결과 확인 순서다. 개발 진단 API는 내부 역할·주소를 반환하지 않고 `{"status":"ok"}`만 응답한다. 실패는 허용한 오류 분류만 전달하며 Drizzle이 감싼 원본 SQL·접속 오류는 내보내지 않는다.

1. **도구 설치와 migration 검증은 어떻게 다른가요?** 설치·설정·읽기 연결은 준비다. 실제 변경 SQL의 적용·재현·제약·권한·실패 결과까지 확인해야 변경을 검증했다고 말할 수 있다.
2. **왜 runtime과 migration을 나누나요?** 앱의 접속 코드에 구조 변경·RLS 우회 권한을 주지 않기 위해서다. URL의 연결 모드와 DB 역할은 서로 다른 구분이며 둘 다 실제로 확인해야 한다.

설명과 검증 근거는 제공했으며 사용자의 이해·복습 완료는 확인하지 않았다. 현재 사용자 확인은 [05-REVIEW](reviews/step05.md)에서 기다린다.
