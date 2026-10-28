# Community Lab 학습 방식

프론트엔드 경험을 바탕으로 백엔드를 직접 설계하고 구현하는 학습 프로젝트다. 한국어로 대화하고, 사용자의 현재 요청과 결정부터 따른다.

## 함께 작업하는 방법

- 사용자가 요청한 작은 범위만 다룬다. 질문에는 먼저 답하고, 설명 요청을 구현 허가로 해석하지 않는다.
- 작업 전에 목적·이유·이번에 확인할 결과를 짧게 설명한다. 낯선 용어는 처음 사용할 때 풀어 쓴다.
- 사용자가 생각하고 선택할 여지를 둔다. 요청하기 전에 전체 설계·정답·구현을 한꺼번에 완성하지 않는다.
- 사용자의 질문에 맞춰 필요한 예제와 대안을 설명한다. “왜 필요한가”, “다르게 하면 어떤가”, “무엇이 달라지는가”를 실제 입력과 결과로 연결한다.
- 설명을 제공했다고 이해가 끝났다고 판단하지 않는다. 고정된 퀴즈·면접 질문·승인 단계는 만들지 않는다.
- 현재 요청이 끝나면 결과를 보여 주고 멈춘다. 다음 기능이나 구현 단계는 사용자의 다음 요청으로 시작한다.

## 기능을 배울 때 참고할 흐름

사용자 행동과 필요한 데이터 → 스키마·관계·제약 조건의 이유 → migration으로 테이블 적용·DBeaver 확인 → Route Handler(요청·인증·응답을 맡는 컨트롤러)와 서비스(업무 규칙) → Postman으로 정상·중요 실패 요청과 DB 변화 확인 → 기존 프론트 연결.

- 이 흐름은 대화의 참고 순서다. 한 번의 요청으로 전체를 자동 진행하거나, 미리 모든 기능의 테이블을 만들지 않는다.
- DBeaver는 테이블 생성 직후와 API 요청 전후에 함께 확인한다. API 응답·DB 저장·화면 결과를 구분한다.
- 도구·함수·추상화는 현재 문제에 필요할 때 도입하고 역할과 선택 이유를 설명한다.
- 기존 UI와 Google·Supabase 로그인은 유지한다. 아직 구현하지 않은 기능의 저장 성공을 흉내 내지 않는다.

## 코드·DB·검증

- 기본 스택은 Next.js App Router·TypeScript·Route Handlers, Supabase PostgreSQL·Auth, Drizzle이다.
- 먼저 실제 파일·package.json·Git 변경 상태를 확인한다. 사용자 변경과 기존 staged 내용을 보존한다.
- 입력·로그인·대상 권한은 서버에서 검증한다. DB 직접 연결과 Supabase Data API의 권한 경계를 구분한다.
- DB 변경은 migration으로 남긴다. 새 테이블의 필요한 접근 제한도 함께 다룬다. 데이터 삭제는 요청 범위와 복구 방법을 확인하고 수행한다.
- 비밀번호·토큰·서버 연결 문자열은 코드·문서·Git·로그·브라우저에 노출하지 않는다. 환경 파일의 Git 제외 여부를 확인한다.
- 현재 변경에 필요한 타입·린트·빌드·직접 동작을 검사한다. 자동 테스트는 위험과 필요에 맞게 추가하며, 사용자가 이해하지 못한 큰 테스트 환경을 미리 만들지 않는다.
- 실행한 검사와 통과 결과를 구분해서 알린다. 실행하지 못한 검사·실제 계정 로그인은 미검증으로 남긴다.
- 커밋·push는 사용자가 요청하거나 해당 범위를 확인하고 허용한 경우에 수행한다. 관련 파일만 stage하며 강제 push·정책 우회는 하지 않는다.

## 현재 시작점

화면과 Google·Supabase 인증, DB 연결 도구만 준비한 상태에서 시작한다. 프로필 구현은 아직 시작하지 않는다. 현재 상태와 실행 방법은 README.md에 짧게 유지하고, 요청 없이 큰 플랜·검토 자료·진행 문서를 다시 만들지 않는다.

## Next.js 생성기 지침

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
