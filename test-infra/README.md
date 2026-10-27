# 분리 테스트용 로컬 Supabase

WHY: 이후 Auth·권한·제약·migration 검사를 개발 DB와 다른 저장 공간에서 실행하기 위한 기반이다. 현재 준비한 것은 PostgreSQL·관리형 Auth·Data API·로컬 메일함이며 업무 테이블은 각 기능에서 추가한다.

| 항목 | 실제 선택·이유 |
| --- | --- |
| CLI | Supabase 2.122.0. 현재 검증한 버전을 고정해 설정 해석을 재현 |
| 실행 기반 | Docker Desktop·엔진 27.3.1. 계정·클라우드 프로젝트 추가 없이 별도 DB/Auth 실행 |
| 설정 | [supabase/config.toml](supabase/config.toml), CLI project_id `community-lab-test` |
| 저장/네트워크 | `community-lab-test` 전용 컨테이너·볼륨·네트워크. 호스트 바인딩 127.0.0.1 실제 확인 |
| API / DB | http://127.0.0.1:54321 / 127.0.0.1:54322 |
| 로컬 메일함 | http://127.0.0.1:54324. 외부 수신자에게 메일 발송하지 않는 테스트 도구 |
| Auth 사이트 기준 | http://127.0.0.1:3003. 후속 테스트 앱용 값이며 현재 이 포트의 앱 서버를 실행한 것은 아님 |
| 제외 서비스 | Studio·Storage·Realtime·Edge Runtime·Analytics 등. 현재 DB/Auth 검사에 필요한 서비스만 기동 |
| 환경 파일 | 앱 루트 `.env.test.local`, 0600·Git 제외. CLI 상태에서 필요한 공개키·DB 주소만 선택해서 저장 |

## 준비와 실행

Docker Desktop을 실행한다. 현재 기기에서는 Homebrew가 오래된 Command Line Tools로 CLI 설치를 거부해, [공식 CLI v2.122.0 배포](https://github.com/supabase/cli/releases/tag/v2.122.0)의 macOS ARM64 압축 파일을 받아 공식 `checksums.txt`와 SHA-256을 대조한 뒤 앱 `.tools/bin/supabase`에 설치했다. `.tools/`는 Git 제외다. 버전·체크섬 확인 없는 파일은 실행하지 않는다.

다른 기기에서는 [공식 설치 안내](https://supabase.com/docs/guides/local-development/cli/getting-started)에 따라 **2.122.0**을 준비하면 된다. 실행 도구는 앱의 `.tools/bin/supabase`, 그다음 PATH의 `supabase`를 찾고 버전을 확인한다. Docker 실행 확인은 `docker info`, CLI 버전은 `.tools/bin/supabase --version` 또는 `supabase --version`이다.

앱 루트에서 실행한다.

```bash
pnpm test:env:start
pnpm test:env:check
pnpm test:env:stop
```

- `start`: 전용 project_id·CLI 버전·네트워크 소유/바인딩을 확인하고 서비스를 기동한다. 처음에는 이미지 다운로드가 필요하다. 기본 CLI의 서버 키 출력을 메모리에서 처리해 터미널로 전달하지 않는다.
- `check`: `NODE_ENV=test`로 `.env.test.local`을 읽고 프로젝트 표시·API/DB의 정확한 로컬 주소를 먼저 검증한다. 읽기 트랜잭션으로 DB·Auth 스키마·역할을 확인한 뒤 Auth 설정 GET을 실행한다.
- `stop`: 지정한 로컬 프로젝트의 서비스를 중지한다. 클라우드 프로젝트는 이 명령의 대상이 아니다.
- 필요하면 `pnpm test:env:sync`로 실행 중인 전용 스택의 필요한 환경값을 다시 반영한다. 다른 프로젝트 표시의 기존 파일은 보존하고 거부한다. 추가로 받은 `SECRET_KEY`·`SERVICE_ROLE_KEY`·`JWT_SECRET`은 환경 파일에 저장하지 않는다.

정상 검사 출력은 환경 `local-test`, DB/역할 `postgres`, `authSchemaExists=true`, `authHttpStatus=200`, `readOnly=true`다. 키·비밀번호·접속 URI는 출력하지 않는다. 테스트 주소 누락·잘못된 포트·개발 DB 주소는 접속 전에 거부하며 `.env.local`로 대체하지 않는다.

로컬 포트는 전용 loopback에만 바인딩하고 DB 드라이버는 이 로컬 대상에서 SSL을 사용하지 않는다. 클라우드 개발 DB에는 공식 CA·서버 인증서 검증·SSL 강제를 적용했다. 두 설정의 적용 범위는 코드에서 분리했다. 네트워크 방식은 [Docker의 기본 호스트 바인딩 옵션](https://docs.docker.com/engine/network/drivers/bridge/#default-host-binding-address)에 근거한다.

## 실제 검증과 다음 학습

기동 후 5개 컨테이너의 실제 공개 포트가 모두 127.0.0.1인지 검사했고, 테스트 DB 읽기와 Auth 설정 GET 200을 확인했다. 개발 DB 주소를 잘못 넣는 경우를 포함한 설정 검사 10개가 통과했다. 실제 중지·재기동 결과는 [STEP 03 검토 자료](../docs/reviews/step03.md)에 기록한다.

현재는 로컬 Auth의 관리형 스키마·설정 조회까지만 검증했다. 테스트 사용자 로그인, Google OAuth, 업무 권한/RLS·제약·동시성 검사는 해당 기능에서 실제 모델과 함께 수행한다. Drizzle 도구는 STEP 05, 첫 업무 테이블 profiles는 STEP 06에서 시작한다.
