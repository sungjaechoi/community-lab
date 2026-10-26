# Community Lab

공개 글·댓글로 교류하고 친구와 쪽지·1대1 채팅을 나누는 학습용 커뮤니티다. 화면을 서버 입력·권한 검사와 PostgreSQL 저장까지 연결하고, 선택 이유와 검증 근거를 남긴다.

현재 STEP 01 정책 확인·기록을 마쳤고 STEP 02 환경 검토를 기다리고 있다. 실행 가능한 범위는 **기본 준비 화면과 DB를 사용하지 않는 health API**다. 로그인·DB·게시글·친구·쪽지·채팅은 아직 구현하지 않았다. 현재 위치는 [진행 기록](docs/work-status.md)을 따른다.

## 실행

Node.js 22.15.1(`.nvmrc`)과 pnpm 10.29.3(`packageManager`)으로 확인했다. 실제 비밀값 없이 실행할 수 있다.

```bash
pnpm install --frozen-lockfile
pnpm dev --hostname 127.0.0.1 --port 3001
```

- 화면: [http://127.0.0.1:3001](http://127.0.0.1:3001)
- 서버 상태: [http://127.0.0.1:3001/api/health](http://127.0.0.1:3001/api/health) → `200 {"status":"ok"}`

3000번은 작업 당시 다른 프로세스가 사용하고 있어 3001번으로 검증했다. health 성공은 HTTP 서버 경로의 응답이며 DB 연결 성공을 뜻하지 않는다.

## 검증

```bash
pnpm typecheck
pnpm lint
pnpm build
```

실제 결과와 알려진 제한은 [환경 검토 자료](docs/reviews/step02-env.md)에 있다. `typecheck`는 경로 타입 생성 후 TypeScript 검사, `lint`는 ESLint 검사, `build`는 배포용 결과 생성이다. 빌드와 린트는 따로 실행한다.

## 문서와 설정

- [정식 플랜](docs/work-plan.md) · [요구사항](docs/requirements.md) · [화면 목록](docs/screens.md) · [권한 정책](docs/authorization.md)
- [환경 설정·WHY·계정 인계](docs/development-setup.md) · [기술 선택](docs/decisions/0001-tech-stack.md)
- `.env.example`은 공개할 수 있는 빈 예시다. STEP 02에서는 복사할 필요가 없다. STEP 03에서 실제 값은 Git에서 제외되는 `.env.local`에 둔다.

주요 기술은 Next.js App Router·TypeScript·Tailwind CSS이며 PostgreSQL·Drizzle·Supabase Auth/Realtime은 후속 단계에서 연결한다. DB 연결 문자열과 서버 비밀키는 브라우저 코드에 넣지 않는다.
