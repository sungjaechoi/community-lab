# 0001 · 기본 기술 선택과 경계

- 작업: `01-06` · 작성일: 2026-10-26 (Asia/Seoul)
- 상태: STEP 01 정책 확인·`01-RECORD` 완료. 사용자가 P-01~P-08을 초안대로 확인했으며 플랜의 기본 스택과 아래 설계 근거를 유지한다. 최초 검토 이력·실제 응답·기록 시각은 [확인 기록](../reviews/step01.md)에 보존했다.
- STEP 01 작성 당시 구현 상태: 앱·DB·인증·실시간 연결 미구현. 이 결정 문서 자체는 패키지·연결 성공의 증거가 아니다. 이후 기본 앱 생성·환경 검증을 포함한 현재 실제 상태는 앱 docs/work-status.md를 따른다.

## 목적과 문제

프론트엔드 경험에서 출발해 **요청 입력 → 서버 검증 → 데이터 처리 → 화면 결과**를 한 흐름으로 배우는 것이 목적이다. 화면만 만들거나 관리형 서비스 호출만 연결하는 수준을 넘어, 누가 어떤 데이터를 바꿀 수 있는지와 실패 시 데이터가 어떻게 유지되는지 설명할 수 있어야 한다.

기술 이름을 늘리는 대신 게시글·댓글·친구·쪽지·1대1 채팅이라는 현재 문제에 필요한 도구를 선택한다. 제품 정책 초안의 기준은 [요구사항](../requirements.md)과 [권한 정책](../authorization.md)이며 이 문서가 별도의 권한을 추가하지 않는다.

## 선택과 WHY

| 선택 | 맡는 일 | 이 프로젝트에서의 WHY | 비교한 대안과 한계 |
| --- | --- | --- | --- |
| Next.js App Router·React | 페이지·공통 레이아웃과 화면 구성 | 익숙한 React에서 화면과 서버 요청의 연결을 학습한다 | 별도 React SPA도 가능하지만 서버와 배포 단위를 따로 관리해야 한다. Next.js에서도 브라우저 코드와 서버 코드는 구분해야 한다 |
| TypeScript | 코드에서 값의 형태를 표현하고 잘못된 사용을 개발 중 발견 | UI 입력과 API 응답의 형태를 읽기 쉽게 공유한다 | JavaScript보다 선언이 늘어난다. 타입 선언은 외부 요청의 실제 값을 검사하지 않으므로 서버 입력 검증은 별도다 |
| Route Handlers | URL별 HTTP 요청·응답 처리 | 한 저장소에서 인증·입력·대상 권한 검증과 API 계약을 명확히 연습한다 | Express를 별도 서버로 둘 수 있으나 초기 배포·설정이 늘어난다. API 전용 규모나 독립 배포 요구가 생기면 재검토한다 |
| Supabase PostgreSQL | 관계가 있는 업무 데이터를 저장 | 글–댓글, 사용자–친구, 방–메시지 관계와 DB 제약·트랜잭션을 학습한다 | 문서형 DB도 가능하지만 현재 목표인 SQL·관계·제약의 학습 경로와 다르다. DB가 서버의 모든 업무 권한 검사를 대신하지는 않는다 |
| Drizzle | TypeScript에서 SQL에 가까운 조회·스키마·migration 관리 | 코드를 작성하면서 생성 SQL과 실제 DB 제약을 함께 읽는다 | 직접 SQL은 동작이 명확하지만 반복 매핑이 늘고, Prisma 같은 다른 ORM도 가능하다. 선택 이유는 현재 SQL 학습 목표이며 성능 우위를 측정했다는 뜻은 아니다 |
| Supabase Auth | Google 로그인과 인증 세션 관리 | 로그인 기반을 직접 새로 만들지 않고 서버에서 신원을 확인하고 권한을 적용하는 경험에 집중한다 | 다른 인증 도구나 자체 구현도 가능하다. Google·Supabase 설정과 callback 검증은 별도로 필요하며, 로그인 성공이 글 수정 권한까지 주지는 않는다 |
| Supabase Realtime private Broadcast | 저장된 채팅 변경을 허용된 참여자에게 전달 | 저장과 실시간 표시를 구분하고 구독 권한·중복·재연결을 학습한다 | 주기적 조회는 단순하지만 요청과 지연이 늘고, 자체 WebSocket 서버는 연결 운영이 추가된다. 이벤트만으로 전체 이력이나 무누락 복구를 보장하지 않는다 |

