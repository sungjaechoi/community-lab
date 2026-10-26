# Community Lab

공개 글·댓글로 교류하고 친구와 쪽지·1대1 채팅을 나누는 학습용 커뮤니티다. 화면을 서버 입력·권한 검사와 PostgreSQL 저장까지 연결하고, 선택 이유와 검증 근거를 남긴다.

STEP 01 정책과 STEP 02 환경 확인·첫 커밋·push를 마쳤고 **공통 UI 확인을 기다리고 있다**. 메뉴·모바일 배치·다섯 준비 화면·기본 입력/상태 요소를 검증했으며 UI 커밋은 확인 후 진행한다. 실제 로그인·DB·게시글·친구·쪽지·채팅 기능은 후속 범위다. 현재 위치는 [진행 기록](docs/work-status.md)을 따른다.

## 실행

Node.js 22.15.1(`.nvmrc`)과 pnpm 10.29.3(`packageManager`)으로 확인했다. 실제 비밀값 없이 실행할 수 있다.

```bash
pnpm install --frozen-lockfile
pnpm dev --hostname 127.0.0.1 --port 3001
```

- 화면: [http://127.0.0.1:3001/posts](http://127.0.0.1:3001/posts), 루트는 게시글로 이동
- 개발 전용 요소 검토: [http://127.0.0.1:3001/ui-preview](http://127.0.0.1:3001/ui-preview), 프로덕션에서는 404
- 서버 상태: [http://127.0.0.1:3001/api/health](http://127.0.0.1:3001/api/health) → `200 {"status":"ok"}`

3000번은 작업 당시 다른 프로세스가 사용하고 있어 3001번으로 검증했다. health 성공은 HTTP 서버 경로의 응답이며 DB 연결 성공을 뜻하지 않는다.

## 검증

```bash
pnpm typecheck
pnpm lint
pnpm build
```

실제 결과와 알려진 제한은 [공통 UI 검토 자료](docs/reviews/step02-ui.md)와 [환경 검토 이력](docs/reviews/step02-env.md)에 있다. `typecheck`는 경로 타입 생성 후 TypeScript 검사, `lint`는 ESLint 검사, `build`는 배포용 결과 생성이다. 빌드와 린트는 따로 실행한다.

## 문서와 설정

- [정식 플랜](docs/work-plan.md) · [요구사항](docs/requirements.md) · [화면 목록](docs/screens.md) · [권한 정책](docs/authorization.md)
- [공통 UI·WHY](docs/ui/foundation.md) · [환경 설정·WHY·계정 인계](docs/development-setup.md) · [기술 선택](docs/decisions/0001-tech-stack.md)
- `.env.example`은 공개할 수 있는 빈 예시다. STEP 02에서는 복사할 필요가 없다. STEP 03에서 실제 값은 Git에서 제외되는 `.env.local`에 둔다.

학습은 기능에 필요한 테이블을 그때 설계·생성하고 ERD의 변경 전후·이유·SQL·검증을 함께 남기는 방식으로 진행한다. STEP 04·05는 ERD 읽기·기록 기준과 도구 준비이며 업무 테이블은 STEP 06 로그인부터 추가한다. [학습 순서 개정 기록](docs/plan-changes/2026-10-26-feature-erd.md)에 범위와 기존 ID 대응을 남겼다.

주요 기술은 Next.js App Router·TypeScript·Tailwind CSS이며 PostgreSQL·Drizzle·Supabase Auth/Realtime은 후속 단계에서 연결한다. DB 연결 문자열과 서버 비밀키는 브라우저 코드에 넣지 않는다.
