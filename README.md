# Community Lab

완성된 프론트엔드를 바탕으로 백엔드를 직접 설계하고 연결하는 학습용 커뮤니티다. 작은 질문과 요청에 맞춰 필요한 데이터·규칙·API를 하나씩 만든다.

## 현재 상태

- 기존 화면·스타일과 Google·Supabase 로그인·로그아웃·로그인 상태 유지를 남겼다.
- 로그인은 Supabase Auth만 사용한다. 세션의 `user.id`는 Auth 사용자 ID이고, `displayName`은 Google 계정 정보에서 가져온 표시명이다. 서비스 프로필을 생성하거나 저장하지 않는다.
- 프로필·게시글 백엔드와 기존 migration 이력을 제거했다. 개발 DB의 `public` 업무 테이블은 0개이며, Supabase 관리형 Auth 사용자·Google 연결·기존 DB 접속 설정은 유지한다.
- 게시글 목록·상세·작성·수정 화면은 API 연결 전 미리보기다. 저장·삭제는 비활성화되어 있으며 데이터가 저장된 것처럼 표시하지 않는다.
- 기존 STEP 문서·검토 자료·기능 테스트를 정리했다. 프로필 구현은 아직 시작하지 않았으며 다음 요청을 기다린다.

## 실행

앱 폴더에서 Node.js 22.15.1과 pnpm 10.29.3을 사용한다.

```bash
pnpm install --frozen-lockfile
pnpm dev --hostname 127.0.0.1 --port 3001
```

- [게시글 화면](http://localhost:3001/posts) · [로그인](http://localhost:3001/login)
- [작성 미리보기](http://localhost:3001/posts/new)
- [상세 미리보기](http://localhost:3001/posts/00000000-0000-4000-8000-000000000000) · [수정 미리보기](http://localhost:3001/posts/00000000-0000-4000-8000-000000000000/edit)
- [공통 UI 미리보기](http://localhost:3001/ui-preview): 개발 실행에서 확인
- [서버 상태](http://localhost:3001/api/health): DB 연결 검사와 별개

기존 `.env.local`과 인증서를 유지한다. 새로 구성할 때는 `.env.example`을 참고하며 실제 비밀값은 Git에 넣지 않는다. Google 자격 증명은 Supabase Google Provider 설정에 보관하고 브라우저 코드에 넣지 않는다.

## 확인 명령

```bash
pnpm typecheck
pnpm lint
pnpm build
pnpm env:check
pnpm db:check
```

`env:check`는 설정 형식을, `db:check`는 실제 DB 읽기 접속을 검사한다. Google 로그인은 [로그인 화면](http://localhost:3001/login)에서 따로 확인한다. 2026-10-28 정리 후 위 명령을 모두 통과했다. 실제 브라우저에서 기존 Google 계정의 로그아웃·재로그인·게시글 화면 복귀도 확인했으며, 이 과정에서 프로필 테이블이 생성되지 않는 것을 확인했다. 개발·프로덕션 HTTP 검사 각 26개와 360px 모바일 화면·저장/삭제 비활성 상태를 확인했다.

DB 연결과 기본 Drizzle 준비는 유지한다. 다음 기능은 필요한 사용자 행동부터 이야기하고, 스키마·제약 조건·테이블·API·Postman·DBeaver·프론트 연결을 요청한 범위만 다룬다. 작업 규칙은 [AGENTS.md](AGENTS.md)에 있다.

정리 전 소스와 DB의 로컬 복구 자료: `/Users/sungjaechoi/ToyProject/community-lab-reset-backups/20261028-143300`.