Route Handler는 Web `Request`·`Response`를 사용해 HTTP 요청을 처리한다. 이 구조를 프로젝트의 API 입구로 쓰는 것은 위 학습 목표에 따른 선택이다. [Next.js Route Handlers](https://nextjs.org/docs/app/api-reference/file-conventions/route)

Drizzle은 TypeScript 스키마와 SQL에 가까운 조회 방식을 제공한다. ORM은 “코드의 객체와 DB 데이터를 이어 주는 도구”, migration은 “DB 구조를 바꾸는 순서 있는 변경 파일”을 뜻한다. 생성 파일도 읽고 필요한 권한 SQL을 함께 검토한다. [Drizzle 개요](https://orm.drizzle.team/docs/overview)

PostgreSQL의 FK(외래 키)는 관계 대상의 존재를, UNIQUE는 중복 금지를, CHECK는 값의 조건을 표현한다. 친구 중복이나 잘못된 부모 댓글을 사전 조회만으로 막지 않고 DB 제약과 서버 검증을 함께 설계한다. 트랜잭션은 여러 변경을 모두 성공시키거나 모두 취소하는 묶음이다. [PostgreSQL 제약조건](https://www.postgresql.org/docs/current/ddl-constraints.html)

Supabase Auth는 인증 SDK와 API를 제공하며 Google 로그인을 지원한다. 서버 렌더링 환경의 세션 설정과 사용 중인 SDK에 맞는 신원 검증 방식은 STEP 06에서 실제로 확인한다. [Supabase Auth](https://supabase.com/docs/guides/auth), [Google 로그인](https://supabase.com/docs/guides/auth/social-sign-in/auth-google), [서버 인증 클라이언트](https://supabase.com/docs/guides/auth/server-side/creating-a-client)

## 브라우저·서버·DB의 역할

업무 데이터의 조회·변경을 Next.js API로 모으고, 브라우저의 Supabase 클라이언트는 Auth와 허용된 Realtime 구독에 사용한다. 이 사용 범위는 STEP 01에서 검토한 설계 기준이며 실제 경로별 권한·연결은 후속 단계에서 검증한다.

```text
브라우저 폼
  → Next.js Route Handler: 입력·로그인·대상 권한 검증
  → 서버 업무 처리 + Drizzle
  → PostgreSQL: 관계·중복·트랜잭션 검증과 저장
  → API 응답
  → 화면 성공·오류 표시

저장된 채팅 변경 → DB trigger → private Broadcast → 참여자의 화면 갱신
재접속 시 화면 → HTTP 이력 조회 → 저장된 message.id로 대조·중복 제거
```

| 경로 | 반드시 확인할 경계 |
| --- | --- |
| 브라우저 → Next.js API | 버튼 표시와 관계없이 서버가 신원·입력·작성자/수신자/참여자 권한을 확인한다. 요청 본문의 `authorId`를 신원으로 믿지 않는다 |
| 서버 → Drizzle → DB | 직접 DB 연결 역할의 권한을 조사한다. Supabase Auth 사용자의 신원이 연결에 자동 적용된다고 가정하지 않으며, 허용된 대상 조건을 서버에서 적용한다 |
| 브라우저 → Supabase Data API | 직접 테이블을 조회하는 별도 경로다. 기본안은 업무 테이블의 직접 접근을 허용하지 않고, 실제 노출 스키마·GRANT·REVOKE·RLS를 STEP 03·05·08에서 확인한다 |
| 브라우저 → Realtime | DB 테이블 접근 정책과 별도로 방별 구독 권한을 확인한다. 참여자만 private 채널을 수신하도록 구성하고 비참여자 C의 실제 거부를 검증한다 |

RLS(Row Level Security)는 DB의 행마다 접근 조건을 적용하는 기능이다. API 서버가 사용한 DB 역할에 따라 동작이 달라질 수 있으므로 “RLS를 켰으니 모든 경로가 안전하다”고 결론 내리지 않는다. DB 직접 연결, Data API, Realtime 각각을 검증한다. [Supabase RLS](https://supabase.com/docs/guides/database/postgres/row-level-security)

## 채팅에서 저장과 전달을 나누는 이유

플랜 STEP 11의 기본 방식은 **HTTP API가 메시지를 DB에 저장한 뒤, DB trigger가 `realtime.broadcast_changes()`로 변경을 전달**하는 것이다. 채팅 기록의 기준은 업무 테이블이며 Realtime 이벤트를 받았다는 사실을 저장 성공으로 대신하지 않는다. [DB 변경 Broadcast](https://supabase.com/docs/guides/realtime/subscribing-to-database-changes)

private 채널에는 `realtime.messages`의 수신 정책과 인증된 클라이언트 설정이 함께 필요하다. `private: true`만 지정해서 완료로 표시하지 않는다. 프로젝트의 공개 채널 허용 설정도 함께 확인한다. 공식 예제의 “모든 로그인 사용자 허용” 조건을 우리 방별 참여자 정책으로 그대로 사용하지 않는다. [Realtime Authorization](https://supabase.com/docs/guides/realtime/authorization)

재시도에는 클라이언트의 같은 전송 요청을 구분하는 ID, 화면 중복 제거에는 저장된 서버 메시지 ID를 사용한다. 재연결 후 이력과 이벤트를 병합하며 복구 범위는 실제로 시험한 조건만 주장한다. 정확한 전송·충돌·복구 계약과 검증은 `11-API-01` 이후 작성한다.

## STEP 01 작성 당시의 미결정과 검증 한계

- 패키지 버전·Node.js·패키지 매니저·스타일 구현 방식: STEP 02에서 환경과 생성기 옵션을 확인한 뒤 기록한다.
- Supabase 프로젝트·DB 역할·런타임/migration 연결·비밀값 입력: STEP 03·05에서 각각 준비와 연결 성공을 구분한다.
- 스키마·SQL·인덱스·성능 수치: STEP 04 이후 실제 설계·검증으로 정한다. 이 문서에 측정 결과는 없다.
- Auth·DB·Data API·Realtime 연결과 권한 검증: 모두 미실행이다. 공식 문서 읽기는 서비스 연결이나 테스트 성공의 증거가 아니다.
- 배포·CI 도구는 원안의 Vercel·GitHub·Vitest·Playwright·GitHub Actions를 따르되 현재 단계에서 설치·계정 작업을 진행하지 않는다.

2026-10-26에 플랜 STEP 01·11과 위 공식 문서의 역할·권한 설명을 대조했다. 이 문서의 선택은 프로젝트 판단이고, 서비스 기능 설명은 연결한 공식 문서에 근거한다. 구현 시점에 설치 버전과 실제 서비스 설정을 다시 확인한다.

## 면접 질문과 답변의 핵심

1. **왜 별도 Express 서버 대신 Route Handlers를 선택했나요?** 화면과 API를 한 저장소에서 만들며 요청·검증·DB 처리 경계를 배우는 현재 규모에 맞는다. 독립 배포나 서버 운영이 필요해지면 별도 서버를 재검토한다. 한 저장소라는 이유로 브라우저와 서버의 권한 경계를 합치지는 않는다.
2. **Supabase Auth와 RLS를 사용하면 서버 권한 검사를 생략해도 되나요?** 인증은 신원 확인이고 인가는 특정 대상에 대한 행동 허용이다. Drizzle 직접 연결과 Data API·Realtime의 경계가 다르므로 서버의 대상 권한 검사와 경로별 DB·구독 검증이 필요하다.

위 설명을 문서로 제공했으며 사용자의 이해 완료 여부는 확인하지 않았다.
