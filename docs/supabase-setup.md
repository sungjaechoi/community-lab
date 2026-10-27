# STEP 03 Supabase 연결 준비와 WHY

작성일: 2026-10-27 (Asia/Seoul). 현재 실제 상태는 [진행 기록](work-status.md), 검사 결과는 [03 검토 자료](reviews/step03.md)를 따른다.

목적은 Next.js 서버가 선택한 개발 DB에 안전하게 접속하는지 확인하는 것이다. **계정 로그인 → 프로젝트 준비 → 값 입력 → CLI 접속 → Next.js 접속 → 관리 도구 접속**을 각각 구분한다. 아래는 STEP 03 준비 당시의 계정·연결 이력이다.

후속 STEP 05에서 Drizzle·전용 앱 역할을 준비했다. 현재 `DATABASE_URL`은 community_lab_runtime의 별도 비밀번호, `MIGRATION_DATABASE_URL`과 DBeaver는 기존 postgres 관리 비밀번호를 유지한다. 두 비밀번호가 다른 것이 정상이며 `env:configure`는 재입력 없이 보존한다. 새 계정 작업은 없다. 현재 역할별 실제 연결·첫 migration의 남은 검증은 [DB 도구 안내](database-migrations.md)를 따른다. 업무 테이블·업무 migration은 여전히 없다.

## 현재 확인한 것

- 최초 Chrome Dashboard는 로그인 화면이었다. 이후 사용자 응답 “신규”, “로그인 완료 현재 대시보드에 위치해 있어”를 받고 로그인된 다른 탭에서 `sungjaechoi` 계정을 확인했다. GitHub CLI 로그인과는 별개로 확인했다.
- 개인 조직 `sungjaechoi's Org`는 Free이고 사용자는 해당 프로젝트 Owner다. 사용자가 “프로젝트 생성 완료.”라고 알려 준 뒤 `community-lab-dev`·Seoul(`ap-northeast-2`)·Healthy를 실제 화면에서 확인했다. 프로젝트 참조는 `awqctedxgsjyqkswogdu`다. 기존 프로젝트는 변경하지 않았다.
- Data API 켬·Automatically expose new tables 끔을 생성 후 설정 화면에서 확인했다. SQL Editor에서 자동 RLS 트리거 `ensure_rls`·`ddl_command_end`·enabled `O`를 확인했다. 실제 기본 권한은 아래 5절처럼 일부 남아 있으므로 자동 공개 끔을 모든 권한 회수로 취급하지 않는다.
- Supabase 연동 플러그인은 검색했으나 현재 미설치다. 설치·계정 연결을 완료하면 사용 가능한 기능과 프로젝트 권한을 다시 확인한다. 브라우저 로그인으로도 가능한 작업을 이어갈 수 있다.
- DBeaver Community 26.0.0 설치·실행·선택적 통계 전송 거부를 확인했다. 이후 Docker 엔진27.3.1도 실행했고 공식 CLI2.122.0을 앱 `.tools/bin/supabase`에 준비했다. Homebrew CLI 설치는 오래된 개발 도구로 실패해 공식 배포·체크섬 검증 경로를 사용했다. psql 설치는 필요하지 않았다.
- `.env.local`은 빈 예시로 시작했고 권한은 0600(소유자만 읽기·쓰기)이다. 이후 실제 공개값·두 주소·비밀번호가 입력된 것을 비밀 출력 없이 확인했다. 기존 값은 보존했으며 공식 CA 적용 뒤 runtime/migration·Next.js 실제 읽기가 성공했다.

## 1. 계정·개발 프로젝트 준비 — 사용자 작업

1. [Supabase Dashboard](https://supabase.com/dashboard)에서 원래 사용하던 방식으로 로그인한다. MFA·이메일 확인은 해당 화면에서 처리한다. 앱의 Google 로그인은 STEP 06이므로 이번 계정 로그인과 다르다.
2. 기존 개발 프로젝트가 있다면 **이 프로젝트에 사용할 대상인지** 확인하고 이름만 알려 준다. 다른 작업·운영 프로젝트를 바꾸지 않는다.
3. 신규 선택에 따라 개인 조직의 `New project` 화면에 이름 `community-lab-dev`와 초기 접근 설정을 준비했다. 실제 생성·프로젝트 수 한도 통과는 제출 뒤 확인한다. 기존 프로젝트를 중지·삭제하거나 요금제를 바꾸지 않았다.
4. 한국 사용자 학습 기준으로 Seoul(`ap-northeast-2`)을 선택했다. 지역 목록의 최종 표시가 Northeast Asia (Seoul)임을 확인했다. [공식 지역 목록](https://supabase.com/docs/guides/platform/regions)
5. DB 비밀번호는 비밀번호 관리 도구로 생성·저장하고 **생성 화면에 직접 입력**한다. 채팅·문서·스크린샷·Git에 넣지 않는다. 준비 상태가 정상으로 바뀌면 프로젝트 이름·개발 용도·지역만 알려 준다.

WHY: 연결할 대상을 먼저 고정해야 다른 프로젝트의 데이터를 잘못 다루는 일을 막을 수 있다. 사용자가 새 DB 비밀번호의 입력·생성 제출을 직접 완료했다. Dashboard의 기본 브랜치가 `main / Production`으로 표시되더라도 이 프로젝트의 실제 사용 목적은 개발이다. 별도 운영 환경을 준비한 것으로 취급하지 않는다.

## 2. 로컬 환경값 입력 — 사용자 비밀 입력

앱 루트의 `.env.local`을 로컬 편집기로 연다. [빈 예시](../.env.example)는 Git에 들어가지만 실제 파일은 제외된다. 값을 채팅으로 보내지 않는다.

| 변수 | 가져오는 화면·내용 | 공개 여부·사용 위치 |
| --- | --- | --- |
| NEXT_PUBLIC_SITE_URL | 현재 로컬 사이트 주소 `http://localhost:3001` | 공개 가능. 이후 Auth 리다이렉트에 사용; 지금 DB 검사에서는 사용하지 않음 |
| NEXT_PUBLIC_SUPABASE_URL | 프로젝트 `Connect`의 Project URL | 공개 가능. 검사에서는 프로젝트 식별; Auth 클라이언트는 STEP 06 |
| NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY | Connect 또는 `Settings > API Keys`의 publishable key | 브라우저 공개 가능. 형식·Auth 설정 읽기에서 유효/무효 키 구분 확인. 실제 사용자 로그인은 후속 범위 |
| DATABASE_URL | Connect의 `Transaction pooler` URI | 서버 비밀. 서버 런타임 접속 점검용 |
| MIGRATION_DATABASE_URL | Connect의 `Direct connection` URI. IPv4 제약이 있으면 실제 `Session pooler` URI | 서버 비밀. 관리·migration 접속 점검용; 아직 migration을 실행하지 않음 |
| MIGRATION_DATABASE_CONNECTION_MODE | `direct` 또는 `session`, 위에서 실제 선택한 방식 | 비밀 아님. 두 방식 혼동과 transaction 방식의 오용을 검사 |
| DATABASE_CA_CERT_PATH | 런타임 접속에 별도 신뢰 인증서가 필요할 때 로컬 경로 | 선택 사항. 예: `.secrets/root.crt`; TLS 검증 실패 원인에 맞을 때만 입력 |
| MIGRATION_DATABASE_CA_CERT_PATH | migration 접속에 프로젝트 Database 설정의 루트 인증서가 필요할 때 로컬 경로 | 선택 사항. direct와 pooler의 인증서 체인이 다를 수 있어 경로를 각각 지정 |

`NEXT_PUBLIC_`는 브라우저에 포함될 수 있다는 뜻이다. DB 주소·DB 비밀번호·`sb_secret_`·`service_role`은 넣지 않는다. publishable key는 앱 식별이며 사용자 권한을 대신하지 않는다. [공식 API 키 안내](https://supabase.com/docs/guides/getting-started/api-keys)

DB URI의 호스트·포트·사용자명은 **그 프로젝트의 Connect에서 복사**한다. 지역 이름으로 pooler 호스트를 조립하지 않는다. URI 안의 비밀번호만 해당 DB 비밀번호로 바꾸며 `@`, `#`, `%`, `$`, 공백 등 예약 문자는 URI 인코딩한다. Next의 환경 로더는 `$`를 변수 참조로 해석하므로 URI에서는 `%24`처럼 인코딩한다. 한 번만 인코딩하며, DB 로그인 비밀번호 자체를 인코딩된 문자열로 바꾸는 것은 아니다.

이번에는 공개값·두 주소를 에이전트가 반영했고, 비밀번호만 직접 입력하는 도구를 준비했다. 직접 연 터미널에 다음 한 줄을 붙여넣고 Enter를 누른다.

```bash
pnpm --dir /Users/sungjaechoi/ToyProject/community-lab-workspace/community-lab env:configure
```

두 주소가 자리표시자일 때 생성 때 저장한 DB 비밀번호를 두 번 입력하고 각 Enter를 누른다. 화면에 입력 문자가 보이지 않는 것이 정상이다. `scripts/configure-db-password.mjs`는 URI 인코딩을 한 번 적용해 두 주소에 저장하며, Git 제외·일반 파일·자리표시자·입력 일치·입력 중 파일 변경을 검사한다. 실제 값은 명령 인자·출력·임시 로그로 남기지 않고 0600 파일로 원자적으로 교체한다.

이미 두 주소에 같은 비밀번호 값이 있으면 파일을 바꾸지 않고 정상 종료하며 검사 명령을 안내한다. 일부만 입력됐거나 두 값이 다르면 값을 노출·덮어쓰기 없이 중단한다. 사용자가 처음 보고한 “비밀번호 자리표시자가 있는 주소만…” 오류는 이미 두 값이 있어서 발생했고 이 안내를 보완했다. 기존 값/서로 다른 값/혼합 입력/미입력 네 사례를 임시 환경에서 검사해 파일 보존·비밀 출력 없음을 확인했다. 저장 또는 값 존재만으로 연결 성공을 처리하지 않는다.

| 용도 | 선택·WHY | 아직 확인할 것 |
| --- | --- | --- |
| 서버 런타임 | transaction pooler 우선. 짧은 서버 실행에서 연결을 공유 | 실제 주소·권한·TLS·접속 |
| migration·관리 | direct 우선. 세션을 유지하는 작업용 | 이 기기의 IPv6 지원; 불가하면 session pooler 호환성 |
| DBeaver | session pooler 연결값 안내 | 사용자 Test Connection 성공·Finish 보고 확인. 별도 수동 SQL·세부 SSL 설정의 독립 재검사는 미수행 |

실제 Connect에서 확인한 런타임은 `aws-0-ap-northeast-2.pooler.supabase.com:6543`, session은 같은 호스트의 5432다. direct 호스트는 A 레코드 없음·AAAA 1개였고 이 기기의 기본 TCP 연결은 이름 해석 오류로 실패했다. shared pooler의 두 포트는 TCP 연결 성공(비밀번호 인증 전)이므로 이번 migration 점검 주소는 **session**으로 선택했다. 이 증거를 DB 인증·SQL 성공으로 기록하지 않는다. direct IPv6 실접속과 migration 실행 호환성은 별도 미검증이다.

[공식 연결 방식](https://supabase.com/docs/guides/database/connecting-to-postgres)을 기준으로 정했다. 모드와 포트·프로젝트 참조가 어긋나면 검사가 접속 전에 실패한다. TLS 검증은 끄지 않는다.

현재 `postgres` 관리 역할로 준비하게 되는 경우 **이번 읽기 접속 점검에만 사용**한다. STEP 05에서 역할별 개발·테스트 연결을 준비하고, 기능 API에 관리 권한을 그대로 사용하지 않는다. 직접 DB 연결에 Supabase Auth 사용자 권한이 자동 적용되지는 않는다.

## 3. 연결 코드와 실행 방법

| 파일·도구 | 역할과 선택 이유 |
| --- | --- |
| `src/lib/database/config.ts` | 입력값·대상·연결 방식 확인. 값 없는 기본 접속 방지, TLS 강제, 원본 오류 숨김 |
| `src/lib/database/check.ts` | 한 연결에서 순서대로 읽기 트랜잭션 실행·결과 확인·연결 정리 |
| `src/lib/server/check-database.ts` | `server-only`로 클라이언트 오용 방지. HTTP로는 접속 정보 없이 성공/안전한 오류만 반환 |
| `scripts/check-db.ts` | `@next/env`로 앱 루트의 개발 환경을 명시해서 읽음. 터미널 검사와 Next 실행의 환경 읽기 차이를 줄임 |
| pg 8.23.1·@types/pg 8.23.1 | PostgreSQL 드라이버와 타입. Drizzle은 STEP 05에서 이 드라이버에 연결 |
| @next/env 16.4.3·tsx 4.23.15 | 설치된 Next와 같은 환경 로더, TypeScript 검사 스크립트 실행 |

현재 Supabase의 [Postgres.js 안내](https://supabase.com/docs/guides/database/postgres-js)는 shared transaction pooler와 pipelining(응답을 기다리기 전 여러 쿼리를 보내는 동작)의 조합을 주의하도록 설명한다. 이 단계는 `pg`로 쿼리를 순서대로 실행한다. `pg`의 쿼리에 `name`을 주지 않아 이름 붙인 prepared statement를 사용하지 않는다. [쿼리 안내](https://node-postgres.com/features/queries)

풀은 이번 점검에서 최대 1개이고 연결 대기는 8초, 쿼리 대기는 10초, 트랜잭션 안의 문장 제한은 5초다. 연결 실패 시 반드시 정리한다. 아직 일반 기능 API용 전역 풀·성능 검증은 아니며 STEP 05에서 수명·역할을 준비한다. [Pool 안내](https://node-postgres.com/apis/pool)

```bash
pnpm env:check                  # 형식·대상·TLS 설정 검사, 네트워크 접속 안 함
pnpm db:check                   # 런타임과 migration 주소를 각각 읽기로 검사
pnpm db:check --runtime         # 런타임 주소만
pnpm db:check --migration       # migration 주소만
```

입력 → 환경 파일 읽기 → 같은 프로젝트·모드·TLS 검증 → DB 연결 → 읽기 트랜잭션 → 결과 → 연결 정리 순서다. 아래는 핵심 흐름의 축약 예이며 실제 코드는 추가 검사와 `finally` 정리를 포함한다.

```ts
await client.query("BEGIN READ ONLY");
await client.query("SET LOCAL statement_timeout = '5s'");
const result = await client.query(
  "SELECT 1 AS connection_ok, current_database(), current_user",
);
await client.query("COMMIT");
```

성공한 CLI 결과만 프로젝트 참조·DB·역할·읽기 상태를 표시한다. 비밀번호·키·URI·원본 예외는 출력하지 않는다. `clientTlsVerified`는 인증서를 검증한 클라이언트 TLS 핸드셰이크, `backendTls`는 `pg_stat_ssl`로 본 DB 쪽 연결이다. pooler를 통하면 서로 다른 구간이므로 같은 신호로 취급하지 않는다. TLS 옵션이 연결 문자열에 의해 덮어써지지 않도록 개별 설정으로 전달한다. [pg TLS 안내](https://node-postgres.com/features/ssl)

로컬 Next.js 개발 서버에서는 `http://127.0.0.1:3001/api/dev/db-check`를 확인한다. 성공 기대값은 `200 {"status":"ok"}`다. 설정 누락·연결 실패는 비밀 없는 `503`과 분류된 오류다. 개발 환경·로컬 호스트에서만 처리하고 프로덕션은 404이며 캐시하지 않는다. `/api/health`는 계속 DB와 무관한 `{"status":"ok"}`다. 이 진단 경로를 사용자 인증이나 업무 API로 사용하지 않는다.

| 오류 분류 | 다음 확인 |
| --- | --- |
| ENV_MISSING / ENV_INVALID / TARGET_MISMATCH | 변수 존재·public/secret 구분·Connect의 프로젝트와 모드·포트·URI 인코딩 |
| DB_AUTH | DB 비밀번호·역할·프로젝트 접근. Supabase 웹 로그인 비밀번호와 구분 |
| DB_DNS / DB_NETWORK | 실제 호스트·프로젝트 상태·방화벽·IPv6. 필요하면 session 방식 검토 |
| DB_TLS / TLS_CA_FILE | 신뢰 체인·만료·공식 인증서 경로. 검증 우회로 해결하지 않음 |
| DB_PERMISSION / DB_CHECK_FAILED / DB_CONNECTION | 읽기 권한·결과·시간 초과. 로컬에서 필요한 정보만 진단 |

코드에 오류 분류가 있다고 그 장애까지 재현한 것은 아니다. 실제 확인한 누락·대상·DNS·TLS와 아직 실험하지 않은 인증 실패를 구분한다.

후속 실제 검증에서는 입력 형식 검사 통과 후 두 주소가 `SELF_SIGNED_CERT_IN_CHAIN`으로 실패했다. 프로젝트 Database Settings의 Download certificate가 가리킨 [공식 Supabase Root 2021 CA](https://supabase-downloads.s3-ap-southeast-1.amazonaws.com/prod/ssl/prod-ca-2021.crt)를 받아 `.secrets/supabase-root-2021.crt`에 두고 두 CA 경로 변수에 지정했다. 인증서의 유효기간(2021-04-28~2031-04-26)·subject/issuer를 확인했고 TLS 검증을 끄거나 시스템 신뢰 저장소를 바꾸지 않았다. 이후 `env:check`와 두 주소 `db:check`가 성공했고 Next.js `/api/dev/db-check`도 200·status ok였다. 잘못된 비밀번호 실험은 하지 않았으므로 인증 실패 재현은 미검증이다.

첫 성공에서는 client TLS true·DB 쪽 TLS false였으므로 개발 프로젝트의 Enforce SSL on incoming connections를 활성화했다. 잠시 DB 재시작 후 runtime/migration 모두 clientTlsVerified·backendTls true를 실제 쿼리로 확인했다. 설정 화면도 켜짐을 확인했다. [공식 SSL 강제 안내](https://supabase.com/docs/guides/platform/ssl-enforcement), [실제 설정 이미지](reviews/assets/step03-ssl.jpg). DBeaver에도 verify-full과 같은 공식 CA를 사용한다.

## 4. SQL Editor·DBeaver — 별도 관리 접속

개발 프로젝트의 SQL Editor에서 다음을 실행한다. 저장 데이터는 변경하지 않는다. 결과의 `connection_ok=1`, DB·역할을 앱의 CLI 결과와 비교한다. 관리 도구 역할과 앱 역할은 이후 분리되므로 역할이 무조건 같아야 하는 것은 아니다.

```sql
SELECT 1 AS connection_ok, current_database(), current_user;
```

DBeaver Community는 설치·실행했다. `New Database Connection > PostgreSQL`을 선택하고 해당 개발 프로젝트 Connect의 session 호스트·포트·DB·사용자와 **DB 비밀번호 입력란**을 채운다. 이번 주소는 host `aws-0-ap-northeast-2.pooler.supabase.com`, port `5432`, database `postgres`, username `postgres.awqctedxgsjyqkswogdu`다. SSL 서버 인증서 검증을 켜고, 추가 루트 인증서가 필요하면 프로젝트 Database 설정에서 받은 인증서를 지정한다. `Test Connection` 성공 후 위 쿼리를 실행한다. 비밀번호는 채팅으로 전달하지 않는다. [Supabase의 DBeaver 안내](https://supabase.com/docs/guides/database/dbeaver)

SQL Editor에서는 실제 `connection_ok=1`, database/role=`postgres`, Auth 스키마 존재, public 업무 테이블 0개를 확인했다. [실제 결과 이미지](reviews/assets/step03-sql.jpg). 이것은 Supabase 관리 화면의 읽기 성공이며 로컬 CLI·Next.js·DBeaver 접속은 각각 별도로 확인한다.

후속으로 사용자가 “SSL 선택할때 다운로드 했고 Test Connection 이상없어서 피니쉬 눌렀어”라고 보고해 DBeaver 접속 검사를 사용자 수행 근거로 확인했다. 기록 시각은 2026-10-27 09:51:09 +09:00이며 메시지의 정확한 전송 시각은 제공되지 않았다. 별도 수동 SQL과 세부 SSL 설정의 독립 재검사를 수행한 것으로 확대하지 않는다. 관리 접속과 Next.js 접속은 각각의 확인 근거로 기록한다.

## 5. 분리 테스트·Data API 준비

테스트 대상은 개발·운영과 분리한다. Docker 실행 후 `community-lab-test` 전용 로컬 Supabase를 준비했다. 실제 API54321·DB54322·메일함54324의 모든 공개 포트가 127.0.0.1인지 검사했다. PostgreSQL·Auth·게이트웨이·PostgREST·로컬 메일함 5개 서비스를 기동했고 DB 읽기·Auth 스키마·Auth 설정 HTTP200·중지/재기동 후 재검증까지 성공했다. 실제 사용자 로그인·업무 권한·migration 검증은 해당 기능에서 수행한다.

실제 테스트값은 `.env.test.local`에 따로 보관하고 개발 DB로 자동 대체하지 않는다. `db:check`는 개발 전용, `test:env:check`는 NODE_ENV=test·전용 프로젝트 표시·정확한 loopback/포트를 요구한다. 개발 주소를 잘못 넣으면 접속 전에 거부하는 검사도 통과했다. `test:env:start/sync`는 CLI의 서버 키 전체 출력을 전달하지 않고 필요한 공개키·DB 주소만 0600 파일에 반영한다. 상세 실행·역할·실제 검증은 [테스트 기반 안내](../test-infra/README.md)를 따른다.

Data API는 HTTP로 DB를 다루는 경로이고 Drizzle 직접 연결과 권한 경계가 다르다. 실제 프로젝트의 Data API는 활성, exposed schemas는 `graphql_public`·`public`, Extra search path는 `public`·`extensions`, 최대 행 1000, 테이블 0개, 노출 함수 0/1로 확인했다. 설정은 조사만 했고 Harden Data API·스키마 변경·권한 변경 SQL은 실행하지 않았다.

SQL Editor의 `pg_default_acl` 조회에서 postgres가 만드는 public 테이블의 기본 ACL은 postgres 전체, anon/authenticated/service_role에 `Dxtm`이 남아 있었다. `D`=TRUNCATE, `x`=REFERENCES, `t`=TRIGGER, `m`=MAINTAIN이며 SELECT/INSERT/UPDATE/DELETE는 자동 부여되지 않았다. postgres의 함수·sequence 기본 권한은 postgres만이었다. supabase_admin 소유 기본 권한은 따로 존재하며 이를 앱 소유 기본값으로 혼동하지 않는다. RLS 트리거가 있어도 이 권한 모두가 사라지는 것은 아니다. 업무 테이블이 아직 없으므로 실제 행 접근·거부 사례는 해당 기능에서 검사한다.

권한 약어는 [PostgreSQL 17 권한 문서](https://www.postgresql.org/docs/17/ddl-priv.html), 트리거 enabled `O`의 origin/local 의미는 [이벤트 트리거 카탈로그](https://www.postgresql.org/docs/17/catalog-pg-event-trigger.html)와 대조했다. 기본 ACL이 남아 있다는 조사 결과와 실제 새 테이블의 행 접근 검증은 구분한다.

실제 publishable key를 `apikey` 헤더에 넣어 Auth `/auth/v1/settings` 200, 의도적으로 잘못된 키로 같은 요청 401을 확인했다. Data API에서는 존재하지 않는 점검용 테이블 이름으로 읽기를 요청해 404·`PGRST205`를 확인했고 테이블은 만들지 않았다. 루트 OpenAPI 주소 `/rest/v1/`는 401이었으며 공개키로 모든 관리·메타데이터 경로를 열 수 있다고 가정하지 않는다. 이 검사는 서비스 도달·키 구분의 근거이고 실제 로그인·업무 데이터 권한 검증은 아니다. 추가 secret 키를 가져와 우회하지 않았다.

기능에서 테이블을 처음 만들 때 migration에 필요한 GRANT·REVOKE(접근 권한 부여·회수)와 RLS(행별 접근 제한)를 함께 검토·적용한다. publishable key·RLS만으로 직접 DB 접속까지 보호한다고 가정하지 않는다. 이 단계에서 임의 테이블이나 전체 테이블 대상 권한 변경은 실행하지 않는다. [Data API 보안 안내](https://supabase.com/docs/guides/api/securing-your-api)

## 학습 확인

1. **환경값을 입력했으면 연결도 성공한 건가요?** 형식 검사는 입력만 검증한다. 실제 서버에서 쿼리가 성공해야 네트워크·인증·대상까지 확인한 것이다. CLI와 Next.js도 각각 실행한다.
2. **왜 런타임과 migration 주소를 나누나요?** 짧은 서버 실행의 연결 공유와 세션을 유지하는 관리 작업의 요구가 다르다. 연결 방식과 실행 역할도 별개이며 STEP 05에서 역할을 나눈다.

설명을 제공한 상태이며 사용자의 이해·복습 완료는 확인하지 않았다.
